import React from 'react';
import Media from './Media';
import { Image } from '@chakra-ui/react';
import { BigTree } from 'helpers/rwd';

const Grass1 = () => {
  return (
    <Media greaterThanOrEqual="xl">
      <Image
        src="/gress2.svg"
        w={{ base: '14em', '2xl': '18em' }}
        alt=""
        pos="absolute"
        left="-5em"
        bottom={BigTree}
        zIndex={1}
        draggable={false}
      />
    </Media>
  );
};

export default Grass1;
