import { Button } from '@chakra-ui/react';

const StartButton = ({ onClick, text = 'Start', ...props }) => {
  return (
    <Button
      onClick={onClick}
      bg="red.500"
      color="white"
      fontSize="xl"
      py="5"
      px="8"
      size="xl"
      borderRadius="xl"
      letterSpacing="1px"
      _hover={{ bg: 'orange.500', color: 'white', transform: 'scale(1.2)' }}
      fontWeight={900}
      transition="all 0.2s ease"
      {...props}
    >
      {text}
    </Button>
  );
};

export default StartButton;
