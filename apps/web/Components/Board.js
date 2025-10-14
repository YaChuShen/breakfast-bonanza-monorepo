import { Box, Flex } from '@chakra-ui/react';

const Board = ({ children, py = '1.5em', minH = '20em', ...props }) => {
  return (
    <Flex h="100vh" align="center" justify="center">
      <Box
        py={py}
        bg="rgba(255, 255, 255, 0.9)"
        w="60%"
        zIndex={20}
        minH={minH}
        borderRadius="80px"
        border="10px solid"
        borderColor="red.500"
        {...props}
      >
        {children}
      </Box>
    </Flex>
  );
};

export default Board;
