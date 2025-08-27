import { Button } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

const SignUpButton = ({ onClick, ...props }) => {
  const router = useRouter();
  return (
    <Button
      borderRadius="lg"
      color="gray.500"
      onClick={onClick || (() => router.push('auth/signin'))}
      variant="outline"
      {...props}
    >
      Sign Up
    </Button>
  );
};

export default SignUpButton;
