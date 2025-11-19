#!/usr/bin/env node
/**
 * Real-time Monitoring Dashboard
 * Monitors Socket.IO server health during load tests
 */

require("dotenv").config();
const axios = require("axios");

const SOCKET_URL = process.env.SOCKET_URL || "http://localhost:3001";
const INTERVAL = parseInt(process.env.MONITOR_INTERVAL || "2000");

const stats = {
  startTime: Date.now(),
  samples: [],
  peaks: {
    clients: 0,
    rooms: 0
  }
};

function clearScreen() {
  process.stdout.write("\x1Bc");
}

function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

function formatBytes(bytes) {
  const mb = bytes / 1024 / 1024;
  return mb.toFixed(2) + " MB";
}

function createSparkline(data, max = null) {
  const chars = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
  if (data.length === 0) return "";

  const maxVal = max || Math.max(...data);
  if (maxVal === 0) return chars[0].repeat(data.length);

  return data
    .map((val) => {
      const index = Math.min(
        chars.length - 1,
        Math.floor((val / maxVal) * chars.length)
      );
      return chars[index];
    })
    .join("");
}

async function fetchServerHealth() {
  try {
    const response = await axios.get(`${SOCKET_URL}/test`, { timeout: 5000 });
    return {
      success: true,
      data: response.data,
      timestamp: Date.now()
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      timestamp: Date.now()
    };
  }
}

function displayDashboard(health) {
  clearScreen();

  const runTime = Date.now() - stats.startTime;
  const border = "═".repeat(60);

  console.log(`╔${border}╗`);
  console.log(`║ 📊 SOCKET.IO SERVER MONITOR${" ".repeat(32)}║`);
  console.log(`╠${border}╣`);

  if (!health.success) {
    console.log(`║ ❌ SERVER UNREACHABLE${" ".repeat(37)}║`);
    console.log(`║ Error: ${health.error.padEnd(50)} ║`);
    console.log(`╚${border}╝`);
    return;
  }

  const data = health.data;

  // Update peaks
  if (data.connectedClients > stats.peaks.clients) {
    stats.peaks.clients = data.connectedClients;
  }
  if (data.roomsCount > stats.peaks.rooms) {
    stats.peaks.rooms = data.roomsCount;
  }

  // Store sample
  stats.samples.push({
    timestamp: health.timestamp,
    clients: data.connectedClients,
    rooms: data.roomsCount
  });

  // Keep only last 30 samples
  if (stats.samples.length > 30) {
    stats.samples.shift();
  }

  // Server Info
  console.log(`║ 🖥️  Server Status${" ".repeat(43)}║`);
  console.log(`║ ${" ".repeat(58)} ║`);
  console.log(`║   Target: ${data.status === "OK" ? "✅" : "❌"} ${SOCKET_URL.padEnd(43)} ║`);
  console.log(`║   Uptime: ${formatUptime(runTime).padEnd(50)} ║`);
  console.log(`║   Redis:  ${data.redisConnected ? "✅ Connected" : "❌ Disconnected"}${" ".repeat(40)} ║`);
  console.log(`║ ${" ".repeat(58)} ║`);

  // Connection Stats
  console.log(`║ 🔗 Connection Statistics${" ".repeat(35)}║`);
  console.log(`║ ${" ".repeat(58)} ║`);
  console.log(`║   Current Connections: ${String(data.connectedClients).padStart(6)} ${" ".repeat(26)} ║`);
  console.log(`║   Peak Connections:    ${String(stats.peaks.clients).padStart(6)} ${" ".repeat(26)} ║`);
  console.log(`║   Active Rooms:        ${String(data.roomsCount).padStart(6)} ${" ".repeat(26)} ║`);
  console.log(`║   Peak Rooms:          ${String(stats.peaks.rooms).padStart(6)} ${" ".repeat(26)} ║`);
  console.log(`║ ${" ".repeat(58)} ║`);

  // Memory Stats
  if (data.memory) {
    console.log(`║ 💾 Memory Usage${" ".repeat(44)}║`);
    console.log(`║ ${" ".repeat(58)} ║`);
    console.log(`║   RSS:        ${formatBytes(data.memory.rss).padEnd(48)} ║`);
    console.log(`║   Heap Used:  ${formatBytes(data.memory.heapUsed).padEnd(48)} ║`);
    console.log(`║   Heap Total: ${formatBytes(data.memory.heapTotal).padEnd(48)} ║`);
    console.log(`║   External:   ${formatBytes(data.memory.external).padEnd(48)} ║`);
    console.log(`║ ${" ".repeat(58)} ║`);
  }

  // Trends
  if (stats.samples.length >= 5) {
    const clientData = stats.samples.map(s => s.clients);
    const roomData = stats.samples.map(s => s.rooms);

    console.log(`║ 📈 Trends (Last ${stats.samples.length} samples)${" ".repeat(31)} ║`);
    console.log(`║ ${" ".repeat(58)} ║`);
    console.log(`║   Connections: ${createSparkline(clientData, stats.peaks.clients).padEnd(42)} ║`);
    console.log(`║   Rooms:       ${createSparkline(roomData, stats.peaks.rooms).padEnd(42)} ║`);
    console.log(`║ ${" ".repeat(58)} ║`);
  }

  console.log(`╚${border}╝`);
  console.log(`\nLast updated: ${new Date(health.timestamp).toLocaleTimeString()}`);
  console.log(`Refresh interval: ${INTERVAL}ms | Press Ctrl+C to stop`);
}

async function startMonitoring() {
  console.log("🚀 Starting Socket.IO Server Monitor...");
  console.log(`Target: ${SOCKET_URL}`);
  console.log(`Refresh interval: ${INTERVAL}ms\n`);

  // Initial fetch
  const initialHealth = await fetchServerHealth();
  if (!initialHealth.success) {
    console.error(`❌ Failed to connect to server: ${initialHealth.error}`);
    console.error(`Make sure the server is running at ${SOCKET_URL}`);
    process.exit(1);
  }

  // Start monitoring loop
  setInterval(async () => {
    const health = await fetchServerHealth();
    displayDashboard(health);
  }, INTERVAL);

  // Display immediately
  displayDashboard(initialHealth);
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  clearScreen();
  console.log("\n👋 Monitoring stopped");
  console.log("\n📊 Session Summary:");
  console.log(`   Duration: ${formatUptime(Date.now() - stats.startTime)}`);
  console.log(`   Peak Connections: ${stats.peaks.clients}`);
  console.log(`   Peak Rooms: ${stats.peaks.rooms}`);
  console.log(`   Samples Collected: ${stats.samples.length}\n`);
  process.exit(0);
});

// Start
startMonitoring().catch((err) => {
  console.error("❌ Monitor error:", err);
  process.exit(1);
});
