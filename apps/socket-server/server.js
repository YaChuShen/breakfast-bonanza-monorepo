// server.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.set("trust proxy", 1);
app.use(express.json());

let redisConnected = false;

// simple health endpoints
app.get("/test", (req, res) => {
  res.json({
    status: "OK",
    message: "Socket server is running",
    timestamp: new Date().toISOString(),
    connectedClients: io ? io.engine.clientsCount : 0,
    redisConnected,
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    redisConnected,
  });
});

const server = http.createServer(app);

/* ---------------------------
   Socket.IO init
   --------------------------- */
const io = new Server(server, {
  cors: {
    origin: (process.env.CORS_ORIGIN || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

/* ---------------------------
   Optional Redis adapter
   - If REDIS_URL exists, try to connect and attach adapter.
   - If fails, server still runs in single-node mode.
   --------------------------- */
async function tryAttachRedisAdapter() {
  const REDIS_URL = process.env.REDIS_URL;
  if (!REDIS_URL) {
    console.log(
      "⚠️ REDIS_URL not set - running single-node Socket.IO (no adapter)."
    );
    return;
  }

  try {
    const { createClient } = require("redis");
    const { createAdapter } = require("@socket.io/redis-adapter");

    const pub = createClient({ url: REDIS_URL });
    const sub = pub.duplicate();

    pub.on("error", (e) => {
      console.error("Redis pub error:", e);
      redisConnected = false;
    });
    sub.on("error", (e) => {
      console.error("Redis sub error:", e);
      redisConnected = false;
    });

    await pub.connect();
    await sub.connect();

    io.adapter(createAdapter(pub, sub));
    redisConnected = true;
    console.log("✅ Redis adapter attached (pub/sub connected).");
  } catch (err) {
    redisConnected = false;
    console.error("Failed to attach Redis adapter:", err);
  }
}

/* ---------------------------
   Authentication middleware (same as original)
   --------------------------- */
io.use((socket, next) => {
  const userId = socket.handshake.auth?.token;
  if (!userId) {
    console.log("Authentication failed - No token provided");
    return next(new Error("Unauthorized"));
  }
  socket.user = {
    id: userId,
    name: socket.handshake.auth?.name || "",
    email: socket.handshake.auth?.email || "",
  };
  next();
});

/* ---------------------------
   In-memory rooms (keeps original logic)
   NOTE: When running multiple nodes this will NOT be synchronized.
         Adapter only syncs socket.io events; for full state sync, persist rooms to Redis/DB.
   --------------------------- */
const rooms = {};
const userRooms = new Map();
const roomHosts = {};

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/* ---------------------------
   Socket event handlers (keeps original behavior)
   --------------------------- */
io.on("connection", (socket) => {
  socket.on("error", (err) => console.error("Socket error:", err));
  socket.on("connect_error", (err) => console.error("Connect error:", err));

  socket.on("createRoom", () => {
    try {
      const roomId = generateRoomId();
      rooms[roomId] = {
        hostId: socket.user.id,
        hostName: socket.user.name,
        players: [
          {
            id: socket.user.id,
            name: socket.user.name,
            email: socket.user.email,
            ready: false,
          },
        ],
        createdAt: new Date(),
        status: "waiting",
      };

      socket.join(roomId);
      socket.data.roomId = roomId;
      userRooms.set(socket.user.id, roomId);
      roomHosts[roomId] = {
        hostId: socket.user.id,
        hostName: socket.user.name,
        hostEmail: socket.user.email,
      };

      socket.emit("roomCreated", { roomId });
    } catch (e) {
      console.error("createRoom error:", e);
      socket.emit("createRoomError", {
        message: "create room failed, please try again later",
      });
    }
  });

  socket.on("joinRoom", ({ roomId }) => {
    try {
      if (!rooms[roomId]) {
        socket.emit("joinRoomError", { message: "room not found" });
        return;
      }
      if (rooms[roomId].players.length >= 2) {
        socket.emit("joinRoomError", { message: "room is full" });
        return;
      }

      const existingPlayer = rooms[roomId].players.find(
        (p) => p.id === socket.user.id
      );
      if (existingPlayer) {
        socket.emit("joinRoomError", {
          message: "you are already in the room",
        });
        return;
      }

      rooms[roomId].players.push({
        id: socket.user.id,
        name: socket.user.name,
        email: socket.user.email,
        ready: false,
      });
      socket.join(roomId);
      socket.data.roomId = roomId;
      userRooms.set(socket.user.id, roomId);

      socket
        .to(roomId)
        .emit("playerJoined", {
          playerId: socket.user.id,
          playerName: socket.user.name,
          playerEmail: socket.user.email,
        });
      socket.emit("joinedRoom", { roomId });

      if (rooms[roomId].players.length === 2) {
        rooms[roomId].status = "ready";
        io.to(roomId).emit("roomReady", {
          players: rooms[roomId].players,
          canStart: true,
          hostId: rooms[roomId].hostId,
        });
      }
    } catch (e) {
      console.error("joinRoom error:", e);
      socket.emit("joinRoomError", { message: "加入房間失敗，請稍後再試" });
    }
  });

  socket.on("playerReady", (roomId) => {
    socket
      .to(roomId)
      .emit("opponentReady", {
        playerId: socket.user.id,
        playerName: socket.user.name,
      });
  });

  socket.on("gameStart", (roomId) => io.to(roomId).emit("hostStartTheGame"));

  socket.on("scoreUpdate", ({ roomId, score }) => {
    try {
      if (!roomId || typeof score !== "number") {
        console.error("Invalid score update data:", { roomId, score });
        return;
      }
      const eventData = {
        playerId: socket.user.id,
        playerName: socket.user.name,
        score,
        timestamp: new Date().toISOString(),
      };
      socket.to(roomId).emit("opponentScoreUpdate", eventData);
    } catch (e) {
      console.error("scoreUpdate error:", e);
    }
  });

  socket.on("gameEnd", ({ roomId }) => {
    try {
      if (!roomId) {
        console.error("Invalid game end data:", { roomId });
        return;
      }
      socket
        .to(roomId)
        .emit("opponentGameEnd", {
          playerId: socket.user.id,
          playerName: socket.user.name,
          timestamp: new Date().toISOString(),
        });
    } catch (e) {
      console.error("gameEnd error:", e);
    }
  });

  socket.on("disconnect", () => {
    try {
      const roomId = socket.data.roomId;
      if (!roomId) {
        console.log("No room found for disconnected user");
        return;
      }

      let isHostDisconnected = false;
      if (rooms[roomId] && rooms[roomId].hostId === socket.user.id) {
        isHostDisconnected = true;
        console.log("Host disconnected, room:", roomId);
      }

      if (rooms[roomId]) {
        rooms[roomId].players = rooms[roomId].players.filter(
          (p) => p.id !== socket.user.id
        );
        if (rooms[roomId].players.length === 0) {
          delete rooms[roomId];
          delete roomHosts[roomId];
        }
      }

      if (
        isHostDisconnected &&
        (!rooms[roomId] || rooms[roomId].players.length === 0)
      ) {
        delete roomHosts[roomId];
      }

      socket
        .to(roomId)
        .emit("playerDisconnected", {
          playerId: socket.user.id,
          playerName: socket.user.name,
          isHostDisconnected,
        });

      userRooms.delete(socket.user.id);
      console.log(
        "Current userRooms after cleanup:",
        Object.fromEntries(userRooms)
      );
    } catch (e) {
      console.error("disconnect error:", e);
    }
  });
});

/* ---------------------------
   Start up
   --------------------------- */
const PORT = process.env.PORT || 3001;

(async () => {
  await tryAttachRedisAdapter(); // optional
  server.listen(PORT, () => {
    console.log(`✅ Socket server running on port ${PORT}`);
    console.log(`Test the server at: http://localhost:${PORT}/test`);
    if (process.env.REDIS_URL)
      console.log("Using REDIS_URL (adapter attempt).");
  });
})();

/* Graceful shutdown */
function shutdown(sig) {
  console.log(`${sig} received, shutting down...`);
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
