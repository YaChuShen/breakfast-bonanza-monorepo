import { Text } from '@chakra-ui/react';

const ReturnText = ({ onClick }) => {
  return (
    <Text
      pos="absolute"
      top="1.7em"
      left="2.2em"
      cursor="pointer"
      onClick={onClick}
      fontSize="xl"
      color="red.500"
      fontWeight={700}
      transition="all 0.3s ease"
      _hover={{
        transform: 'scale(1.2)',
        color: 'gray.300',
      }}
    >
      ←
    </Text>
  );
};

export default ReturnText;
