'use client';

import { Button, HStack, VStack } from '@chakra-ui/react';
import { LEVEL2_SCORE } from 'contents/rules';
import { once } from 'lodash';
import { useEffect, useMemo, useRef } from 'react';

import calculateRanking from 'helpers/calculateRanking';
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
  const scoreSubmittedRef = useRef(false);

  const { newLeaderboard, isTopFive } = calculateRanking(
    score,
    currentLeaderboard,
    session?.profileId,
    session?.user?.name
  );

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
        console.log('Score already submitted, skipping...');
        return;
      }

      try {
        scoreSubmittedRef.current = true;
        await graphqlClient.addScore(session?.profileId, score, timerStatus);
        console.log('Score submitted successfully');
      } catch (error) {
        console.error('Error adding score:', error);
        scoreSubmittedRef.current = false;
      }
    };

    if (
      session?.profileId &&
      score !== undefined &&
      timerStatus === 'end' &&
      !scoreSubmittedRef.current
    ) {
      addScore();
    }
  }, [session?.profileId, score, timerStatus]);

  useEffect(() => {
    trackGameCompletion();
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
