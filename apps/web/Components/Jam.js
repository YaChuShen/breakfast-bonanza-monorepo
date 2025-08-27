import { Box, HStack } from '@chakra-ui/react';
import React from 'react';
import autoJamSystem from '../helpers/autoJamSystem';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { selectPlate } from 'store/features/plateSlice';
import Image from 'next/image';

const jamArr = [
  { init: 'blueberry-can', done: 'blueberry' },
  { init: 'butter-can', done: 'butter' },
];

const Jam = () => {
  const plateData = useSelector(selectPlate);
  const dispatch = useDispatch();

  return (
    <HStack userSelect="none">
      {jamArr.map((e, i) => (
        <Box
          key={i}
          px="0"
          cursor="pointer"
          onClick={() => {
            autoJamSystem(plateData, e.done, dispatch);
          }}
        >
          <Image
            src={`/${e.init}.svg`}
            width={50}
            height={60}
            pointerEvents="none"
            draggable={false}
            alt="jam"
          />
        </Box>
      ))}
    </HStack>
  );
};

export default Jam;
