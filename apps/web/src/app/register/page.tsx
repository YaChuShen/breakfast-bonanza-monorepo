'use client';

import {
  Button,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import CustomContainer from 'Components/CustomContainer';
import {
  emailMessage,
  passwordMessage,
} from 'contents/emailPasswordErrorMessage';
import { trackEvent } from 'lib/mixpanel';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

type Inputs = {
  email: string;
  password: string;
  name: string;
};

const RegisterForm = ({
  source,
  score,
}: {
  source: string | null;
  score: string | null;
}) => {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });

    try {
      if (res.ok) {
        trackEvent('Registration Successful', {
          timestamp: new Date().toISOString(),
          registrationSource: source || 'direct',
          score: score || undefined,
          email: data.email,
          name: data.name || '',
        });
      } else {
        trackEvent('Registration Failed', {
          timestamp: new Date().toISOString(),
          registrationSource: source || 'direct',
          error: await res.text(),
        });
      }
    } catch (error) {
      console.error('Failed to track event:', error);
    }

    const userInfo = await res.json();

    signIn('credentials', {
      ...userInfo,
      callbackUrl: '/',
    }).catch((error) => {
      router.push('/');
      console.log(error);
    });
    setLoading(false);
  };

  const onError = (errors: any) => {
    console.log('Form errors:', errors);
  };

  return (
    <CustomContainer>
      <Stack flex={1} justifyContent="center" w="100%" spacing={10} px="3em">
        <Text textAlign="center" fontWeight={700} fontSize="30px">
          Sign Up
        </Text>
        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <VStack spacing={5} w="100%">
            <Input
              {...register('name', { required: true, maxLength: 12 })}
              bg="white"
              placeholder="name"
            ></Input>
            <Input
              {...register('email', {
                required: true,
                pattern:
                  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
              })}
              bg="white"
              placeholder="email address"
            ></Input>
            <InputGroup size="md">
              <Input
                pr="4.5rem"
                bg="white"
                type={show ? 'text' : 'password'}
                placeholder="Min. 6 characters including numbers and letters"
                {...register('password', {
                  required: true,
                  minLength: 6,
                  pattern: /^[a-z0-9\.]+$/,
                })}
              />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={handleClick}>
                  {show ? 'Hide' : 'Show'}
                </Button>
              </InputRightElement>
            </InputGroup>
            <Button type="submit" w="100%" isLoading={loading}>
              SUBMIT
            </Button>
          </VStack>
          <VStack py="2" alignItems="start">
            {errors.name && (
              <Text fontSize="14px" color="red.600">
                {errors.name.type === 'required'
                  ? 'Name is required'
                  : 'Name must be less than 12 characters'}
              </Text>
            )}
            {errors.password && (
              <Text fontSize="14px" color="red.600">
                {passwordMessage[errors.password.type ?? '']}
              </Text>
            )}
            {errors.email && (
              <Text fontSize="14px" color="red.600">
                {emailMessage[errors.email.type ?? '']}
              </Text>
            )}
          </VStack>
        </form>
        <HStack>
          <Text> Already have an account?</Text>
          <Link href="/auth/signin">
            <Text
              cursor="pointer"
              textDecoration="underline"
              color="red.500"
              onClick={() => router.push('auth/signin')}
            >
              Login
            </Text>
          </Link>
        </HStack>
      </Stack>
    </CustomContainer>
  );
};

const SearchParamsWrapper = () => {
  const searchParams = useSearchParams();
  const source = searchParams?.get('source') ?? null;
  const score = searchParams?.get('score') ?? null;

  return <RegisterForm source={source} score={score} />;
};

const Page = () => {
  return (
    <Suspense fallback={null}>
      <SearchParamsWrapper />
    </Suspense>
  );
};

export default Page;
