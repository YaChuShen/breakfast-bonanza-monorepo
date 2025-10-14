'use client';

import { Box, HStack, Image, Text, VStack } from '@chakra-ui/react';
import { FaRegCopy } from 'react-icons/fa6';
import { useDispatch, useSelector } from 'react-redux';
import { useSocket } from 'src/app/socketIoProvider';
import { clearScore } from 'store/features/customerSlice';
import {
  handleTimerStatus,
  selectGameConfig,
} from 'store/features/gameConfigSlice';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';
import MotionBoard from './MotionBoard';
import ReturnButton from './ReturnButton';
import ReturnText from './ReturnText';
import StartButton from './StartButton';

const ReadyStartBoard = ({ session, timerStart, gameMode = 'single' }) => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const { roomId, hostId, timerStatus } = useSelector(selectGameConfig);

  const isHost =
    session &&
    hostId &&
    (session.id === hostId || session.profileId === hostId);

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard?.writeText(roomId);
    }
  };
  return (
    <MotionBoard py={{ md: '2em', xl: '6em' }} px="2em" pos="relative">
      <ReturnText
        onClick={() => dispatch(handleTimerStatus({ status: 'modeSelection' }))}
      />
      <VStack w="100%" spacing={10} fontWeight={500}>
        <VStack w="100%">
          <Image src="/breakfast_bonanza_logo.svg" w="60%" alt="sereneShen" />
        </VStack>
        {session ? (
          <VStack fontWeight={700} textAlign="center">
            <Text color="gray.700">
              Hi,{' '}
              <Text as="span" fontWeight={900} fontSize="2xl">
                {session?.user?.name}
              </Text>
            </Text>
            {gameMode === 'single' && (
              <Text>
                Press the start button to start the single player game!
              </Text>
            )}
            {gameMode === 'multi' && isHost && (
              <Text color="gray.500">
                All players are ready! Start the two-player game!
              </Text>
            )}
            {gameMode === 'multi' && !isHost && (
              <VStack spacing={2}>
                <Text color="gray.500">
                  Waiting for the host to start the game...
                </Text>
              </VStack>
            )}
            {gameMode === 'waiting' && (
              <VStack spacing={4}>
                <Text color="gray.500">
                  Waiting for other players to join...
                </Text>
                {roomId && (
                  <VStack spacing={2}>
                    <Box
                      bg="white"
                      px={4}
                      py={2}
                      borderRadius="lg"
                      cursor="pointer"
                      onClick={copyRoomId}
                      _hover={{ bg: 'gray.200' }}
                      transition="all 0.2s"
                    >
                      <HStack spacing={3} align="center">
                        <Text
                          fontSize="2xl"
                          fontWeight="bold"
                          letterSpacing="3px"
                          color="red.500"
                        >
                          {roomId}
                        </Text>
                        <FaRegCopy size={18} color="gray.500" opacity={0.7} />
                      </HStack>
                    </Box>
                  </VStack>
                )}
              </VStack>
            )}
          </VStack>
        ) : (
          <VStack textAlign="center">
            <Text>You are not logged in</Text>
            <Text>
              {gameMode === 'single'
                ? 'Login or register to record your game score and enter the ranking!'
                : 'Multi-player mode requires login to use'}
            </Text>
          </VStack>
        )}
        {gameMode === 'single' && (
          <StartButton
            onClick={() => {
              timerStart();
              dispatch(handleTimerStatus({ status: 'gameRunning' }));
              dispatch(clearScore());
            }}
          />
        )}
        {gameMode === 'multi' && isHost && (
          <StartButton
            onClick={() => {
              if (socket && roomId) {
                socket.emit('gameStart', roomId);
              }
              timerStart();
              dispatch(handleTimerStatus({ status: 'gameRunning' }));
              dispatch(clearScore());
            }}
          />
        )}
        {gameMode === 'waiting' && (
          <VStack spacing={4}>
            <Text fontSize="sm" color="gray.500" textAlign="center">
              Share the room code with friends, let them join the game
            </Text>
          </VStack>
        )}
        {timerStatus !== 'multiPlayerReady' && (
          <HStack>
            {session ? <LogoutButton /> : <LoginButton />}
            <ReturnButton
              onClick={() =>
                dispatch(handleTimerStatus({ status: 'modeSelection' }))
              }
            />
          </HStack>
        )}
      </VStack>
    </MotionBoard>
  );
};

export default ReadyStartBoard;
