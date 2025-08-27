import { Text, VStack } from '@chakra-ui/react';

const TotalScore = ({
  showLevelUpMessege,
  score,
  isEnterLeaderboard,
  isLogin,
}) => {
  return (
    <VStack w="100%" spacing={0}>
      <Text fontSize="xl">
        {showLevelUpMessege ? 'Level up !!' : 'Game over'}, Your total scroe is
      </Text>
      <Text
        color="red.500"
        fontSize={{ lg: '6xl', '2xl': '5xl' }}
        textAlign="center"
      >
        {score}
      </Text>
      <Text textAlign="center" fontWeight={500}>
        {isEnterLeaderboard ? (
          isLogin ? (
            <Text as="span">
              {`You've made it to the top`}{' '}
              <Text as="span" fontWeight={800} fontSize="3xl" color="red.500">
                {isEnterLeaderboard}
              </Text>{' '}
              of the leaderboard!
            </Text>
          ) : (
            `You've made it to the top 5 !! Sign Up now to secure your impressive record.`
          )
        ) : (
          !isLogin && 'Sign up to save your score!'
        )}
      </Text>
    </VStack>
  );
};

export default TotalScore;
