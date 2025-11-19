#!/usr/bin/env node
/**
 * Stress Load Test
 * Pushes the system to its limits to find breaking points
 *
 * Target: Progressive load up to 3000+ connections
 * Duration: 10 minutes
 * Goal: Identify system limits and failure modes
 */

require("dotenv").config();
const io = require("socket.io-client");
const fs = require("fs");
const path = require("path");

// Configuration
const SOCKET_URL = process.env.SOCKET_URL || "http://localhost:3001";
const MAX_CLIENTS = parseInt(process.env.MAX_CLIENTS || "3000");
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "100");
const BATCH_DELAY = parseInt(process.env.BATCH_DELAY || "5000"); // 5 seconds between batches
const STRESS_DURATION = parseInt(process.env.STRESS_DURATION || "600000"); // 10 minutes

// Metrics
const metrics = {
  testName: "Stress Load Test",
  startTime: new Date().toISOString(),
  config: {
    targetUrl: SOCKET_URL,
    maxClients: MAX_CLIENTS,
    batchSize: BATCH_SIZE,
    batchDelay: BATCH_DELAY,
    testDuration: STRESS_DURATION
  },
  batches: [],
  connections: {
    attempted: 0,
    successful: 0,
    failed: 0,
    current: 0,
    peak: 0
  },
  rooms: {
    created: 0,
    joined: 0,
    errors: 0
  },
  latency: {
    connect: [],
    createRoom: [],
    roomOperation: []
  },
  errors: [],
  systemBreakpoint: null,
  performanceDegradation: []
};

const clients = [];
let batchNumber = 0;

function calculateStats(arr) {
  if (arr.length === 0) return { min: 0, max: 0, avg: 0, p95: 0, p99: 0 };

  const sorted = [...arr].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: sum / sorted.length,
    median: sorted[Math.floor(sorted.length / 2)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)]
  };
}

function detectPerformanceDegradation(batchMetrics) {
  // Check if latency is significantly higher than previous batches
  const recentBatches = metrics.batches.slice(-5);
  if (recentBatches.length < 3) return false;

  const avgLatencies = recentBatches.map(b => b.avgConnectLatency);
  const currentLatency = batchMetrics.avgConnectLatency;

  const previousAvg = avgLatencies.slice(0, -1).reduce((a, b) => a + b, 0) / (avgLatencies.length - 1);

  // If current latency is 50% higher than previous average, flag degradation
  if (currentLatency > previousAvg * 1.5) {
    metrics.performanceDegradation.push({
      batchNumber: batchMetrics.batchNumber,
      totalClients: metrics.connections.current,
      currentLatency,
      previousAvg,
      degradationPercent: ((currentLatency - previousAvg) / previousAvg * 100).toFixed(2)
    });
    return true;
  }

  return false;
}

