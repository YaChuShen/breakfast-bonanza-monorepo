'use client';

import HomePage from 'Components/HomePage';
import { signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import {
  getInitCustomersState,
  selectCustomer,
} from 'store/features/customerSlice';

const HomePageProvider = ({ dbData, profileId }) => {
  const methods = useForm();
  const { data: session } = useSession();
  const currentData = useSelector(selectCustomer);
  const isLevel2 = dbData?.isLevel2;
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
