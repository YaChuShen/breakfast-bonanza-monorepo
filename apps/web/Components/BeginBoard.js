'use client';

import { Image, Text, VStack } from '@chakra-ui/react';
import { useTour } from '@reactour/tour';
import mixpanel from 'mixpanel-browser';
import { signOut } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { handleTimerStatus } from 'store/features/gameConfigSlice';
import AuthSection from './AuthSection';
import MotionBoard from './MotionBoard';
import StartButton from './StartButton';

const BeginBoard = ({ session }) => {
  const dispatch = useDispatch();
  const { setIsOpen } = useTour();

  return (
    <MotionBoard py="2.5em">
      <VStack w="100%" spacing={10}>
        <VStack w="100%" spacing={5}>
          <Image src="/breakfast_bonanza_logo.svg" w="60%" alt="SereneShen" />
          <Text color="red.500" fontSize="20px" fontWeight={700}>
            Make Maximum Breakfasts in Limited Time
          </Text>
        </VStack>
        {session && (
          <>
            <Text as="span" fontWeight={700}>
              Hi,{' '}
              <Text as="span" fontWeight={900} fontSize="2xl">
                {session?.user?.name}
              </Text>{' '}
              {`Ready to play?`}
            </Text>
          </>
        )}
        <StartButton
          onClick={() => {
            setIsOpen(true);
            dispatch(handleTimerStatus({ status: 'touring' }));
          }}
          text="Continue"
        />
        <VStack spacing={0}>
          {session ? (
            <Text
              onClick={() => {
                signOut();
                mixpanel.reset();
              }}
              textDecoration="underline"
              cursor="pointer"
            >
              logout
            </Text>
          ) : (
            <AuthSection />
          )}
        </VStack>
      </VStack>
    </MotionBoard>
  );
};

export default BeginBoard;