async function createClientBatch(startId, count) {
  batchNumber++;
  const batchMetrics = {
    batchNumber,
    startId,
    count,
    attempted: 0,
    successful: 0,
    failed: 0,
    startTime: Date.now(),
    connectLatencies: []
  };

  console.log(`\n🔄 Starting Batch #${batchNumber}: Creating ${count} clients (IDs: ${startId}-${startId + count - 1})`);

  const batchPromises = [];

  for (let i = 0; i < count; i++) {
    const clientId = startId + i;
    batchMetrics.attempted++;
    metrics.connections.attempted++;

    const promise = new Promise((resolve) => {
      const connectStart = Date.now();
      const socket = io(SOCKET_URL, {
        auth: {
          token: `stress-test-user-${clientId}`,
          name: `StressUser${clientId}`,
          email: `stress${clientId}@loadtest.com`,
        },
        transports: ["websocket"],
        reconnection: false,
        timeout: 10000
      });

      const clientData = {
        id: clientId,
        socket,
        connected: false,
        roomId: null,
        errors: []
      };

      const timeout = setTimeout(() => {
        if (!clientData.connected) {
          batchMetrics.failed++;
          metrics.connections.failed++;
          metrics.errors.push({
            timestamp: new Date().toISOString(),
            type: "timeout",
            message: "Connection timeout",
            clientId,
            batchNumber
          });
          socket.disconnect();
          resolve(clientData);
        }
      }, 15000);

      socket.on("connect", () => {
        clearTimeout(timeout);
        const connectLatency = Date.now() - connectStart;

        batchMetrics.connectLatencies.push(connectLatency);
        metrics.latency.connect.push(connectLatency);
        batchMetrics.successful++;
        metrics.connections.successful++;
        metrics.connections.current++;
        clientData.connected = true;

        if (metrics.connections.current > metrics.connections.peak) {
          metrics.connections.peak = metrics.connections.current;
        }

        // Create room for some clients
        if (clientId % 2 === 0) {
          socket.emit("createRoom");

          socket.on("roomCreated", ({ roomId }) => {
            metrics.rooms.created++;
            clientData.roomId = roomId;
          });

          socket.on("createRoomError", (error) => {
            metrics.rooms.errors++;
            clientData.errors.push({ type: "createRoom", error });
          });
        }

        resolve(clientData);
      });

      socket.on("connect_error", (err) => {
        clearTimeout(timeout);
        batchMetrics.failed++;
        metrics.connections.failed++;
        metrics.errors.push({
          timestamp: new Date().toISOString(),
          type: "connection",
          message: err.message,
          clientId,
          batchNumber
        });
        clientData.errors.push({ type: "connect", error: err.message });
        resolve(clientData);
      });

      socket.on("disconnect", (reason) => {
        metrics.connections.current--;
        if (reason !== "io client disconnect" && clientData.connected) {
          console.log(`⚠️  Client ${clientId} disconnected unexpectedly: ${reason}`);
        }
      });

      socket.on("error", (err) => {
        clientData.errors.push({ type: "socket", error: err.message || err });
      });
    });

    batchPromises.push(promise);
  }

  // Wait for all connections in this batch
  const batchClients = await Promise.all(batchPromises);
  clients.push(...batchClients);

  batchMetrics.endTime = Date.now();
  batchMetrics.duration = batchMetrics.endTime - batchMetrics.startTime;
  batchMetrics.avgConnectLatency = batchMetrics.connectLatencies.length > 0
    ? batchMetrics.connectLatencies.reduce((a, b) => a + b, 0) / batchMetrics.connectLatencies.length
    : 0;
  batchMetrics.successRate = ((batchMetrics.successful / batchMetrics.attempted) * 100).toFixed(2) + "%";

  metrics.batches.push(batchMetrics);

  // Check for performance degradation
  const degraded = detectPerformanceDegradation(batchMetrics);

  console.log(`✅ Batch #${batchNumber} Complete:`);
  console.log(`   Successful: ${batchMetrics.successful}/${batchMetrics.attempted} (${batchMetrics.successRate})`);
  console.log(`   Avg Latency: ${batchMetrics.avgConnectLatency.toFixed(2)}ms`);
  console.log(`   Total Active: ${metrics.connections.current}`);
  console.log(`   Rooms: ${metrics.rooms.created}`);
  if (degraded) {
    console.log(`   ⚠️  PERFORMANCE DEGRADATION DETECTED`);
  }

  // Check if we hit a breaking point
  const failRate = batchMetrics.failed / batchMetrics.attempted;
  if (failRate > 0.5 && !metrics.systemBreakpoint) {
    metrics.systemBreakpoint = {
      batchNumber,
      totalClients: metrics.connections.current,
      failedConnections: batchMetrics.failed,
      successRate: batchMetrics.successRate,
      avgLatency: batchMetrics.avgConnectLatency
    };
    console.log(`\n⚠️  SYSTEM BREAKING POINT DETECTED at ${metrics.connections.current} connections`);
    console.log(`   Failure rate: ${(failRate * 100).toFixed(2)}%\n`);
  }

  return batchClients;
}

async function checkServerHealth() {
  try {
    const axios = require("axios");
    const response = await axios.get(`${SOCKET_URL}/test`, { timeout: 5000 });
    return {
      timestamp: new Date().toISOString(),
      success: true,
      data: response.data
    };
  } catch (err) {
    return {
      timestamp: new Date().toISOString(),
      success: false,
      error: err.message
    };
  }
}

