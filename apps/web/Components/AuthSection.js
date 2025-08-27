import { HStack } from '@chakra-ui/react';
import LoginButton from './LoginButton';
import SignUpButton from './SignUpButton';

const AuthSection = ({ ...props }) => {
  return (
    <HStack>
      <LoginButton />
      <SignUpButton />
    </HStack>
  );
};

export default AuthSection;
