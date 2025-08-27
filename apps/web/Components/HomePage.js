'use client';
import { Box } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { signOut, useSession } from 'next-auth/react';
import { useSelector } from 'react-redux';
import { selectCustomer } from 'store/features/customerSlice';
import { useDispatch } from 'react-redux';
import { getInitCustomersState } from 'store/features/customerSlice';
import Table from 'Components/Table';
import React, { useEffect } from 'react';
import Media from 'Components/Media';
import Grass1 from 'Components/Grass1';
import GameStageBoard from 'Components/GameStageBoard';
import Tour from 'Components/Tour';
import Customers from 'Components/Customers';
import MobileAlertPage from 'Components/MobileAlertPage';

function HomePage({ dbData, profileId }) {
  const methods = useForm();
  const { data: session } = useSession();
  const currentData = useSelector(selectCustomer);
  const isLevel2 = dbData.isLevel2;
  const dispatch = useDispatch();

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

  return (
    <>
      <Media greaterThanOrEqual="md">
        <FormProvider {...methods}>
          <Tour profileId={profileId}>
            <GameStageBoard
              session={session}
              isTour={dbData.isTour}
              score={currentData.score}
              isLevel2={isLevel2}
            />
            <Customers currentData={currentData} />
            <Box pos="fixed" bottom="0" left="0" width="100%">
              <Grass1 />
              <Table isLevel2={isLevel2} />
            </Box>
          </Tour>
        </FormProvider>
      </Media>
      <Media lessThan="md">
        <MobileAlertPage />
      </Media>
    </>
  );
}

export default HomePage;
