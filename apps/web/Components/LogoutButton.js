import { Button } from '@chakra-ui/react';
import mixpanel from 'mixpanel-browser';
import { signOut } from 'next-auth/react';

const LogoutButton = () => {
  return (
    <Button
      borderRadius="lg"
      color="gray.700"
      onClick={() => {
        signOut();
        mixpanel.reset();
      }}
      borderColor="gray.400"
      variant="outline"
      _hover={{ bg: 'gray.100' }}
      fontSize="14px"
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
