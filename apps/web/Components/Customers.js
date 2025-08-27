import { Center, HStack, Image } from '@chakra-ui/react';
import { range } from 'lodash';
import React from 'react';
import { MAX_CUSTOMERS } from 'contents/rules';
import dynamic from 'next/dynamic';

const CustomerTemplate = dynamic(() => import('Components/CustomerTemplate'), {
  ssr: false,
});

const Customers = ({ currentData }) => {
  return (
    <Center pt="3em" pos="relative">
      <Image
        src="./window.svg"
        w="70em"
        minW="70em"
        alt="game"
        draggable="false"
      />
      <HStack
        pos="absolute"
        zIndex={1}
        spacing={20}
        alignItems="center"
        justifyContent="center"
        py={{ lg: 0, '2xl': 20 }}
      >
        {range(MAX_CUSTOMERS).map((e, i) => (
          <CustomerTemplate
            isLevel2={currentData?.isLevel2}
            wishFood={currentData[`customer${i + 1}`]?.order}
            status={currentData[`customer${i + 1}`]?.status}
            overtime={currentData[`customer${i + 1}`]?.overtime}
            id={`customer${i + 1}`}
            src={`customer${i + 1}`}
            key={e}
            className={i === 0 ? 'three-step' : ''}
          />
        ))}
      </HStack>
    </Center>
  );
};

export default Customers;
