import { HStack } from '@chakra-ui/react';
import React from 'react';
import Plate from './Plate';
import { range } from 'lodash';
import { selectPlate } from 'store/features/plateSlice';
import { useSelector } from 'react-redux';

const PlateSection = () => {
  const plateData = useSelector(selectPlate);

  return (
    <HStack
      spacing={10}
      w="100%"
      justifyContent="center"
      pos="absolute"
      top="-1.5em"
    >
      {range(plateData?.plate).map((e, i) => (
        <Plate
          data={plateData}
          index={e}
          key={i}
          className={e === 0 ? 'two-step' : ''}
        />
      ))}
    </HStack>
  );
};

export default PlateSection;
