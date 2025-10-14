import { Button } from '@chakra-ui/react';

const ReturnButton = ({ onClick, ...props }) => {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      colorScheme="gray"
      size="md"
      _hover={{ bg: 'gray.100' }}
      fontSize="14px"
      color="gray.700"
      borderRadius="lg"
      {...props}
    >
      ← Return
    </Button>
  );
};

export default ReturnButton;
