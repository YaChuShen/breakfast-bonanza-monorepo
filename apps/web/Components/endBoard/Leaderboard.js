import {
  Box,
  Divider,
  Grid,
  Icon,
  Text,
  VStack,
  Skeleton,
} from '@chakra-ui/react';
import _ from 'lodash';
import {
  TbSquareRoundedNumber1Filled,
  TbSquareRoundedNumber2Filled,
  TbSquareRoundedNumber3Filled,
  TbSquareRoundedNumber4Filled,
  TbSquareRoundedNumber5Filled,
} from 'react-icons/tb';

const numberIcon = {
  1: { icon: TbSquareRoundedNumber1Filled, color: 'yellow.400' },
  2: { icon: TbSquareRoundedNumber2Filled, color: 'gray.400' },
  3: { icon: TbSquareRoundedNumber3Filled, color: 'gray.600' },
  4: { icon: TbSquareRoundedNumber4Filled, color: 'gray.600' },
  5: { icon: TbSquareRoundedNumber5Filled, color: 'gray.600' },
};

const LEADERBOARD_ITEMS = 5;

const Leaderboard = ({
  newLeaderboard,
  endBoardVariants,
  isLoading,
  profileId,
}) => {
  return (
    <VStack alignItems="flex-start" {...endBoardVariants} bg="white">
      {isLoading ? (
        <VStack spacing={4} w="100%" minW="200px" p={{ lg: 2, '2xl': 4 }}>
          <Text fontSize="xs" color="gray.500">
            Leaderboard coming soon...
          </Text>
          {Array.from({ length: LEADERBOARD_ITEMS }).map((_, i) => (
            <Grid key={i} templateColumns="30px 1fr" gap={2} w="100%">
              <Skeleton h="20px" w="20px" />
              <Skeleton h="20px" />
            </Grid>
          ))}
        </VStack>
      ) : (
        newLeaderboard?.map((item, i) => {
          const isMyRank = profileId === item.profileId;
          return (
            <Box key={i} w="100%">
              <Grid
                templateColumns="30px 1fr 80px"
                gap={2}
                bg={isMyRank ? 'red.500' : 'white'}
                color={isMyRank ? 'white' : 'black'}
                p={2}
                borderRadius="xl"
              >
                <Icon
                  as={numberIcon[item.rank].icon}
                  w="1.5em"
                  h="1.5em"
                  color={numberIcon[item.rank].color}
                />
                <Text>{item.name}</Text>
                <Text textAlign="right">{item.score}</Text>
              </Grid>
              {i !== newLeaderboard.length - 1 && <Divider pt="0.5em" />}
            </Box>
          );
        })
      )}
    </VStack>
  );
};

export default Leaderboard;
