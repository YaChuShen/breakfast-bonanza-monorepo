import { Box, HStack } from '@chakra-ui/react';
import React from 'react';
import CookTemplate from 'Components/CookTemplate';
import smartSize from 'helpers/smartSize';
import FoodPlateSection from 'Components/FoodPlateSection';
import FoodTemplate from 'Components/FoodTemplate';

const MaterialSection = ({ isLevel2 }) => {
  return (
    <HStack spacing={0}>
      <CookTemplate
        tool={'pan'}
        w={smartSize('9em', '11em', isLevel2)}
        zIndex={1}
        isLevel2={isLevel2}
      />
      {isLevel2 && (
        <CookTemplate
          tool={'pan'}
          w={smartSize('9em', '11em', isLevel2)}
          zIndex={1}
          isLevel2={isLevel2}
        />
      )}
      <FoodPlateSection isLevel2={isLevel2} />
      <Box pl="4">
        <FoodTemplate value={'coffee'} src={'coffee'} />
      </Box>
    </HStack>
  );
};

export default MaterialSection;
