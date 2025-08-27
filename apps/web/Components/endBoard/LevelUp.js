import { HStack, Image, Stack, Text } from '@chakra-ui/react';

const LevelUp = ({ endBoardVariants }) => {
  return (
    <Stack
      alignItems="center"
      color="gray.700"
      bg="white"
      justifyContent="center"
      {...endBoardVariants}
    >
      <Text fontSize="20px">Unlock new ingredients!</Text>
      <Text textAlign="center" fontWeight={500}>
        Next, there are various combinations waiting for you to complete.
      </Text>
      <HStack>
        <Image src={'/bacon.svg'} w="5em" alt="bacon" />
        <Image src={'/rosemarry.svg'} w="5em" alt="rosemarry" />
      </HStack>
    </Stack>
  );
};

export default LevelUp;
