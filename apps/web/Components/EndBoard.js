'use client';

import { Button, VStack, HStack } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { LEVEL2_SCORE } from 'contents/rules';

import TotalScore from './endBoard/TotalScore';
import LevelUp from './endBoard/LevelUp';
import Leaderboard from './endBoard/Leaderboard';
import { selectGameConfig } from 'store/features/gameConfigSlice';
import { useSelector } from 'react-redux';
import MotionBoard from './MotionBoard';
import calculateRanking from 'helpers/calculateRanking';
import { trackEvent } from 'lib/mixpanel';
import { useRouter } from 'next/navigation';
import SignUpButton from './SignUpButton';

const endBoardVariants = {
  borderRadius: '3xl',
  p: '5',
  flex: 1,
  boxShadow: '0px 2px 20px 1px rgba(0, 0, 0, 0.15)',
};

const EndBoard = ({
  score,
  isRunning,
  session,
  isLevel2,
  currentLeaderboard,
  ...props
}) => {
  const { timerStatus } = useSelector(selectGameConfig);
  const router = useRouter();

  const { newLeaderboard, isTopFive } = calculateRanking(
    score,
    currentLeaderboard,
    session?.profileId,
    session?.user?.name
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pointsResult, leaderboardResult] = await Promise.allSettled([
          fetch('/api/pointsTable', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              score: score ?? 0,
              profileId: session?.profileId,
              timerStatus,
            }),
          }),
          fetch('/api/leaderboard', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              score: score ?? 0,
              profileId: session?.profileId,
              name: session?.name,
              timerStatus,
              timestamp: Date.now(),
              newLeaderboard,
            }),
          }),
        ]);

        if (pointsResult.status === 'rejected') {
          console.error('Points API failed:', pointsResult.reason);
        }

        if (leaderboardResult.status === 'fulfilled') {
          const data = await leaderboardResult.value.json();
          return data;
        } else {
          console.error('Leaderboard API failed:', leaderboardResult.reason);
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    trackEvent('Game Completion', {
      timestamp: new Date().toISOString(),
      score,
      isUser: session?.profileId ? true : false,
      isLevel2,
      profileId: session?.profileId,
    });
  }, []);

  const showLevelUpMessege = score > LEVEL2_SCORE && !isLevel2;
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
          <HStack alignItems="stretch" px="2em" spacing={5}>
            {showLevelUpMessege && (
              <LevelUp endBoardVariants={endBoardVariants} />
            )}
            {(newLeaderboard || !isRunning) && (
              <Leaderboard
                newLeaderboard={newLeaderboard}
                endBoardVariants={endBoardVariants}
                isLoading={!newLeaderboard}
                profileId={session?.profileId}
              />
            )}
          </HStack>
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
