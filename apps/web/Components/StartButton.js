import { Button } from '@chakra-ui/react';

const StartButton = ({ onClick, ...props }) => {
  return (
    <Button
      onClick={onClick}
      bg="red.500"
      color="white"
      fontSize="2xl"
      py="5"
      px="12"
      size="xl"
      borderRadius="20px"
      letterSpacing="1px"
      _hover={{ bg: 'red.300', color: 'white' }}
      fontWeight={900}
      {...props}
    >
      Start
    </Button>
  );
};

export default StartButton;
