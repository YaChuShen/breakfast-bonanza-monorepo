import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSocket } from 'src/app/socketIoProvider';
import { selectCustomer } from 'store/features/customerSlice';
import { selectGameConfig } from 'store/features/gameConfigSlice';

// 自定義 Hook 來處理分數同步
export const useScoreSync = () => {
  const socket = useSocket();
  const { data: session } = useSession();
  const { score } = useSelector(selectCustomer);
  const { gameMode, roomId, timerStatus } = useSelector(selectGameConfig);

  useEffect(() => {
    // 只在多人模式、遊戲進行中、且有 socket 連接時同步分數
    if (
      gameMode === 'multi' &&
      timerStatus === 'gameRunning' &&
      socket &&
      roomId &&
      session
    ) {
      socket.emit('scoreUpdate', {
        roomId,
        score,
        playerId: session.id || session.profileId,
        playerName: session.user.name || session.name,
      });
    }
  }, [score, gameMode, timerStatus, socket, roomId, session]);
};
