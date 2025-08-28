'use client';
import { Box } from '@chakra-ui/react';
import Customers from 'Components/Customers';
import GameStageBoard from 'Components/GameStageBoard';
import Grass1 from 'Components/Grass1';
import Media from 'Components/Media';
import MobileAlertPage from 'Components/MobileAlertPage';
import Table from 'Components/Table';
import Tour from 'Components/Tour';

function HomePage({ session, currentData, dbData, profileId, isLevel2 }) {
  return (
    <>
      <Media greaterThanOrEqual="md">
        <Tour profileId={profileId}>
          <GameStageBoard
            session={session}
            isTour={dbData?.isTour}
            score={currentData?.score}
            isLevel2={isLevel2}
          />
          <Customers currentData={currentData} />
          <Box pos="fixed" bottom="0" left="0" width="100%">
            <Grass1 />
            <Table isLevel2={isLevel2} />
          </Box>
        </Tour>
      </Media>
      <Media lessThan="md">
        <MobileAlertPage />
      </Media>
    </>
  );
}

export default HomePage;
