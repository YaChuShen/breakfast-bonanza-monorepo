import {
  Box,
  Center,
  Divider,
  IconButton,
  SlideFade,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import Timer from 'Components/Timer';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MdArrowDropDown } from 'react-icons/md';
import { useSelector } from 'react-redux';
import { selectGameConfig } from 'store/features/gameConfigSlice';

const ScoreSection = ({ score, seconds, minutes, isSingin, session }) => {
  const { isOpen, onToggle, onOpen } = useDisclosure();
  const router = useRouter();
  const { gameMode, opponentScore, opponentName, hostId, playersInfo } =
    useSelector(selectGameConfig);

  const isMultiPlayer = gameMode === 'multi';
  const isHost =
    session &&
    hostId &&
    (session.id === hostId || session.profileId === hostId);

  if (isMultiPlayer) {
    return (
      <Box
        zIndex={99}
        boxShadow="md"
        bg="gray.50"
        pt="2"
        pos="fixed"
        right={10}
        top={10}
        w="100%"
        maxW="8em"
        borderRadius="13px"
      >
        <VStack spacing={3}>
          <Timer seconds={seconds} minutes={minutes} />
          <Divider borderWidth="1px" />
          <VStack spacing={2} w="100%" px={4} pb={2}>
            <Box p={2} borderRadius="xl" w="100%" bg="gray.100">
              <VStack spacing={0}>
                <Text color="red.500" fontWeight={600} fontSize="xs">
                  YOU
                </Text>
                <Text fontSize="4xl" fontWeight={700} color="red.500">
                  {score ?? 0}
                </Text>
              </VStack>
            </Box>
            <Text fontSize="xs" color="gray.400" fontWeight={600}>
              VS
            </Text>
            <Box p={2} borderRadius="lg" w="100%" bg="gray.100">
              <VStack spacing={0}>
                <Text color="gray.500" fontWeight={600} fontSize="xs">
                  {opponentName}
                </Text>
                <Text fontSize="xl" fontWeight={700} color="gray.600">
                  {opponentScore ?? 0}
                </Text>
              </VStack>
            </Box>
          </VStack>
        </VStack>
        {isSingin && (
          <Center borderRadius="13px" flexDirection="column" pt="2" w="full">
            <IconButton
              as={MdArrowDropDown}
              w="full"
              size="xs"
              onClick={onToggle}
              cursor="pointer"
              borderRadius="none"
              borderBottomRadius="xl"
              onMouseEnter={() => onOpen()}
            />
            {isOpen && (
              <Box w="full">
                <SlideFade
                  in={isOpen}
                  transition={{
                    enter: { duration: 0.5 },
                    exit: { duration: 0.5 },
                  }}
                >
                  <VStack
                    w="full"
                    textAlign="center"
                    cursor="pointer"
                    userSelect="none"
                    py="2"
                    fontWeight={500}
                    fontSize="md"
                  >
                    <Text
                      _hover={{
                        color: 'gray.400',
                      }}
                      onClick={() => signOut()}
                    >
                      Logout
                    </Text>
                  </VStack>
                </SlideFade>
              </Box>
            )}
          </Center>
        )}
      </Box>
    );
  }

  // 單人模式的原始設計
  return (
    <Box
      zIndex={99}
      boxShadow="md"
      bg="gray.50"
      pt="2"
      pos="fixed"
      right={10}
      top={10}
      w="100%"
      maxW="8em"
      borderRadius="13px"
    >
      <VStack>
        <Timer seconds={seconds} minutes={minutes} />
        <Divider borderWidth="1px" />
        <Text fontSize="24px" fontWeight={700} color="gray.600">
          {score ?? 0}
        </Text>
      </VStack>
      {isSingin && (
        <Center borderRadius="13px" flexDirection="column" pt="2" w="full">
          <IconButton
            as={MdArrowDropDown}
            w="full"
            size="xs"
            onClick={onToggle}
            cursor="pointer"
            borderRadius="none"
            borderBottomRadius="xl"
            onMouseEnter={() => onOpen()}
          />
          {isOpen && (
            <Box w="full">
              <SlideFade
                in={isOpen}
                transition={{
                  enter: { duration: 0.5 },
                  exit: { duration: 0.5 },
                }}
              >
                <VStack
                  w="full"
                  textAlign="center"
                  cursor="pointer"
                  userSelect="none"
                  py="2"
                  fontWeight={500}
                  fontSize="md"
                >
                  {/* <Text
                    _hover={{
                      color: 'gray.400',
                    }}
                    onClick={() => {
                      router.push(`/profile/${profileId}`);
                    }}
                  >
                    Profile
                  </Text> */}
                  <Divider />
                  <Text
                    _hover={{
                      color: 'gray.400',
                    }}
                    onClick={() => signOut()}
                  >
                    Logout
                  </Text>
                </VStack>
              </SlideFade>
            </Box>
          )}
        </Center>
      )}
    </Box>
  );
};

export default ScoreSection;