async function runStressTest() {
  console.log("\n" + "=".repeat(60));
  console.log("💥 STRESS LOAD TEST");
  console.log("=".repeat(60));
  console.log(`Target URL: ${SOCKET_URL}`);
  console.log(`Max Clients: ${MAX_CLIENTS}`);
  console.log(`Batch Size: ${BATCH_SIZE}`);
  console.log(`Batch Delay: ${BATCH_DELAY}ms`);
  console.log(`Test Duration: ${STRESS_DURATION}ms (${STRESS_DURATION/1000}s)`);
  console.log("=".repeat(60));

  const testStartTime = Date.now();
  let currentClientId = 0;

  // Health check monitoring
  const healthChecks = [];
  const healthCheckInterval = setInterval(async () => {
    const health = await checkServerHealth();
    healthChecks.push(health);

    if (health.success) {
      console.log(`\n💚 Server Health Check:`);
      console.log(`   Server Reports: ${health.data.connectedClients} clients`);
      console.log(`   Rooms: ${health.data.roomsCount}`);
      console.log(`   Redis: ${health.data.redisConnected ? "✅" : "❌"}`);
      console.log(`   Our Count: ${metrics.connections.current} active`);
    } else {
      console.log(`\n💔 Server Health Check Failed: ${health.error}`);
    }
  }, 30000); // Every 30 seconds

  // Progressive load test
  while (Date.now() - testStartTime < STRESS_DURATION && currentClientId < MAX_CLIENTS) {
    await createClientBatch(currentClientId, BATCH_SIZE);
    currentClientId += BATCH_SIZE;

    // Stop if we hit the breaking point
    if (metrics.systemBreakpoint) {
      console.log(`\n🛑 Stopping test - System breaking point reached`);
      break;
    }

    // Wait before next batch (unless we're done)
    if (currentClientId < MAX_CLIENTS && Date.now() - testStartTime < STRESS_DURATION) {
      console.log(`\n⏳ Waiting ${BATCH_DELAY}ms before next batch...`);
      await new Promise(r => setTimeout(r, BATCH_DELAY));
    }
  }

  clearInterval(healthCheckInterval);

  // Final health check
  console.log(`\n🔍 Running final server health check...`);
  const finalHealth = await checkServerHealth();
  healthChecks.push(finalHealth);

  // Sustained load phase
  console.log(`\n📊 Sustaining current load for 60 seconds...`);
  await new Promise(r => setTimeout(r, 60000));

  // Cleanup
  console.log(`\n🧹 Cleaning up connections...`);
  clients.forEach(({ socket }) => socket.disconnect());
  await new Promise(r => setTimeout(r, 3000));

  // Calculate final statistics
  metrics.endTime = new Date().toISOString();
  metrics.healthChecks = healthChecks;
  metrics.statistics = {
    connections: {
      total: metrics.connections.attempted,
      successful: metrics.connections.successful,
      failed: metrics.connections.failed,
      peak: metrics.connections.peak,
      successRate: ((metrics.connections.successful / metrics.connections.attempted) * 100).toFixed(2) + "%"
    },
    latency: {
      connect: calculateStats(metrics.latency.connect)
    },
    rooms: {
      created: metrics.rooms.created,
      errors: metrics.rooms.errors
    },
    errors: {
      total: metrics.errors.length,
      byType: metrics.errors.reduce((acc, err) => {
        acc[err.type] = (acc[err.type] || 0) + 1;
        return acc;
      }, {})
    },
    batches: {
      total: metrics.batches.length,
      avgSuccessRate: (metrics.batches.reduce((sum, b) => sum + parseFloat(b.successRate), 0) / metrics.batches.length).toFixed(2) + "%"
    }
  };

  // Save results
  const resultsDir = path.join(__dirname, "../results");
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const resultsFile = path.join(resultsDir, `stress-${timestamp}.json`);
  fs.writeFileSync(resultsFile, JSON.stringify(metrics, null, 2));

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 STRESS TEST SUMMARY");
  console.log("=".repeat(60));

  console.log(`\n🔗 Connections:`);
  console.log(`   Total Attempted: ${metrics.statistics.connections.total}`);
  console.log(`   Successful: ${metrics.statistics.connections.successful}`);
  console.log(`   Failed: ${metrics.statistics.connections.failed}`);
  console.log(`   Peak Concurrent: ${metrics.statistics.connections.peak}`);
  console.log(`   Success Rate: ${metrics.statistics.connections.successRate}`);

  console.log(`\n⏱️  Connection Latency:`);
  console.log(`   Min: ${metrics.statistics.latency.connect.min.toFixed(2)}ms`);
  console.log(`   Avg: ${metrics.statistics.latency.connect.avg.toFixed(2)}ms`);
  console.log(`   Median: ${metrics.statistics.latency.connect.median.toFixed(2)}ms`);
  console.log(`   P95: ${metrics.statistics.latency.connect.p95.toFixed(2)}ms`);
  console.log(`   P99: ${metrics.statistics.latency.connect.p99.toFixed(2)}ms`);
  console.log(`   Max: ${metrics.statistics.latency.connect.max.toFixed(2)}ms`);

  console.log(`\n🏠 Rooms:`);
  console.log(`   Created: ${metrics.statistics.rooms.created}`);
  console.log(`   Errors: ${metrics.statistics.rooms.errors}`);

  console.log(`\n📦 Batches:`);
  console.log(`   Total Batches: ${metrics.statistics.batches.total}`);
  console.log(`   Avg Success Rate: ${metrics.statistics.batches.avgSuccessRate}`);

  if (metrics.systemBreakpoint) {
    console.log(`\n⚠️  System Breaking Point:`);
    console.log(`   Occurred at Batch: ${metrics.systemBreakpoint.batchNumber}`);
    console.log(`   Total Connections: ${metrics.systemBreakpoint.totalClients}`);
    console.log(`   Success Rate: ${metrics.systemBreakpoint.successRate}`);
    console.log(`   Avg Latency: ${metrics.systemBreakpoint.avgLatency.toFixed(2)}ms`);
  }

  if (metrics.performanceDegradation.length > 0) {
    console.log(`\n⚠️  Performance Degradation Events: ${metrics.performanceDegradation.length}`);
    console.log(`   First degradation at: ${metrics.performanceDegradation[0].totalClients} clients`);
  }

  console.log(`\n❌ Errors:`);
  console.log(`   Total: ${metrics.statistics.errors.total}`);
  console.log(`   By Type:`);
  Object.entries(metrics.statistics.errors.byType).forEach(([type, count]) => {
    console.log(`     ${type}: ${count}`);
  });

  console.log(`\n💾 Results saved to: ${resultsFile}`);
  console.log("=".repeat(60) + "\n");

  process.exit(0);
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n⚠️  Test interrupted by user");
  clients.forEach(({ socket }) => socket.disconnect());
  process.exit(1);
});

// Run test
runStressTest().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
