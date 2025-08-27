import { HStack, Stack } from '@chakra-ui/react';
import React from 'react';
import smartSize from 'helpers/smartSize';
import Toaster from 'Components/Toaster';
import Jam from 'Components/Jam';
import FoodTemplate from 'Components/FoodTemplate';

const ToasterSection = ({ isLevel2 }) => {
  return (
    <Stack
      spacing={0}
      direction={{ base: isLevel2 ? 'column' : 'row', lg: 'row' }}
      alignItems="center"
    >
      <HStack>
        <Toaster w={smartSize('5em', '7em', isLevel2)} tool={undefined} />
        {isLevel2 && (
          <Toaster w={smartSize('5em', '7em', isLevel2)} tool={undefined} />
        )}
      </HStack>
      <Stack direction={{ base: isLevel2 ? 'row' : 'column', lg: 'column' }}>
        <Jam />
        <FoodTemplate
          value={'toast0'}
          src={'toast0'}
          w={{ base: '4.5em', lg: '5.5em' }}
        />
      </Stack>
    </Stack>
  );
};

export default ToasterSection;
