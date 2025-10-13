'use client';

import { Box, Button, HStack, Image, Text, VStack } from '@chakra-ui/react';
import { FaUserFriends } from 'react-icons/fa';
import { MdPerson } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { setGameMode, handleTimerStatus } from 'store/features/gameConfigSlice';
import AuthSection from './AuthSection';
import MotionBoard from './MotionBoard';

const GameModeSelector = ({ session }) => {
  const dispatch = useDispatch();

  const handleSinglePlayerMode = () => {
    dispatch(setGameMode({ mode: 'single' }));
    dispatch(handleTimerStatus({ status: 'singlePlayerReady' }));
  };

  const handleMultiPlayerMode = () => {
    dispatch(setGameMode({ mode: 'multi' }));
    dispatch(handleTimerStatus({ status: 'multiPlayerOptions' }));
  };

  return (
    <MotionBoard py={{ md: '2em', xl: '6em' }} px="2em">
      <VStack w="100%" spacing={10} fontWeight={500}>
        <VStack w="100%" spacing={5}>
          <Image
            src="/breakfast_bonanza_logo.svg"
            w="60%"
            alt="breakfast bonanza logo"
          />
        </VStack>
        {session && (
          <VStack fontWeight={700}>
            <Text color="gray.700">
              Hi,{' '}
              <Text as="span" fontWeight={900} fontSize="2xl">
                {session?.user?.name}
              </Text>
            </Text>
            <Text>🍳 Select Your Game Mode</Text>
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
              transform: 'translateY(-2px)',
            }}
            transition="all 0.3s"
          >
            <VStack spacing={6} align="center" h="100%">
              <Box
                bg="orange.50"
                p={4}
                borderRadius="2xl"
                color="orange.400"
                fontSize="4xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <MdPerson />
              </Box>
              <Text fontSize="24px" fontWeight={700} color="gray.800">
                Single Player Mode
              </Text>
              <Text
                color="gray.600"
                fontSize="14px"
                lineHeight="1.6"
                textAlign="center"
                flex={1}
              >
                Challenge your speed and skills
              </Text>
              <Button
                onClick={handleSinglePlayerMode}
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
                w="100%"
              >
                Start
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
              transform: 'translateY(-2px)',
            }}
            transition="all 0.3s"
          >
            <VStack spacing={6} align="center" h="100%">
              <Box
                bg="orange.50"
                p={4}
                borderRadius="2xl"
                color="orange.400"
                fontSize="4xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FaUserFriends />
              </Box>
              <Text fontSize="24px" fontWeight={700} color="gray.800">
                Two-Player Mode
              </Text>
              <Text
                color="gray.600"
                fontSize="14px"
                lineHeight="1.6"
                textAlign="center"
                flex={1}
              >
                Compete with friends in breakfast cooking
              </Text>
              <Button
                onClick={handleMultiPlayerMode}
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
                w="100%"
              >
                Enter the lobby
              </Button>
            </VStack>
          </Box>
        </HStack>
        {!session && (
          <VStack textAlign="center" spacing={2}>
            <Text fontSize="sm" color="gray.600">
              Login to record your score and participate in the leaderboard!
            </Text>
          </VStack>
        )}
        {!session && <AuthSection />}
      </VStack>
    </MotionBoard>
  );
};

export default GameModeSelector;
