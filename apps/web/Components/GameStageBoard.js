'use client';

import { AnimatePresence } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import BeginBoard from 'Components/BeginBoard';
import EndBoard from 'Components/EndBoard';
import useExpiryTimer from 'hooks/useExpiryTimer';
import ScoreSection from './ScoreSection';
import { selectGameConfig } from 'store/features/gameConfigSlice';
import { useSelector } from 'react-redux';
import ReadyStartBoard from './ReadyStartBoard';
import { dispatchAction } from '../helpers/dispatchAction';
import { Box } from '@chakra-ui/react';
import Loading from './Loading';

const GameStageBoard = ({ session, score, isLevel2 }) => {
  const { seconds, minutes, isRunning, timerStart } = useExpiryTimer();
  const { timerStatus } = useSelector(selectGameConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLeaderboard, setCurrentLeaderboard] = useState([]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const initialTimerStatus = sessionStorage.getItem('isTour')
      ? 'readyStarting'
      : 'initial';
    dispatchAction({
      action: 'timerStatus',
      payload: { status: initialTimerStatus },
    });
  }, []);

  useEffect(() => {
    const getLeaderboard = async () => {
      const res = await fetch('/api/getCurrentLeaderboard');
      const data = await res.json();
      setCurrentLeaderboard(data);
    };
    getLeaderboard();
  }, [timerStatus]);

  const boardList = {
    initial: <BeginBoard session={session} />,
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
        currentLeaderboard={currentLeaderboard}
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
