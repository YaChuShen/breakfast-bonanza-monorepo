#!/usr/bin/env node
/**
 * Baseline Load Test
 * Tests basic functionality with moderate load to establish baseline metrics
 *
 * Target: 500 concurrent connections
 * Duration: 5 minutes
 * Goal: Validate system stability and measure baseline performance
 */

require("dotenv").config();
const io = require("socket.io-client");
const fs = require("fs");
const path = require("path");

// Configuration
const SOCKET_URL = process.env.SOCKET_URL || "http://localhost:3001";
const NUM_CLIENTS = parseInt(process.env.BASELINE_CLIENTS || "500");
const RAMP_UP_TIME = parseInt(process.env.BASELINE_RAMP_UP || "30000"); // 30 seconds
const TEST_DURATION = parseInt(process.env.BASELINE_DURATION || "300000"); // 5 minutes

// Metrics
const metrics = {
  testName: "Baseline Load Test",
  startTime: new Date().toISOString(),
  config: {
    targetUrl: SOCKET_URL,
    totalClients: NUM_CLIENTS,
    rampUpTime: RAMP_UP_TIME,
    testDuration: TEST_DURATION
  },
  connections: {
    attempted: 0,
    successful: 0,
    failed: 0,
    current: 0
  },
  rooms: {
    created: 0,
    joined: 0,
    errors: 0
  },
  latency: {
    connect: [],
    createRoom: [],
    joinRoom: []
  },
  errors: [],
  timeline: []
};

const clients = [];

function recordTimeline(event, data) {
  metrics.timeline.push({
    timestamp: new Date().toISOString(),
    event,
    data
  });
}

function calculateStats(arr) {
  if (arr.length === 0) return { min: 0, max: 0, avg: 0, p95: 0, p99: 0 };

  const sorted = [...arr].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: sum / sorted.length,
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)]
  };
}

async function createClient(id, isRoomCreator) {
  return new Promise((resolve) => {
    const connectStart = Date.now();
    metrics.connections.attempted++;

    const socket = io(SOCKET_URL, {
      auth: {
        token: `baseline-test-user-${id}`,
        name: `BaselineUser${id}`,
        email: `baseline${id}@loadtest.com`,
      },
      transports: ["websocket"],
      reconnection: false
    });

    let roomId = null;
    const clientMetrics = {
      id,
      connected: false,
      roomCreated: false,
      roomJoined: false,
      errors: []
    };

    socket.on("connect", () => {
      const connectLatency = Date.now() - connectStart;
      metrics.latency.connect.push(connectLatency);
      metrics.connections.successful++;
      metrics.connections.current++;
      clientMetrics.connected = true;

      if (id % 100 === 0) {
        console.log(`✅ Connected: ${metrics.connections.successful}/${NUM_CLIENTS} (${connectLatency}ms)`);
      }

      // Room creators create rooms, others wait for roomId from pair
      if (isRoomCreator) {
        const createRoomStart = Date.now();
        socket.emit("createRoom");

        socket.on("roomCreated", ({ roomId: newRoomId }) => {
          const createRoomLatency = Date.now() - createRoomStart;
          metrics.latency.createRoom.push(createRoomLatency);
          metrics.rooms.created++;
          roomId = newRoomId;
          clientMetrics.roomCreated = true;

          if (metrics.rooms.created % 50 === 0) {
            console.log(`🏠 Rooms created: ${metrics.rooms.created}`);
          }
        });

        socket.on("createRoomError", (error) => {
          metrics.rooms.errors++;
          clientMetrics.errors.push({ type: "createRoom", error });
          console.error(`❌ Create room error: ${error.message}`);
        });
      }
    });

    socket.on("connect_error", (err) => {
      metrics.connections.failed++;
      metrics.errors.push({
        timestamp: new Date().toISOString(),
        type: "connection",
        message: err.message,
        clientId: id
      });
      clientMetrics.errors.push({ type: "connect", error: err.message });
      console.error(`❌ Connection error (client ${id}): ${err.message}`);
    });

    socket.on("disconnect", (reason) => {
      metrics.connections.current--;
      if (reason !== "io client disconnect") {
        console.log(`⚠️  Client ${id} disconnected: ${reason}`);
      }
    });

    socket.on("error", (err) => {
      metrics.errors.push({
        timestamp: new Date().toISOString(),
        type: "socket",
        message: err.message || err,
        clientId: id
      });
      clientMetrics.errors.push({ type: "socket", error: err.message || err });
    });

    resolve({ socket, metrics: clientMetrics });
  });
}

