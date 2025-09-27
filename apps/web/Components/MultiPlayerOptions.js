'use client';

import {
  Box,
  Button,
  Image,
  Input,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSocket } from 'src/app/socketIoProvider';
import { setRoomInfo, timerStatus } from 'store/features/gameConfigSlice';
import MotionBoard from './MotionBoard';

const MultiPlayerOptions = ({ session }) => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const toast = useToast();
  const [roomCode, setRoomCode] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // 創建房間成功
    const handleRoomCreated = ({ roomId }) => {
      setIsCreatingRoom(false);
      const currentUserId = session.id || session.profileId;
      dispatch(setRoomInfo({ roomId, hostId: currentUserId }));
      dispatch(timerStatus({ status: 'waitingForPlayer', roomId }));
      toast({
        title: '房間建立成功！',
        description: `房間代碼：${roomId}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      // 複製房間代碼到剪貼簿
      navigator.clipboard?.writeText(roomId);
    };

    // 創建房間失敗
    const handleCreateRoomError = (error) => {
      setIsCreatingRoom(false);
      toast({
        title: '建立房間失敗',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    };

    // 加入房間成功
    const handleJoinedRoom = ({ roomId }) => {
      setIsJoiningRoom(false);
      dispatch(setRoomInfo({ roomId }));
      dispatch(timerStatus({ status: 'multiPlayerReady', roomId }));
      toast({
        title: '成功加入房間！',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    };

    // 加入房間失敗
    const handleJoinRoomError = (error) => {
      setIsJoiningRoom(false);
      toast({
        title: '加入房間失敗',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    };

    // 綁定事件監聽器
    socket.on('roomCreated', handleRoomCreated);
    socket.on('createRoomError', handleCreateRoomError);
    socket.on('joinedRoom', handleJoinedRoom);
    socket.on('joinRoomError', handleJoinRoomError);

    // 清理事件監聽器
    return () => {
      socket.off('roomCreated', handleRoomCreated);
      socket.off('createRoomError', handleCreateRoomError);
      socket.off('joinedRoom', handleJoinedRoom);
      socket.off('joinRoomError', handleJoinRoomError);
    };
  }, [socket, dispatch, toast]);

  const handleCreateRoom = () => {
    if (!session) {
      toast({
        title: '請先登入',
        description: '建立房間需要登入帳號',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!socket) {
      toast({
        title: '連接失敗',
        description: '請稍後再試',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsCreatingRoom(true);
    socket.emit('createRoom', {
      playerId: session.id || session.profileId,
      playerName: session.user.name || session.name,
    });
  };

  const handleJoinRoom = () => {
    if (!session) {
      toast({
        title: '請先登入',
        description: '加入房間需要登入帳號',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!roomCode.trim()) {
      toast({
        title: '請輸入房間代碼',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    if (!socket) {
      toast({
        title: '連接失敗',
        description: '請稍後再試',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsJoiningRoom(true);
    socket.emit('joinRoom', {
      roomId: roomCode.trim(),
      playerId: session.id || session.profileId,
      playerName: session.user.name || session.name,
    });
  };

  const handleBackToModeSelect = () => {
    dispatch(timerStatus({ status: 'modeSelection' }));
  };

  return (
    <MotionBoard py={{ md: '2em', xl: '6em' }} px="2em">
      <VStack w="100%" spacing={8} fontWeight={500}>
        <VStack w="100%" spacing={5}>
          <Image
            src="/breakfast_bonanza_logo.svg"
            w="60%"
            alt="breakfast bonanza logo"
          />
          <Text
            color="green.500"
            fontSize="20px"
            fontWeight={700}
            textAlign="center"
          >
            雙人模式選項
          </Text>
        </VStack>

        {session && (
          <VStack fontWeight={700}>
            <Text color="gray.700">
              Hi,{' '}
              <Text as="span" fontWeight={900} fontSize="2xl">
                {session?.user?.name}
              </Text>
            </Text>
            <Text>選擇您要創建房間還是加入房間</Text>
          </VStack>
        )}

        <VStack spacing={6} w="100%" maxW="400px">
          {/* 創建房間 */}
          <VStack spacing={4} w="100%">
            <Text fontWeight={600} color="gray.700">
              創建新房間
            </Text>
            <Button
              onClick={handleCreateRoom}
              isLoading={isCreatingRoom}
              loadingText="建立中..."
              bg="green.500"
              color="white"
              fontSize="16px"
              py="5"
              px="8"
              w="100%"
              size="lg"
              borderRadius="xl"
              letterSpacing="1px"
              _hover={{ bg: 'green.400', transform: 'scale(1.02)' }}
              _active={{ transform: 'scale(0.98)' }}
              fontWeight={700}
              transition="all 0.2s"
            >
              🏠 創建房間
            </Button>
          </VStack>

          {/* 分隔線 */}
          <Box w="80%" h="1px" bg="gray.200" />

          {/* 加入房間 */}
          <VStack spacing={4} w="100%">
            <Text fontWeight={600} color="gray.700">
              加入現有房間
            </Text>
            <Input
              placeholder="輸入房間代碼"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              size="lg"
              borderRadius="xl"
              borderColor="gray.300"
              _hover={{ borderColor: 'green.300' }}
              _focus={{
                borderColor: 'green.500',
                boxShadow: '0 0 0 1px #38a169',
              }}
              textAlign="center"
              fontSize="16px"
              letterSpacing="2px"
            />
            <Button
              onClick={handleJoinRoom}
              isLoading={isJoiningRoom}
              loadingText="加入中..."
              bg="blue.500"
              color="white"
              fontSize="16px"
              py="5"
              px="8"
              w="100%"
              size="lg"
              borderRadius="xl"
              letterSpacing="1px"
              _hover={{ bg: 'blue.400', transform: 'scale(1.02)' }}
              _active={{ transform: 'scale(0.98)' }}
              fontWeight={700}
              transition="all 0.2s"
            >
              🚪 加入房間
            </Button>
          </VStack>
        </VStack>

        {/* 返回按鈕 */}
        <Button
          onClick={handleBackToModeSelect}
          variant="outline"
          colorScheme="gray"
          size="sm"
          borderRadius="lg"
          _hover={{ bg: 'gray.100' }}
        >
          ← 返回模式選擇
        </Button>

        {!session && (
          <VStack textAlign="center" spacing={2}>
            <Text fontSize="sm" color="red.500" fontWeight={600}>
              ⚠️ 雙人模式需要先登入
            </Text>
          </VStack>
        )}
      </VStack>
    </MotionBoard>
  );
};

export default MultiPlayerOptions;
