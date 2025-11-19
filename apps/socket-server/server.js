// server.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.set("trust proxy", 1);
app.use(express.json());

let redisConnected = false;
let redisClient = null; // 全局 Redis client

// simple health endpoints
app.get("/test", async (req, res) => {
  let clientsCount = 0;
  try {
    if (redisClient) {
      const rooms = await redisClient.keys("room:*");
      clientsCount = rooms.length;
    }
  } catch (e) {
    console.error("Error getting rooms count:", e);
  }

  res.json({
    status: "OK",
    message: "Socket server is running",
    timestamp: new Date().toISOString(),
    connectedClients: io ? io.engine.clientsCount : 0,
    roomsCount: clientsCount,
    redisConnected,
  });
});

app.get("/health", (req, res) => {
  console.log("health check");
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
   Redis Setup - 必須成功連接
   --------------------------- */
async function setupRedis() {
  const REDIS_URL = process.env.REDIS_URL;
  if (!REDIS_URL) {
    throw new Error("❌ REDIS_URL is required for room management!");
  }

  try {
    const { createClient } = require("redis");
    const { createAdapter } = require("@socket.io/redis-adapter");

    // 創建 Redis clients
    const pub = createClient({ url: REDIS_URL });
    const sub = pub.duplicate();
    redisClient = createClient({ url: REDIS_URL }); // 用於資料儲存的 client

    pub.on("error", (e) => {
      console.error("Redis pub error:", e);
      redisConnected = false;
    });
    sub.on("error", (e) => {
      console.error("Redis sub error:", e);
      redisConnected = false;
    });
    redisClient.on("error", (e) => {
      console.error("Redis client error:", e);
      redisConnected = false;
    });

    // 連接所有 clients
    await pub.connect();
    await sub.connect();
    await redisClient.connect();

    io.adapter(createAdapter(pub, sub));
    redisConnected = true;
    console.log("✅ Redis connected successfully!");
    console.log("✅ Redis adapter attached (pub/sub connected).");
  } catch (err) {
    redisConnected = false;
    console.error("❌ Failed to connect Redis:", err);
    throw err;
  }
}

/* ---------------------------
   Redis Helper Functions - 房間管理
   --------------------------- */

// 生成房間 ID
function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// 取得房間資料
async function getRoom(roomId) {
  try {
    const data = await redisClient.get(`room:${roomId}`);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("getRoom error:", e);
    return null;
  }
}

// 儲存房間資料
async function setRoom(roomId, roomData) {
  try {
    await redisClient.set(
      `room:${roomId}`,
      JSON.stringify(roomData),
      { EX: 3600 } // 1小時後自動過期
    );
    return true;
  } catch (e) {
    console.error("setRoom error:", e);
    return false;
  }
}

// 刪除房間
async function deleteRoom(roomId) {
  try {
    await redisClient.del(`room:${roomId}`);
    return true;
  } catch (e) {
    console.error("deleteRoom error:", e);
    return false;
  }
}

// 取得用戶所在房間
async function getUserRoom(userId) {
  try {
    return await redisClient.get(`user:${userId}:room`);
  } catch (e) {
    console.error("getUserRoom error:", e);
    return null;
  }
}

// 設定用戶所在房間
async function setUserRoom(userId, roomId) {
  try {
    await redisClient.set(`user:${userId}:room`, roomId, { EX: 3600 });
    return true;
  } catch (e) {
    console.error("setUserRoom error:", e);
    return false;
  }
}

// 刪除用戶房間記錄
async function deleteUserRoom(userId) {
  try {
    await redisClient.del(`user:${userId}:room`);
    return true;
  } catch (e) {
    console.error("deleteUserRoom error:", e);
    return false;
  }
}

/* ---------------------------
   Authentication middleware
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
   Socket event handlers - 使用 Redis
   --------------------------- */
io.on("connection", (socket) => {
  const currentConnections = io.engine.clientsCount;
  console.log(`🔌 New connection: ${socket.user.name} (${socket.user.id}) | Total: ${currentConnections}`);

  socket.on("error", (err) => console.error("Socket error:", err));
  socket.on("connect_error", (err) => console.error("Connect error:", err));

  // 創建房間
  socket.on("createRoom", async () => {
    try {
      const roomId = generateRoomId();
      const roomData = {
        hostId: socket.user.id,
        hostName: socket.user.name,
        hostEmail: socket.user.email,
        players: [
          {
            id: socket.user.id,
            name: socket.user.name,
            email: socket.user.email,
            ready: false,
          },
        ],
        createdAt: new Date().toISOString(),
        status: "waiting",
      };

      await setRoom(roomId, roomData);
      await setUserRoom(socket.user.id, roomId);

      // 等待 socket 加入房間（使用 Redis adapter 時是異步的）
      await socket.join(roomId);
      socket.data.roomId = roomId;

      socket.emit("roomCreated", { roomId });
      console.log(`✅ Room created: ${roomId} by ${socket.user.name}`);
    } catch (e) {
      console.error("createRoom error:", e);
      socket.emit("createRoomError", {
        message: "create room failed, please try again later",
      });
    }
  });

  // 加入房間
  socket.on("joinRoom", async ({ roomId }) => {
    try {
      const room = await getRoom(roomId);

      if (!room) {
        socket.emit("joinRoomError", { message: "room not found" });
        return;
      }

      if (room.players.length >= 2) {
        socket.emit("joinRoomError", { message: "room is full" });
        return;
      }

      const existingPlayer = room.players.find((p) => p.id === socket.user.id);
      if (existingPlayer) {
        socket.emit("joinRoomError", {
          message: "you are already in the room",
        });
        return;
      }

      // 加入玩家
      room.players.push({
        id: socket.user.id,
        name: socket.user.name,
        email: socket.user.email,
        ready: false,
      });

      // 如果滿員，更新狀態
      if (room.players.length === 2) {
        room.status = "ready";
      }

      await setRoom(roomId, room);
      await setUserRoom(socket.user.id, roomId);

      // 等待 socket 加入房間（使用 Redis adapter 時是異步的）
      await socket.join(roomId);
      socket.data.roomId = roomId;

      // 確保 join 完成後再發送事件
      socket.to(roomId).emit("playerJoined", {
        playerId: socket.user.id,
        playerName: socket.user.name,
        playerEmail: socket.user.email,
      });

      socket.emit("joinedRoom", { roomId });

      if (room.players.length === 2) {
        io.to(roomId).emit("roomReady", {
          players: room.players,
          canStart: true,
          hostId: room.hostId,
        });
      }

      console.log(`✅ Player ${socket.user.name} joined room: ${roomId}`);
    } catch (e) {
      console.error("joinRoom error:", e);
      socket.emit("joinRoomError", { message: "加入房間失敗，請稍後再試" });
    }
  });

  // 玩家準備
  socket.on("playerReady", (roomId) => {
    socket.to(roomId).emit("opponentReady", {
      playerId: socket.user.id,
      playerName: socket.user.name,
    });
  });

  // 遊戲開始
  socket.on("gameStart", (roomId) => io.to(roomId).emit("hostStartTheGame"));

  // 分數更新
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

  // 遊戲結束
  socket.on("gameEnd", ({ roomId }) => {
    try {
      if (!roomId) {
        console.error("Invalid game end data:", { roomId });
        return;
      }
      socket.to(roomId).emit("opponentGameEnd", {
        playerId: socket.user.id,
        playerName: socket.user.name,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.error("gameEnd error:", e);
    }
  });

  // 斷線處理
  socket.on("disconnect", async () => {
    const currentConnections = io.engine.clientsCount;
    console.log(`🔌 Disconnected: ${socket.user.name} (${socket.user.id}) | Total: ${currentConnections}`);

    try {
      const roomId = socket.data.roomId;
      if (!roomId) {
        console.log("No room found for disconnected user");
        return;
      }

      const room = await getRoom(roomId);
      if (!room) {
        console.log("Room not found in Redis:", roomId);
        await deleteUserRoom(socket.user.id);
        return;
      }

      const isHostDisconnected = room.hostId === socket.user.id;
      console.log(
        `Player ${socket.user.name} disconnected from room: ${roomId}`
      );

      // 移除玩家
      room.players = room.players.filter((p) => p.id !== socket.user.id);

      // 如果房間沒人了，刪除房間
      if (room.players.length === 0) {
        await deleteRoom(roomId);
        console.log(`Room ${roomId} deleted (empty)`);
      } else {
        await setRoom(roomId, room);
      }

      // 通知其他玩家
      socket.to(roomId).emit("playerDisconnected", {
        playerId: socket.user.id,
        playerName: socket.user.name,
        isHostDisconnected,
      });

      await deleteUserRoom(socket.user.id);
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
  try {
    await setupRedis(); // Redis 必須成功連接
    server.listen(PORT, () => {
      console.log(`✅ Socket server running on port ${PORT}`);
      console.log(`Test the server at: http://localhost:${PORT}/test`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();

/* Graceful shutdown */
function shutdown(sig) {
  console.log(`${sig} received, shutting down...`);
  server.close(async () => {
    console.log("HTTP server closed.");
    if (redisClient) {
      await redisClient.quit();
      console.log("Redis client closed.");
    }
    process.exit(0);
  });
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
