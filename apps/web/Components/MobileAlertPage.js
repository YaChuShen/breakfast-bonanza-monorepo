import { Box, Flex, Image, Text, VStack } from '@chakra-ui/react';

const MobileAlertPage = () => {
  return (
    <Flex justify="center" align="center" height="100vh" px="1em">
      <VStack
        align="center"
        justify="center"
        fontWeight={500}
        textAlign="center"
      >
        <Image src="/breakfast_bonanza_logo.svg" w="100%" alt="sereneShen" />
        <Box pt="8" pr="8">
          <video autoPlay muted playsInline loop width={130}>
            <source src="/loading.mp4" type="video/mp4" />
          </video>
        </Box>
        <Text textAlign="center">
          This game is not supported on small screens.
        </Text>
        <Text>Please visit us on desktop for the best experience!</Text>
      </VStack>
    </Flex>
  );
};

export default MobileAlertPage;
