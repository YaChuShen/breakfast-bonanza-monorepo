'use client';

import { Button, Image, Text, VStack } from '@chakra-ui/react';
import React from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { timerStatus } from 'store/features/gameConfigSlice';
import { useTour } from '@reactour/tour';
import MotionBoard from './MotionBoard';
import mixpanel from 'mixpanel-browser';
import LoginButton from './LoginButton';

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
        <Button
          onClick={() => {
            setIsOpen(true);
            dispatch(timerStatus({ status: 'touring' }));
          }}
          bg="red.500"
          color="white"
          fontSize="24px"
          py="5"
          px="12"
          size="xl"
          borderRadius="2xl"
          letterSpacing="1px"
          _hover={{ bg: 'red.300', color: 'white' }}
          fontWeight={900}
        >
          Continue
        </Button>
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
            <LoginButton />
          )}
        </VStack>
      </VStack>
    </MotionBoard>
  );
};

export default BeginBoard;
