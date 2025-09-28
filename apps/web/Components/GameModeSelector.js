'use client';

import { Button, Image, Text, VStack } from '@chakra-ui/react';
import { useDispatch } from 'react-redux';
import { setGameMode, timerStatus } from 'store/features/gameConfigSlice';
import AuthSection from './AuthSection';
import MotionBoard from './MotionBoard';

const GameModeSelector = ({ session }) => {
  const dispatch = useDispatch();

  const handleSinglePlayerMode = () => {
    dispatch(setGameMode({ mode: 'single' }));
    dispatch(timerStatus({ status: 'singlePlayerReady' }));
  };

  const handleMultiPlayerMode = () => {
    dispatch(setGameMode({ mode: 'multi' }));
    dispatch(timerStatus({ status: 'multiPlayerOptions' }));
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
          <Text
            color="red.500"
            fontSize="20px"
            fontWeight={700}
            textAlign="center"
          >
            選擇遊戲模式
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
            <Text>選擇您的遊戲模式</Text>
          </VStack>
        )}
        <VStack spacing={6} w="100%" maxW="400px">
          <Button
            onClick={handleSinglePlayerMode}
            bg="blue.500"
            color="white"
            fontSize="18px"
            py="6"
            px="12"
            w="100%"
            size="xl"
            borderRadius="xl"
            letterSpacing="1px"
            _hover={{ bg: 'blue.400', transform: 'scale(1.05)' }}
            _active={{ transform: 'scale(0.95)' }}
            fontWeight={700}
            transition="all 0.2s"
          >
            🍳 單人模式
          </Button>
          <Button
            onClick={handleMultiPlayerMode}
            bg="green.500"
            color="white"
            fontSize="18px"
            py="6"
            px="12"
            w="100%"
            size="xl"
            borderRadius="xl"
            letterSpacing="1px"
            _hover={{ bg: 'green.400', transform: 'scale(1.05)' }}
            _active={{ transform: 'scale(0.95)' }}
            fontWeight={700}
            transition="all 0.2s"
          >
            👥 雙人模式
          </Button>
        </VStack>
        {!session && (
          <VStack textAlign="center" spacing={2}>
            <Text fontSize="sm" color="gray.600">
              登入後可記錄分數並參與排行榜！
            </Text>
          </VStack>
        )}
        {!session && <AuthSection />}
      </VStack>
    </MotionBoard>
  );
};

export default GameModeSelector;
