import { Image } from '@chakra-ui/react';
import { BigTree } from 'helpers/rwd';
import Media from './Media';

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
        userSelect="none"
      />
    </Media>
  );
};

export default Grass1;