async function runBaselineTest() {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 BASELINE LOAD TEST");
  console.log("=".repeat(60));
  console.log(`Target URL: ${SOCKET_URL}`);
  console.log(`Total Clients: ${NUM_CLIENTS}`);
  console.log(`Ramp-up Time: ${RAMP_UP_TIME}ms (${RAMP_UP_TIME/1000}s)`);
  console.log(`Test Duration: ${TEST_DURATION}ms (${TEST_DURATION/1000}s)`);
  console.log("=".repeat(60) + "\n");

  recordTimeline("test_start", { clients: NUM_CLIENTS });

  // Create clients with ramp-up
  console.log("📊 Phase 1: Ramping up connections...\n");
  const delay = RAMP_UP_TIME / NUM_CLIENTS;

  for (let i = 0; i < NUM_CLIENTS; i++) {
    const isRoomCreator = i % 2 === 0; // Every other client creates a room
    const clientData = await createClient(i, isRoomCreator);
    clients.push(clientData);

    if (delay > 0) {
      await new Promise(r => setTimeout(r, delay));
    }
  }

  recordTimeline("ramp_up_complete", {
    successful: metrics.connections.successful,
    failed: metrics.connections.failed
  });

  console.log("\n✅ Ramp-up complete!");
  console.log(`   Connected: ${metrics.connections.successful}/${NUM_CLIENTS}`);
  console.log(`   Failed: ${metrics.connections.failed}`);
  console.log(`   Current: ${metrics.connections.current}\n`);

  // Monitor phase
  console.log("📊 Phase 2: Monitoring stable load...\n");

  const monitorInterval = setInterval(() => {
    const connectStats = calculateStats(metrics.latency.connect);

    console.log(`📈 Current Stats:`);
    console.log(`   Active Connections: ${metrics.connections.current}`);
    console.log(`   Rooms Created: ${metrics.rooms.created}`);
    console.log(`   Connection Latency (avg): ${connectStats.avg.toFixed(2)}ms`);
    console.log(`   Errors: ${metrics.errors.length}\n`);

    recordTimeline("monitor_snapshot", {
      activeConnections: metrics.connections.current,
      roomsCreated: metrics.rooms.created,
      errors: metrics.errors.length
    });
  }, 10000); // Every 10 seconds

  // Test server health endpoint
  console.log("🔍 Testing server health endpoint...");
  try {
    const axios = require("axios");
    const healthResponse = await axios.get(`${SOCKET_URL}/test`);
    console.log("✅ Server health check successful:");
    console.log(`   Server reports ${healthResponse.data.connectedClients} clients`);
    console.log(`   Rooms count: ${healthResponse.data.roomsCount}`);
    console.log(`   Redis connected: ${healthResponse.data.redisConnected}\n`);

    metrics.serverHealth = healthResponse.data;
  } catch (err) {
    console.error("❌ Health check failed:", err.message);
  }

  // Wait for test duration
  await new Promise(r => setTimeout(r, TEST_DURATION));

  clearInterval(monitorInterval);
  recordTimeline("test_complete", {
    finalConnections: metrics.connections.current,
    totalRooms: metrics.rooms.created,
    totalErrors: metrics.errors.length
  });

  // Cleanup phase
  console.log("\n📊 Phase 3: Cleaning up...\n");
  clients.forEach(({ socket }) => socket.disconnect());

  await new Promise(r => setTimeout(r, 2000)); // Wait for disconnects

  // Calculate final statistics
  metrics.endTime = new Date().toISOString();
  metrics.statistics = {
    connections: {
      total: metrics.connections.attempted,
      successful: metrics.connections.successful,
      failed: metrics.connections.failed,
      successRate: ((metrics.connections.successful / metrics.connections.attempted) * 100).toFixed(2) + "%"
    },
    latency: {
      connect: calculateStats(metrics.latency.connect),
      createRoom: calculateStats(metrics.latency.createRoom),
      joinRoom: calculateStats(metrics.latency.joinRoom)
    },
    rooms: {
      created: metrics.rooms.created,
      errors: metrics.rooms.errors,
      successRate: metrics.rooms.created > 0
        ? ((metrics.rooms.created / (metrics.rooms.created + metrics.rooms.errors)) * 100).toFixed(2) + "%"
        : "N/A"
    },
    errors: {
      total: metrics.errors.length,
      errorRate: ((metrics.errors.length / metrics.connections.attempted) * 100).toFixed(2) + "%"
    }
  };

  // Save results
  const resultsDir = path.join(__dirname, "../results");
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const resultsFile = path.join(resultsDir, `baseline-${timestamp}.json`);
  fs.writeFileSync(resultsFile, JSON.stringify(metrics, null, 2));

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 BASELINE TEST SUMMARY");
  console.log("=".repeat(60));
  console.log(`\n🔗 Connections:`);
  console.log(`   Total Attempted: ${metrics.statistics.connections.total}`);
  console.log(`   Successful: ${metrics.statistics.connections.successful}`);
  console.log(`   Failed: ${metrics.statistics.connections.failed}`);
  console.log(`   Success Rate: ${metrics.statistics.connections.successRate}`);

  console.log(`\n⏱️  Connection Latency:`);
  console.log(`   Min: ${metrics.statistics.latency.connect.min.toFixed(2)}ms`);
  console.log(`   Avg: ${metrics.statistics.latency.connect.avg.toFixed(2)}ms`);
  console.log(`   P95: ${metrics.statistics.latency.connect.p95.toFixed(2)}ms`);
  console.log(`   P99: ${metrics.statistics.latency.connect.p99.toFixed(2)}ms`);
  console.log(`   Max: ${metrics.statistics.latency.connect.max.toFixed(2)}ms`);

  console.log(`\n🏠 Rooms:`);
  console.log(`   Created: ${metrics.statistics.rooms.created}`);
  console.log(`   Errors: ${metrics.statistics.rooms.errors}`);
  console.log(`   Success Rate: ${metrics.statistics.rooms.successRate}`);

  console.log(`\n❌ Errors:`);
  console.log(`   Total: ${metrics.statistics.errors.total}`);
  console.log(`   Error Rate: ${metrics.statistics.errors.errorRate}`);

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
runBaselineTest().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
