'use client';

import {
  Box,
  Button,
  HStack,
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
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';
import MotionBoard from './MotionBoard';
import ReturnButton from './ReturnButton';
import ReturnText from './ReturnText';

const MultiPlayerOptions = ({ session }) => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const toast = useToast();
  const [roomCode, setRoomCode] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleRoomCreated = ({ roomId }) => {
      setIsCreatingRoom(false);
      const currentUserId = session.id || session.profileId;
      dispatch(setRoomInfo({ roomId, hostId: currentUserId }));
      dispatch(timerStatus({ status: 'waitingForPlayer', roomId }));
      toast({
        title: 'Room created successfully!',
        description: `Room code: ${roomId}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigator.clipboard?.writeText(roomId);
    };

    const handleCreateRoomError = (error) => {
      setIsCreatingRoom(false);
      toast({
        title: 'Failed to create the room!',
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
        title: 'Successfully joined the room!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    };

    // 加入房間失敗
    const handleJoinRoomError = (error) => {
      setIsJoiningRoom(false);
      toast({
        title: 'Failed to join the room!',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    };

    socket.on('roomCreated', handleRoomCreated);
    socket.on('createRoomError', handleCreateRoomError);
    socket.on('joinedRoom', handleJoinedRoom);
    socket.on('joinRoomError', handleJoinRoomError);

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
        title: 'Please login first',
        description: 'Creating a room requires login',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!socket) {
      toast({
        title: 'Connection failed',
        description: 'Please try again later',
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
        title: 'Please login first',
        description: 'Joining a room requires login',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!roomCode.trim()) {
      toast({
        title: 'Please enter the room code',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    if (!socket) {
      toast({
        title: 'Connection failed',
        description: 'Please try again later',
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
    <MotionBoard py={{ md: '2em', xl: '3em' }} px="2em" pos="relative">
      <ReturnText onClick={handleBackToModeSelect} />
      <VStack w="100%" spacing={8} fontWeight={500}>
        <VStack w="100%" spacing={5}>
          <Image
            src="/breakfast_bonanza_logo.svg"
            w="60%"
            alt="breakfast bonanza logo"
          />
          <Text
            color="red.500"
            fontSize="20px"
            fontWeight={700}
            textAlign="center"
          >
            Two-Player Mode
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
            <Text>Choose whether to create a room or join a room</Text>
          </VStack>
        )}
        <HStack spacing={6} w="100%" maxW="800px" align="stretch">
          <Box
            bg="white"
            borderRadius="3xl"
            boxShadow="0 5px 10px 0 rgba(0, 0, 0, 0.01)"
            p={8}
            flex={1}
            border="2px solid"
            borderColor="transparent"
            _hover={{
              boxShadow: '0 5px 15px 0 rgba(252, 180, 109, 0.3)',
              transform: 'translateY(-2px)',
            }}
            transition="all 0.3s"
          >
            <VStack spacing={6} align="stretch" h="100%">
              <HStack spacing={3}>
                <Box
                  bg="orange.50"
                  p={2}
                  borderRadius="lg"
                  color="orange.500"
                  fontSize="xl"
                  fontWeight="bold"
                >
                  +
                </Box>
                <Text fontSize="20px" fontWeight={700} color="gray.800">
                  Create a new room
                </Text>
              </HStack>
              <Text color="gray.600" fontSize="14px" lineHeight="1.6" flex={1}>
                Invite friends to join the battle
              </Text>
              <Button
                onClick={handleCreateRoom}
                isLoading={isCreatingRoom}
                loadingText="Creating..."
                bg="red.500"
                color="white"
                fontSize="16px"
                py={6}
                borderRadius="xl"
                fontWeight={700}
                _hover={{ bg: 'orange.500', transform: 'scale(1.02)' }}
                _active={{ transform: 'scale(0.98)' }}
                transition="all 0.2s"
                size="lg"
                disabled={!session}
              >
                Create
              </Button>
            </VStack>
          </Box>
          <Box
            bg="white"
            borderRadius="3xl"
            boxShadow="0 5px 10px 0 rgba(0, 0, 0, 0.01)"
            p={8}
            flex={1}
            border="2px solid"
            borderColor="transparent"
            _hover={{
              boxShadow: '0 5px 15px 0 rgba(252, 180, 109, 0.3)',
              transform: 'translateY(-2px)',
            }}
            transition="all 0.3s"
          >
            <VStack spacing={6} align="stretch" h="100%">
              <HStack spacing={3}>
                <Box bg="orange.50" p={2} borderRadius="lg" fontSize="lg">
                  🚪
                </Box>
                <Text fontSize="20px" fontWeight={700} color="gray.800">
                  Join a room
                </Text>
              </HStack>
              <Text color="gray.600" fontSize="14px" fontWeight={600}>
                Room code
              </Text>
              <Input
                placeholder="Enter 6-digit code..."
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                size="lg"
                borderRadius="xl"
                borderColor="gray.200"
                bg="gray.50"
                textAlign="center"
                fontSize="16px"
                fontWeight={500}
                _placeholder={{ color: 'gray.500', fontSize: '12px' }}
                _hover={{ borderColor: 'orange.300', bg: 'white' }}
                _focus={{
                  borderColor: 'orange.400',
                  boxShadow: '0 0 0 1px #f6ad55',
                  bg: 'white',
                }}
                transition="all 0.2s"
              />
              <Button
                onClick={handleJoinRoom}
                isLoading={isJoiningRoom}
                loadingText="加入中..."
                bg="red.500"
                color="white"
                fontSize="16px"
                py={6}
                borderRadius="xl"
                fontWeight={700}
                _hover={{ bg: 'orange.500', transform: 'scale(1.02)' }}
                _active={{ transform: 'scale(0.98)' }}
                transition="all 0.2s"
                size="lg"
                mt="auto"
                disabled={!session}
              >
                Join
              </Button>
            </VStack>
          </Box>
        </HStack>
        {!session && (
          <Text fontSize="sm" color="red.500" fontWeight={600}>
            ⚠️ Two-Player Mode requires login first
          </Text>
        )}
        <HStack w="100%" justify="center" spacing={2}>
          {session ? <LogoutButton /> : <LoginButton />}
          <ReturnButton onClick={handleBackToModeSelect} />
        </HStack>
      </VStack>
    </MotionBoard>
  );
};

export default MultiPlayerOptions;
