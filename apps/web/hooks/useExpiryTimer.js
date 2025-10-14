import { GAME_TIMEER } from 'contents/rules';
import { useSession } from 'next-auth/react';
import { useDispatch, useSelector } from 'react-redux';
import { useTimer } from 'react-timer-hook';
import { useSocket } from 'src/app/socketIoProvider';
import {
  handleTimerStatus,
  selectGameConfig,
} from 'store/features/gameConfigSlice';

const useExpiryTimer = () => {
  const time = new Date();
  time.setSeconds(time.getSeconds() + GAME_TIMEER);
  const dispatch = useDispatch();
  const socket = useSocket();
  const { data: session } = useSession();
  const { gameMode, roomId } = useSelector(selectGameConfig);

  const handleGameEnd = () => {
    dispatch(handleTimerStatus({ status: 'end' }));
    if (gameMode === 'multi' && socket && roomId && session) {
      socket.emit('gameEnd', {
        roomId,
        playerId: session.id || session.profileId,
        playerName: session.user?.name || session.name,
      });
    }
  };

  const {
    seconds,
    minutes,
    isRunning,
    restart,
    start: timerStart,
  } = useTimer({
    expiryTimestamp: time,
    onExpire: handleGameEnd,
    autoStart: false,
  });

  return {
    seconds,
    minutes,
    isRunning,
    timerStart,
    restart,
  };
};

export default useExpiryTimer;
