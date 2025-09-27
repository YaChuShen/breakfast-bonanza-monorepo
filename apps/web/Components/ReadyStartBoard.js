'use client';

import { Box, Button, Image, Text, VStack } from '@chakra-ui/react';
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
            {gameMode === 'single' && <Text>按下開始按鈕開始單人遊戲！</Text>}
            {gameMode === 'multi' && isHost && (
              <Text>所有玩家準備就緒！按下開始按鈕開始雙人遊戲！</Text>
            )}
            {gameMode === 'multi' && !isHost && (
              <VStack spacing={2}>
                <Text color="blue.500" fontSize="lg">
                  等待房間主人開始遊戲...
                </Text>
                <Text fontSize="sm" color="gray.600">
                  請耐心等待，主人將會開始遊戲
                </Text>
              </VStack>
            )}
            {gameMode === 'waiting' && (
              <VStack spacing={4}>
                <Text color="orange.500" fontSize="lg">
                  等待其他玩家加入...
                </Text>
                {roomId && (
                  <VStack spacing={2}>
                    <Text fontSize="sm" color="gray.600">
                      房間代碼：
                    </Text>
                    <Box
                      bg="gray.100"
                      px={4}
                      py={2}
                      borderRadius="lg"
                      cursor="pointer"
                      onClick={copyRoomId}
                      _hover={{ bg: 'gray.200' }}
                    >
                      <Text
                        fontSize="2xl"
                        fontWeight="bold"
                        letterSpacing="3px"
                        color="blue.500"
                      >
                        {roomId}
                      </Text>
                    </Box>
                    <Text fontSize="xs" color="gray.500">
                      點擊房間代碼即可複製
                    </Text>
                  </VStack>
                )}
              </VStack>
            )}
          </VStack>
        ) : (
          <VStack textAlign="center">
            <Text>您尚未登入</Text>
            <Text>
              {gameMode === 'single'
                ? '登入或註冊以記錄您的遊戲分數並進入排行榜！'
                : '多人模式需要登入才能使用'}
            </Text>
          </VStack>
        )}
        {gameMode === 'single' && (
          <StartButton
            onClick={() => {
              timerStart();
              dispatch(timerStatus({ status: 'gameRunning' }));
              dispatch(clearScore()); // 🎯 開始遊戲時清空分數
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
              分享房間代碼給朋友，讓他們加入遊戲
            </Text>
            <Button
              onClick={() => dispatch(timerStatus({ status: 'modeSelection' }))}
              variant="outline"
              colorScheme="gray"
              size="sm"
              borderRadius="lg"
              _hover={{ bg: 'gray.100' }}
            >
              ← 返回模式選擇
            </Button>
          </VStack>
        )}

        {!session && <AuthSection />}
      </VStack>
    </MotionBoard>
  );
};

export default ReadyStartBoard;
