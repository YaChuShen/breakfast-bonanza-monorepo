import { Image } from '@chakra-ui/react';
import React from 'react';

const LittleTree = () => {
  return (
    <Image
      src="/grass1.svg"
      pos="absolute"
      w="5em"
      right="14em"
      top="-6em"
      alt="littletree"
      draggable={false}
    />
  );
};

export default LittleTree;
