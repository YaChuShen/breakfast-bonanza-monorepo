require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  console.log("Incoming request:", {
    method: req.method,
    url: req.url,
    headers: req.headers,
  });
  next();
});

// Health check endpoint
app.get("/test", (req, res) => {
  res.json({
    status: "OK",
    message: "Socket server is running",
    timestamp: new Date().toISOString(),
    connectedClients: io.engine.clientsCount,
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

const server = http.createServer(app);
const roomHosts = {};
const userRooms = new Map();
const rooms = {};

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
      "https://breakfast-bonanza-socket-server.onrender.com",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

io.use((socket, next) => {
  const userId = socket.handshake.auth.token;
  if (!userId) {
    console.log("Authentication failed - No token provided");
    return next(new Error("Unauthorized"));
  }
  socket.user = {
    id: userId,
    name: socket.handshake.auth.name,
    email: socket.handshake.auth.email,
  };
  next();
});

io.on("connection", (socket) => {
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  socket.on("connect_error", (error) => {
    console.error("Connection error:", error);
  });

  socket.on("createRoom", ({ playerId, playerName }) => {
    try {
      console.log(
        `創建房間請求 - playerId: ${playerId}, playerName: ${playerName}`
      );

      const roomId = generateRoomId();
      console.log(`生成房間ID: ${roomId}`);

      // 創建房間數據
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
        status: "waiting", // waiting, ready, playing
      };

      // 加入房間
      socket.join(roomId);
      socket.data.roomId = roomId;
      userRooms.set(socket.user.id, roomId);
      roomHosts[roomId] = {
        hostId: socket.user.id,
        hostName: socket.user.name,
        hostEmail: socket.user.email,
      };

      // 回傳房間創建成功
      socket.emit("roomCreated", { roomId });
      console.log(`房間 ${roomId} 創建成功`);
    } catch (error) {
      console.error("創建房間失敗:", error);
      socket.emit("createRoomError", { message: "創建房間失敗，請稍後再試" });
    }
  });

  socket.on("joinRoom", ({ roomId, playerId, playerName }) => {
    try {
      console.log(
        `加入房間請求 - roomId: ${roomId}, playerId: ${playerId}, playerName: ${playerName}`
      );

      // 檢查房間是否存在
      if (!rooms[roomId]) {
        socket.emit("joinRoomError", { message: "房間不存在或已關閉" });
        return;
      }

      // 檢查房間是否已滿 (最多2人)
      if (rooms[roomId].players.length >= 2) {
        socket.emit("joinRoomError", { message: "房間已滿" });
        return;
      }

      // 檢查玩家是否已在房間中
      const existingPlayer = rooms[roomId].players.find(
        (p) => p.id === socket.user.id
      );
      if (existingPlayer) {
        socket.emit("joinRoomError", { message: "您已在此房間中" });
        return;
      }

      // 添加玩家到房間
      rooms[roomId].players.push({
        id: socket.user.id,
        name: socket.user.name,
        email: socket.user.email,
        ready: false,
      });

      // 加入房間
      socket.join(roomId);
      socket.data.roomId = roomId;
      userRooms.set(socket.user.id, roomId);

      // 通知房間內其他玩家
      socket.to(roomId).emit("playerJoined", {
        playerId: socket.user.id,
        playerName: socket.user.name,
        playerEmail: socket.user.email,
      });

      // 回傳加入成功
      socket.emit("joinedRoom", { roomId });
      console.log(`玩家 ${socket.user.name} 成功加入房間 ${roomId}`);

      // 如果房間滿了，通知所有玩家可以開始遊戲
      if (rooms[roomId].players.length === 2) {
        rooms[roomId].status = "ready";
        io.to(roomId).emit("roomReady", {
          players: rooms[roomId].players,
          canStart: true,
          hostId: rooms[roomId].hostId,
        });
        console.log(`房間 ${roomId} 已滿，可以開始遊戲`);
      }
    } catch (error) {
      console.error("加入房間失敗:", error);
      socket.emit("joinRoomError", { message: "加入房間失敗，請稍後再試" });
    }
  });

  socket.on("playerReady", (roomId) => {
    socket.to(roomId).emit("opponentReady", {
      playerId: socket.user.id,
      playerName: socket.user.name,
    });
  });

  socket.on("gameStart", (roomId) => {
    io.to(roomId).emit("hostStartTheGame");
  });

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
    } catch (error) {
      console.error("Error handling score update:", error);
    }
  });

  socket.on("disconnect", () => {
    const roomId = socket.data.roomId;

    if (roomId) {
      let isHostDisconnected = false;
      if (rooms[roomId] && rooms[roomId].hostId === socket.user.id) {
        isHostDisconnected = true;
        console.log("Host disconnected, room:", roomId);
      }

      if (rooms[roomId]) {
        rooms[roomId].players = rooms[roomId].players.filter(
          (p) => p.id !== socket.user.id
        );

        // If no players left, delete the room
        if (rooms[roomId].players.length === 0) {
          delete rooms[roomId];
          delete roomHosts[roomId];
          console.log(`房間 ${roomId} 已刪除（無玩家）`);
        }
      }

      // If the disconnected user was the host, clean up host info for empty rooms
      if (
        isHostDisconnected &&
        (!rooms[roomId] || rooms[roomId].players.length === 0)
      ) {
        delete roomHosts[roomId];
      }
      // Notify other players in the room about the disconnection
      console.log(
        "Emitting disconnect event to room:",
        roomId,
        "isHostDisconnected:",
        isHostDisconnected
      );
      socket.to(roomId).emit("playerDisconnected", {
        playerId: socket.user.id,
        playerName: socket.user.name,
        isHostDisconnected,
      });

      // Clean up the stored room information
      userRooms.delete(socket.user.id);
      console.log(
        "Current userRooms after cleanup:",
        Object.fromEntries(userRooms)
      );
    } else {
      console.log("No room found for disconnected user");
    }
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`✅ Socket server running on port ${PORT}`);
  console.log(`Test the server at: http://localhost:${PORT}/test`);
});
