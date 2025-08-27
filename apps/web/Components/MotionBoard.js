import { Box, Flex } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionComponent = motion(Box);

const MotionBoard = ({ children, py = '1.5em', minH = '20em', ...props }) => {
  return (
    <Flex h="100vh" align="center" justify="center">
      <MotionComponent
        py={py}
        bg="rgba(255, 255, 255, 0.9)"
        w="60%"
        zIndex={20}
        initial={{ opacity: 0.2, x: 0, y: -600, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
        exit={{
          opacity: 0,
          y: -300,
          scale: 0.8,
          transition: { duration: 0.3, type: 'spring' },
        }}
        minH={minH}
        transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
        borderRadius="80px"
        border="10px solid"
        borderColor="red.500"
        {...props}
      >
        {children}
      </MotionComponent>
    </Flex>
  );
};

export default MotionBoard;
