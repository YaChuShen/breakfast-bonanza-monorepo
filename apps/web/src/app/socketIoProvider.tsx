'use client';
import { connectSocket } from '@breakfast-bonanza/shared';
import { useSession } from 'next-auth/react';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Socket } from 'socket.io-client';

const SocketContext = createContext<Socket | null>(null);

export const SocketIoProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const initSocket = async () => {
      if (!session) return;

      try {
        const socketUrl =
          process.env.NODE_ENV === 'production'
            ? process.env.NEXT_PUBLIC_SOCKET_URL
            : 'http://56.155.163.184:3001';

        if (!socketUrl) {
          console.error('Socket URL not configured');
          return;
        }

        // 創建 Socket 連線
        const socket = connectSocket(session, socketUrl);
        console.log('socket', socket);
        // 添加連線超時處理
        const connectWithTimeout = () => {
          return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              socket.disconnect();
              reject(new Error('Socket connection timeout'));
            }, 10000); // 10秒超時

            socket.on('connect', () => {
              clearTimeout(timeout);
              resolve(socket);
            });

            socket.on('connect_error', (error) => {
              clearTimeout(timeout);
              reject(error);
            });
          });
        };

        await connectWithTimeout();
        setSocket(socket);

        return () => {
          if (socket) {
            socket.disconnect();
            setSocket(null);
          }
        };
      } catch (error) {
        console.error('Failed to initialize socket:', error);
        // 如果 WebSocket 連線失敗，不要阻止應用程式運行
        setSocket(null);
      }
    };

    initSocket();
  }, [session]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const socket = useContext(SocketContext);

  return socket;
};
