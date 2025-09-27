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

  // 多人遊戲 Socket 事件監聽器
  useEffect(() => {
    if (!socket) return;

    // 有玩家加入房間
    const handlePlayerJoined = ({ playerId, playerName, playerEmail }) => {
      toast({
        title: '有新玩家加入！',
        description: `${playerName} 已加入房間`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    };

    // 房間準備就緒（2個玩家都在房間內）
    const handleRoomReady = ({ players, canStart, hostId }) => {
      dispatch(setRoomInfo({ playersInfo: players, hostId }));

      // 設置對手名稱
      if (players && players.length === 2 && session) {
        const currentUserId = session.id || session.profileId;
        const opponent = players.find((player) => player.id !== currentUserId);
        if (opponent) {
          dispatch(setOpponentScore({ score: 0, playerName: opponent.name }));
        }
      }

      if (canStart) {
        dispatch(timerStatus({ status: 'multiPlayerReady' }));
        toast({
          title: '房間已滿！',
          description: '所有玩家準備就緒，可以開始遊戲了！',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    // 主人開始遊戲
    const handleHostStartTheGame = () => {
      dispatch(timerStatus({ status: 'gameRunning' }));
      dispatch(clearScore()); // 🎯 開始遊戲時清空分數
      dispatch(setOpponentScore({ score: 0 })); // 🎯 重置對手分數
      toast({
        title: '遊戲開始！',
        description: '主人已開始遊戲，快開始製作早餐吧！',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      // 這裡需要觸發 timer 開始，但是我們沒有直接訪問 timerStart
      // 可以使用一個全域事件或者其他方式來處理
      window.dispatchEvent(new CustomEvent('multiPlayerGameStart'));
    };

    // 對手分數更新
    const handleOpponentScoreUpdate = ({ playerId, playerName, score }) => {
      dispatch(setOpponentScore({ score, playerName }));
    };

    // 綁定事件監聽器
    socket.on('playerJoined', handlePlayerJoined);
    socket.on('roomReady', handleRoomReady);
    socket.on('hostStartTheGame', handleHostStartTheGame);
    socket.on('opponentScoreUpdate', handleOpponentScoreUpdate);

    // 清理事件監聽器
    return () => {
      socket.off('playerJoined', handlePlayerJoined);
      socket.off('roomReady', handleRoomReady);
      socket.off('hostStartTheGame', handleHostStartTheGame);
      socket.off('opponentScoreUpdate', handleOpponentScoreUpdate);
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
