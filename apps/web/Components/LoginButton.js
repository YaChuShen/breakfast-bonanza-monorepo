import { Button } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

const LoginButton = ({ ...props }) => {
  const router = useRouter();
  return (
    <Button
      borderRadius="lg"
      color="red.500"
      onClick={() => router.push('auth/signin')}
      borderColor="red.500"
      variant="outline"
      _hover={{ bg: 'red.300', color: 'white' }}
      {...props}
    >
      Login
    </Button>
  );
};

export default LoginButton;
