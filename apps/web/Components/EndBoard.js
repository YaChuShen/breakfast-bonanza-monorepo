'use client';

import { Box, Button, Divider, HStack, Text, VStack } from '@chakra-ui/react';
import { LEVEL2_SCORE } from 'contents/rules';
import { once } from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';

import graphqlClient from 'lib/api-client';
import { trackEvent } from 'lib/mixpanel';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectGameConfig } from 'store/features/gameConfigSlice';
import Leaderboard from './endBoard/Leaderboard';
import LevelUp from './endBoard/LevelUp';
import TotalScore from './endBoard/TotalScore';
import MotionBoard from './MotionBoard';
import SignUpButton from './SignUpButton';

const endBoardVariants = {
  borderRadius: '3xl',
  p: '5',
  flex: 1,
};

const EndBoard = ({ score, isRunning, session, isLevel2, ...props }) => {
  const { timerStatus, gameMode, opponentScore, opponentName } =
    useSelector(selectGameConfig);
  const router = useRouter();
  const scoreSubmittedRef = useRef(false);
  const [currentLeaderboard, setCurrentLeaderboard] = useState([]);

  const isTopFive =
    currentLeaderboard.length > 0 && score > currentLeaderboard[0].score;

  const trackGameCompletion = useMemo(
    () =>
      once(() => {
        trackEvent('Game Completion', {
          timestamp: new Date().toISOString(),
          score,
          isUser: session?.profileId ? true : false,
          isLevel2,
          profileId: session?.profileId,
        });
      }),
    []
  );

  useEffect(() => {
    const addScore = async () => {
      if (scoreSubmittedRef.current) {
        return;
      }
      try {
        scoreSubmittedRef.current = true;
        await graphqlClient.addScore(session?.profileId, score, timerStatus);
      } catch (error) {
        console.error('Error adding score:', error);
        scoreSubmittedRef.current = false;
      }
    };

    const getLeaderboard = async () => {
      try {
        const data = await graphqlClient.getLeaderboard(5);
        setCurrentLeaderboard(data.getLeaderboard);
      } catch (error) {
        console.error('獲取排行榜失敗:', error);
        setCurrentLeaderboard([]);
      }
    };

    const checkScoreSubmitted = async () => {
      if (scoreSubmittedRef.current) {
        return;
      }
      if (session?.profileId) {
        await addScore();
      }
      await getLeaderboard();
    };

    if (
      score !== undefined &&
      timerStatus === 'end' &&
      !scoreSubmittedRef.current
    ) {
      checkScoreSubmitted();
    }
  }, [session?.profileId, score, timerStatus]);

  useEffect(() => {
    trackGameCompletion();
  }, []);

  const showLevelUpMessege = score > LEVEL2_SCORE && !isLevel2;

  const isMultiPlayer = gameMode === 'multi';
  const getGameResult = () => {
    if (score > opponentScore) return 'WIN';
    if (score < opponentScore) return 'LOSE';
    return 'DRAW';
  };
  return (
    <MotionBoard {...props}>
      {!isRunning && (
        <VStack
          w="100%"
          spacing={{ lg: '1.5em', '2xl': '2em' }}
          fontWeight={700}
        >
          <TotalScore
            showLevelUpMessege={showLevelUpMessege}
            score={score}
            isEnterLeaderboard={isTopFive}
            isLogin={session?.profileId}
          />
          {isMultiPlayer ? (
            <VStack spacing={5} px="2em">
              <Box
                {...endBoardVariants}
                bg="white"
                textAlign="center"
                minW="600px"
              >
                <VStack spacing={4}>
                  <Text
                    fontSize="4xl"
                    fontWeight="black"
                    color={getGameResult() === 'WIN' ? 'black' : 'gray.400'}
                  >
                    {getGameResult() === 'WIN' && 'YOU WIN!'}
                    {getGameResult() === 'LOSE' && 'YOU LOSE!'}
                    {getGameResult() === 'DRAW' && 'DRAW!'}
                  </Text>

                  <Divider />
                  <HStack spacing={8} w="100%">
                    <VStack flex={1}>
                      <Text fontSize="lg" fontWeight="bold" color="red.500">
                        YOU
                      </Text>
                      <Text fontSize="3xl" fontWeight="black" color="red.500">
                        {score ?? 0}
                      </Text>
                    </VStack>

                    <Text color="gray.400" fontWeight="bold">
                      VS
                    </Text>
                    <VStack flex={1}>
                      <Text fontSize="lg" fontWeight="bold">
                        {opponentName || 'OPPONENT'}
                      </Text>
                      <Text fontSize="3xl" fontWeight="black">
                        {opponentScore ?? 0}
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          ) : (
            <HStack alignItems="stretch" px="2em" spacing={5}>
              {showLevelUpMessege && (
                <LevelUp endBoardVariants={endBoardVariants} />
              )}
              {(currentLeaderboard || !isRunning) && (
                <Leaderboard
                  newLeaderboard={currentLeaderboard}
                  endBoardVariants={endBoardVariants}
                  isLoading={
                    !currentLeaderboard || currentLeaderboard.length === 0
                  }
                  profileId={session?.profileId}
                />
              )}
            </HStack>
          )}
          <HStack>
            <Button
              bg="red.500"
              color="white"
              fontSize="20px"
              size="lg"
              borderRadius="xl"
              letterSpacing="1px"
              _hover={{ bg: 'red.300', color: 'white' }}
              fontWeight={900}
              onClick={() => {
                try {
                  console.log('Redirecting to home...');
                  window.location.reload();
                } catch (error) {
                  console.error('Navigation error:', error);
                }
              }}
            >
              Re-START
            </Button>
            {!session?.profileId && (
              <SignUpButton
                onClick={() =>
                  router.push(`/register?source=game_completion&score=${score}`)
                }
                size="lg"
              />
            )}
          </HStack>
        </VStack>
      )}
    </MotionBoard>
  );
};

export default EndBoard;
