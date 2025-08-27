import { useTimer } from 'react-timer-hook';
import { GAME_TIMEER } from 'contents/rules';
import { useDispatch } from 'react-redux';
import { timerStatus } from 'store/features/gameConfigSlice';

const useExpiryTimer = () => {
  const time = new Date();
  time.setSeconds(time.getSeconds() + GAME_TIMEER);
  const dispatch = useDispatch();

  const {
    seconds,
    minutes,
    isRunning,
    restart,
    start: timerStart,
  } = useTimer({
    expiryTimestamp: time,
    onExpire: () => dispatch(timerStatus({ status: 'end' })),
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
