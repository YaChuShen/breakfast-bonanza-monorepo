'use client';

import { Box } from '@chakra-ui/react';
import BeginBoard from 'Components/BeginBoard';
import EndBoard from 'Components/EndBoard';
import GameModeSelector from 'Components/GameModeSelector';
import MultiPlayerOptions from 'Components/MultiPlayerOptions';
import { AnimatePresence } from 'framer-motion';
import useExpiryTimer from 'hooks/useExpiryTimer';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectGameConfig } from 'store/features/gameConfigSlice';
import { dispatchAction } from '../helpers/dispatchAction';
import Loading from './Loading';
import ReadyStartBoard from './ReadyStartBoard';
import ScoreSection from './ScoreSection';

const GameStageBoard = ({ session, score, isLevel2 }) => {
  const { seconds, minutes, isRunning, timerStart } = useExpiryTimer();
  const { timerStatus } = useSelector(selectGameConfig);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const initialTimerStatus = sessionStorage.getItem('isTour')
      ? 'readyStarting'
      : 'modeSelection';
    dispatchAction({
      action: 'timerStatus',
      payload: { status: initialTimerStatus },
    });
  }, []);

  // 監聽多人遊戲開始事件
  useEffect(() => {
    const handleMultiPlayerGameStart = () => {
      timerStart();
    };

    window.addEventListener('multiPlayerGameStart', handleMultiPlayerGameStart);
    return () => {
      window.removeEventListener(
        'multiPlayerGameStart',
        handleMultiPlayerGameStart
      );
    };
  }, [timerStart]);

  const boardList = {
    initial: <BeginBoard session={session} />,
    modeSelection: <GameModeSelector session={session} />,
    singlePlayerReady: (
      <ReadyStartBoard
        timerStart={timerStart}
        session={session}
        gameMode="single"
      />
    ),
    multiPlayerOptions: <MultiPlayerOptions session={session} />,
    waitingForPlayer: (
      <ReadyStartBoard
        timerStart={timerStart}
        session={session}
        gameMode="waiting"
      />
    ),
    multiPlayerReady: (
      <ReadyStartBoard
        timerStart={timerStart}
        session={session}
        gameMode="multi"
      />
    ),
    touring: '',
    readyStarting: (
      <ReadyStartBoard timerStart={timerStart} session={session} />
    ),
    end: (
      <EndBoard
        score={score}
        isRunning={isRunning}
        session={session}
        isLevel2={isLevel2}
      />
    ),
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <AnimatePresence>{boardList[timerStatus]}</AnimatePresence>
      <ScoreSection
        score={score}
        minutes={minutes}
        seconds={seconds}
        profileId={session?.profileId ?? session?.id}
        isSingin={session}
        session={session}
      />
      {!isRunning && (
        <Box
          pos="fixed"
          bottom="0"
          top="0"
          left="0"
          right="0"
          bg="black"
          opacity="0.3"
          zIndex="2"
        />
      )}
    </>
  );
};

export default GameStageBoard;
