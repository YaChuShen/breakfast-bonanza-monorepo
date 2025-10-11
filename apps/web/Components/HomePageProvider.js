'use client';

import { useToast } from '@chakra-ui/react';
import HomePage from 'Components/HomePage';
import { useScoreSync } from 'hooks/useScoreSync';
import { signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useSocket } from 'src/app/socketIoProvider';
import {
  clearScore,
  getInitCustomersState,
  selectCustomer,
} from 'store/features/customerSlice';
import {
  resetGameConfig,
  setOpponentScore,
  setRoomInfo,
  timerStatus,
} from 'store/features/gameConfigSlice';

const HomePageProvider = ({ dbData, profileId }) => {
  const methods = useForm();
  const { data: session } = useSession();
  const currentData = useSelector(selectCustomer);
  const isLevel2 = dbData?.isLevel2;
  const dispatch = useDispatch();
  const socket = useSocket();
  const toast = useToast();

  // 處理分數同步到多人遊戲
  useScoreSync();

  useEffect(() => {
    try {
      dispatch(getInitCustomersState({ isLevel2 }));
    } catch (error) {
      console.error('Failed to initialize customer state:', error);
    }
  }, [dispatch, isLevel2]);

  useEffect(() => {
    if (!session) return;

    const tokenExpiry = session.expjwt * 1000;
    const currentTime = Date.now();
    let logoutTimer;

    if (tokenExpiry <= currentTime) {
      console.log('Token expired');
      signOut();
    }

    // Set timer to sign out when token expires
    const timeUntilExpiry = tokenExpiry - currentTime;
    logoutTimer = setTimeout(() => {
      console.log('Token expired');
      signOut();
    }, timeUntilExpiry);

    return () => clearTimeout(logoutTimer);
  }, [session]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handlePlayerJoined = ({ playerName }) => {
      toast({
        title: 'New player joined!',
        description: `${playerName} joined the room`,
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    };

    const handleRoomReady = ({ players, canStart, hostId }) => {
      dispatch(setRoomInfo({ playersInfo: players, hostId }));

      if (players && players.length === 2 && session) {
        const currentUserId = session.id || session.profileId;
        const opponent = players.find((player) => player.id !== currentUserId);
        if (opponent) {
          dispatch(setOpponentScore({ score: 0, playerName: opponent.name }));
        }
      }

      if (canStart) {
        dispatch(timerStatus({ status: 'multiPlayerReady' }));
      }
    };

    const handleHostStartTheGame = () => {
      dispatch(timerStatus({ status: 'gameRunning' }));
      dispatch(clearScore());
      dispatch(setOpponentScore({ score: 0 }));
      toast({
        title: 'game started',
        description: 'start making breakfast!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      window.dispatchEvent(new CustomEvent('multiPlayerGameStart'));
    };

    const handleOpponentScoreUpdate = ({ playerId, playerName, score }) => {
      const isOpponentUpdate = playerId !== (session?.id || session?.profileId);

      if (isOpponentUpdate) {
        dispatch(setOpponentScore({ score, playerName }));
      }
    };

    const handlePlayerDisconnected = ({
      playerId,
      playerName,
      isHostDisconnected,
    }) => {
      console.log('Player disconnected:', {
        playerId,
        playerName,
        isHostDisconnected,
      });

      dispatch(resetGameConfig());

      if (isHostDisconnected) {
        toast({
          title: 'host disconnected',
          description: 'return to mode selection',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'player disconnected',
          description: `${playerName} disconnected, return to mode selection`,
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    socket.on('playerJoined', handlePlayerJoined);
    socket.on('roomReady', handleRoomReady);
    socket.on('hostStartTheGame', handleHostStartTheGame);
    socket.on('playerDisconnected', handlePlayerDisconnected);

    // 特別檢查 opponentScoreUpdate 事件
    socket.on('opponentScoreUpdate', (data) => {
      handleOpponentScoreUpdate(data);
    });

    return () => {
      socket.off('playerJoined', handlePlayerJoined);
      socket.off('roomReady', handleRoomReady);
      socket.off('hostStartTheGame', handleHostStartTheGame);
      socket.off('playerDisconnected', handlePlayerDisconnected);
      socket.off('opponentScoreUpdate', handleOpponentScoreUpdate);
      socket.offAny();
    };
  }, [socket, dispatch, toast, session]);

  return (
    <FormProvider {...methods}>
      <HomePage
        session={session}
        currentData={currentData}
        dbData={dbData}
        profileId={profileId}
        isLevel2={isLevel2}
        methods={methods}
      />
    </FormProvider>
  );
};

export default HomePageProvider;
