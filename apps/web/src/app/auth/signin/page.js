'use client';

import {
  Button,
  HStack,
  Image,
  Input,
  Link,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  emailMessage,
  passwordMessage,
} from 'contents/emailPasswordErrorMessage';
import PasswordInput from 'Components/PasswordInput';
import { useEffect, useState } from 'react';
import CustomContainer from 'Components/CustomContainer';
import { getAuthData } from './action';

export default function SignIn() {
  const router = useRouter();
  const [loginError, setLoginError] = useState();
  const [providers, setProviders] = useState({});
  const [csrfToken, setCsrfToken] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const { providers: providersData, csrfToken: csrfTokenData } =
        await getAuthData();
      setProviders(providersData);
      setCsrfToken(csrfTokenData);
    };
    fetchData();
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState,
    formState: { errors },
  } = useForm();

  const onSubmit = async () => {
    try {
      const result = await signIn('credentials', {
        ...watch(),
        redirect: false,
      });
      if (!result.error) {
        router.push('/');
      } else {
        console.log(result.error);
        setLoginError(result.error);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <CustomContainer>
      <Stack flex={1} justifyContent="center" w="100%" spacing={10} px="3em">
        <Text textAlign="center" fontWeight={700} fontSize="30px">
          LogIn
        </Text>
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack spacing={5} w="100%">
            <Input
              name="csrfToken"
              type="hidden"
              defaultValue={csrfToken}
            ></Input>
            <Input
              {...register('email', {
                required: true,
                pattern:
                  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
              })}
              bg="white"
              placeholder="happy@gmail.com"
            ></Input>
            <PasswordInput register={register} />
            <Button type="submit" w="100%" isLoading={formState.isSubmitting}>
              Login
            </Button>
          </VStack>
          <VStack py="2" alignItems="start">
            {errors.password && (
              <Text fontSize="14px" color="red.600">
                {passwordMessage[errors.password?.type ?? '']}
              </Text>
            )}
            {errors.email && (
              <Text fontSize="14px" color="red.600">
                {emailMessage[errors.email.type ?? '']}
              </Text>
            )}
            {loginError && (
              <Text fontSize="14px" color="red.600">
                {loginError}
              </Text>
            )}
          </VStack>
        </form>
        <Text textAlign="center">Other LogIn</Text>
        {Object.values(providers)
          .slice(1, 2)
          .map((provider) => (
            <Button
              onClick={() => signIn(provider.id, { callbackUrl: '/' })}
              key={provider.name}
            >
              <HStack>
                <Image src="/google.svg" w="2em" alt="google"></Image>
                <Text>Sign in with {provider.name}</Text>
              </HStack>
            </Button>
          ))}
        <HStack justifyContent="center">
          <Text> {`Don't have an account ?`}</Text>
          <Link href="/register">
            <Text cursor="pointer" textDecoration="underline" color="red.500">
              Go to sign up
            </Text>
          </Link>
        </HStack>
      </Stack>
    </CustomContainer>
  );
}
