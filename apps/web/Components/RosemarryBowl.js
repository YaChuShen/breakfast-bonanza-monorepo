import { Box, Image } from '@chakra-ui/react';
import React from 'react';
import { useDispatch } from 'react-redux';
import { setTargetItem } from 'store/features/plateSlice';

const RosemarryBowl = () => {
  const dispatch = useDispatch();

  return (
    <Box position="absolute" top={{ base: '1em', lg: '-1em' }} right="25em">
      <Image
        src="./rosemarryBowl.svg"
        w="5.5em"
        alt="rosemarryBowl"
        pointerEvents="none"
      />
      <Image
        src="./rosemarry.svg"
        w="3em"
        alt="rosemarryBowl"
        position="absolute"
        top="0em"
        right="1em"
        draggable="true"
        cursor="grab"
        onDragStart={() => {
          dispatch(setTargetItem({ target: 'rosemarry' }));
        }}
      />
    </Box>
  );
};

export default RosemarryBowl;
