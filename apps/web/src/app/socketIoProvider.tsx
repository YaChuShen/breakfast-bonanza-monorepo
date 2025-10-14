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
          process.env.NEXT_PUBLIC_SOCKET_URL_LOCAL || 'http://localhost:3001';

        const socket = await connectSocket(session, socketUrl);
        setSocket(socket);
        return () => {
          if (socket) {
            socket.disconnect();
            setSocket(null);
          }
        };
      } catch (error) {
        console.error('Failed to initialize socket:', error);
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
