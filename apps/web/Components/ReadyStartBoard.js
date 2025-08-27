'use client';
import React from 'react';

import { Image, Text, VStack } from '@chakra-ui/react';
import { useDispatch } from 'react-redux';
import { timerStatus } from 'store/features/gameConfigSlice';
import MotionBoard from './MotionBoard';
import AuthSection from './AuthSection';
import StartButton from './StartButton';

const ReadyStartBoard = ({ session, timerStart }) => {
  const dispatch = useDispatch();
  return (
    <MotionBoard py={{ md: '2em', xl: '6em' }} px="2em">
      <VStack w="100%" spacing={10} fontWeight={500}>
        <VStack w="100%">
          <Image src="/breakfast_bonanza_logo.svg" w="60%" alt="sereneShen" />
        </VStack>
        {session ? (
          <VStack fontWeight={700}>
            <Text color="gray.700">
              Hi,{' '}
              <Text as="span" fontWeight={900} fontSize="2xl">
                {session?.user?.name}
              </Text>
            </Text>
            <Text>Press Start to begin the timer!</Text>
          </VStack>
        ) : (
          <VStack textAlign="center">
            <Text>You are not logged in yet.</Text>
            <Text>
              Log in or Sign up now to record your game score and enter the
              leaderboard!
            </Text>
          </VStack>
        )}
        <StartButton
          onClick={() => {
            timerStart();
            dispatch(timerStatus({ status: 'gameRunning' }));
          }}
        />

        {!session && <AuthSection />}
      </VStack>
    </MotionBoard>
  );
};

export default ReadyStartBoard;
