import { Box, Flex, Image, VStack } from '@chakra-ui/react';

export default function Loading() {
  return (
    <Box
      pos="fixed"
      bottom="0"
      top="0"
      left="0"
      right="0"
      bg="#F2DBC2"
      zIndex="2"
    >
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
              <source src={`loading.mp4`} type="video/mp4" />
            </video>
          </Box>
        </VStack>
      </Flex>
    </Box>
  );
}
