'use client';

import {
  Divider,
  Grid,
  HStack,
  Icon,
  Link,
  Text,
  VStack,
  Image,
} from '@chakra-ui/react';
import React from 'react';
import AvatarPicker from 'Components/AvatarPicker';
import CustomContainer from 'Components/CustomContainer';
import { FaArrowLeftLong } from 'react-icons/fa6';
import { format } from 'date-fns';
import {
  TbSquareRoundedNumber1Filled,
  TbSquareRoundedNumber2Filled,
  TbSquareRoundedNumber3Filled,
  TbSquareRoundedNumber4Filled,
  TbSquareRoundedNumber5Filled,
} from 'react-icons/tb';
import Media from 'Components/Media';
import MobileAlertPage from 'Components/MobileAlertPage';

const numberIcon = {
  1: { icon: TbSquareRoundedNumber1Filled, color: 'gray.400' },
  2: { icon: TbSquareRoundedNumber2Filled, color: 'gray.400' },
  3: { icon: TbSquareRoundedNumber3Filled, color: 'gray.400' },
  4: { icon: TbSquareRoundedNumber4Filled, color: 'gray.400' },
  5: { icon: TbSquareRoundedNumber5Filled, color: 'gray.400' },
};

const Profile = ({ data, profileId }) => {
  const isLevel2 = data?.isLevel2;
  const sortedScores = data?.score?.sort((a, b) => b.score - a.score) || [];

  return (
    <>
      <Media greaterThanOrEqual="md">
        <CustomContainer>
          <VStack w="100%" alignItems="flex-start">
            <Link href="/">
              <HStack>
                <Icon as={FaArrowLeftLong} />
                <Text>Back</Text>
              </HStack>
            </Link>
            <VStack
              w="100%"
              px="3em"
              pt="3em"
              pb="2em"
              bg="white"
              borderRadius="80px"
              mt="1em"
              border="10px solid"
              borderColor="red.500"
              fontWeight={500}
              color="gray.500"
            >
              <Image
                src="/breakfast_bonanza_logo.svg"
                w="60%"
                alt="sereneShen"
              />
              <VStack pt="1em" w="100%">
                <AvatarPicker
                  profileId={profileId}
                  avatar={data?.avatar ?? data?.image}
                />
                <Text fontWeight={700} fontSize="30px" color="gray.800">
                  {data.name}
                </Text>
                <HStack
                  color="gray.500"
                  w="100%"
                  justifyContent="center"
                  spacing="0.5em"
                >
                  <Text>{data.email}</Text>
                  <Text>|</Text>
                  <HStack fontSize="14px">
                    <Text
                      bg={isLevel2 ? 'yellow.400' : 'gray.600'}
                      px="0.5em"
                      borderRadius="8px"
                      color="white"
                    >
                      {isLevel2 ? 'Level 2' : 'Level 1'}
                    </Text>
                    <Text>
                      {isLevel2 ? 'Eggcellent Chef' : 'Morning Beginner'}
                    </Text>
                  </HStack>
                </HStack>
              </VStack>
              <Divider borderColor="gray.500" py="0.5em" />
              <HStack w="100%" alignItems="flex-start" py="1em">
                <VStack w="100%">
                  <Text fontWeight={800} fontSize="24px">
                    Record
                  </Text>
                  {data?.score?.length > 0 ? (
                    sortedScores.slice(0, 5).map((item, index) => (
                      <Grid
                        templateColumns="30px 1fr 2fr"
                        gap={1}
                        bg="white"
                        color="black"
                        borderRadius="xl"
                        key={item?.time}
                        alignItems="center"
                      >
                        <Icon
                          as={numberIcon[index + 1].icon}
                          w="1.3em"
                          h="1.3em"
                          color={numberIcon[index + 1].color}
                        />
                        <Text w="4em">{item.score}</Text>
                        <Text
                          textAlign="right"
                          fontSize="14px"
                          color="gray.500"
                        >
                          {format(new Date(item?.time), 'yyyy-MM-dd hh:mm')}
                        </Text>
                      </Grid>
                    ))
                  ) : (
                    <Text>No record yet</Text>
                  )}
                </VStack>
                <VStack w="100%">
                  <Text fontWeight={800} fontSize="24px">
                    Highest Score
                  </Text>
                  <Text fontSize="24px" fontWeight={700} color="red.500">
                    {sortedScores[0]?.score}
                  </Text>
                </VStack>
              </HStack>
              <Image
                src="/sunnyEgg&toast.svg"
                w="4em"
                alt="sereneShen"
                pt={{ md: '3em', xl: '5em' }}
              />
              <Text fontSize="14px">Product by Serene Shen</Text>
            </VStack>
          </VStack>
        </CustomContainer>
      </Media>
      <Media lessThan="md">
        <MobileAlertPage />
      </Media>
    </>
  );
};

export default Profile;
