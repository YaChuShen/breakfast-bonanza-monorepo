import { io } from "socket.io-client";

export const connectSocket = async (session, socketUrl) => {
  console.log(socketUrl);
  const socket = io(socketUrl, {
    auth: {
      token: session?.profileId || session?.user?.id || session?.sub,
      name: session?.name || session?.user?.name,
      email: session?.email || session?.user?.email,
    },
  });

  console.log("🔌 Socket connected:", socket.id);

  socket.on("connect", () => {
    console.log("🔌 Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected");
  });

  return socket;
};
