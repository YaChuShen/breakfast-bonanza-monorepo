'use client';

import { Box, Button, HStack, Image, Text, VStack } from '@chakra-ui/react';
import { FaRegCopy } from 'react-icons/fa6';
import { useDispatch, useSelector } from 'react-redux';
import { useSocket } from 'src/app/socketIoProvider';
import { clearScore } from 'store/features/customerSlice';
import { selectGameConfig, timerStatus } from 'store/features/gameConfigSlice';
import AuthSection from './AuthSection';
import MotionBoard from './MotionBoard';
import StartButton from './StartButton';

const ReadyStartBoard = ({ session, timerStart, gameMode = 'single' }) => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const { roomId, playersInfo, hostId } = useSelector(selectGameConfig);

  // 判斷當前用戶是否為房間主人
  const isHost =
    session &&
    hostId &&
    (session.id === hostId || session.profileId === hostId);

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard?.writeText(roomId);
      // 可以加入 toast 通知
    }
  };
  return (
    <MotionBoard py={{ md: '2em', xl: '6em' }} px="2em">
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
              <Text>All players are ready! Start the two-player game!</Text>
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
                ? 'Login or register to record your game score and enter the排行榜！'
                : 'Multi-player mode requires login to use'}
            </Text>
          </VStack>
        )}
        {gameMode === 'single' && (
          <StartButton
            onClick={() => {
              timerStart();
              dispatch(timerStatus({ status: 'gameRunning' }));
              dispatch(clearScore());
            }}
          />
        )}
        {gameMode === 'multi' && isHost && (
          <StartButton
            onClick={() => {
              // 通知所有玩家開始遊戲
              if (socket && roomId) {
                socket.emit('gameStart', roomId);
              }
              // 本地也要開始
              timerStart();
              dispatch(timerStatus({ status: 'gameRunning' }));
              dispatch(clearScore()); // 🎯 開始遊戲時清空分數
            }}
          />
        )}

        {gameMode === 'waiting' && (
          <VStack spacing={4}>
            <Text fontSize="sm" color="gray.500" textAlign="center">
              Share the room code with friends, let them join the game
            </Text>
            <Button
              onClick={() => dispatch(timerStatus({ status: 'modeSelection' }))}
              variant="outline"
              colorScheme="gray"
              size="md"
              borderRadius="2xl"
              color="gray.700"
              _hover={{ bg: 'gray.100' }}
            >
              ← Return to mode selection
            </Button>
          </VStack>
        )}

        {!session && <AuthSection />}
      </VStack>
    </MotionBoard>
  );
};

export default ReadyStartBoard;
