import {
  Box,
  Center,
  Divider,
  HStack,
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

const ScoreSection = ({
  score,
  seconds,
  minutes,
  profileId,
  isSingin,
  session,
}) => {
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
        maxW="12em"
        borderRadius="13px"
      >
        <VStack spacing={3}>
          <Timer seconds={seconds} minutes={minutes} />
          <Divider borderWidth="1px" />

          {/* 雙人計分版 */}
          <VStack spacing={2} w="100%" px={2} pb={2}>
            {/* 主人分數 */}
            <Box
              bg={isHost ? 'green.50' : 'gray.50'}
              p={2}
              borderRadius="lg"
              w="100%"
              borderLeft={isHost ? '3px solid' : '1px solid'}
              borderLeftColor={isHost ? 'green.400' : 'gray.200'}
            >
              <HStack justify="space-between" w="100%">
                <VStack spacing={0}>
                  <Text fontSize="xs" color="gray.600" fontWeight={600}>
                    {isHost ? '你' : playersInfo[0]?.name || '主人'}
                  </Text>
                  <Text fontSize="sm" color="orange.500">
                    👑
                  </Text>
                </VStack>
                <Text
                  fontSize="xl"
                  fontWeight={700}
                  color={isHost ? 'green.600' : 'gray.600'}
                >
                  {isHost ? (score ?? 0) : opponentScore}
                </Text>
              </HStack>
            </Box>

            <Text fontSize="xs" color="gray.400" fontWeight={600}>
              VS
            </Text>

            {/* 訪客分數 */}
            <Box
              bg={!isHost ? 'blue.50' : 'gray.50'}
              p={2}
              borderRadius="lg"
              w="100%"
              borderLeft={!isHost ? '3px solid' : '1px solid'}
              borderLeftColor={!isHost ? 'blue.400' : 'gray.200'}
            >
              <HStack justify="space-between" w="100%">
                <VStack spacing={0}>
                  <Text fontSize="xs" color="gray.600" fontWeight={600}>
                    {!isHost ? '你' : opponentName || '訪客'}
                  </Text>
                  <Text fontSize="sm" color="blue.500">
                    👤
                  </Text>
                </VStack>
                <Text
                  fontSize="xl"
                  fontWeight={700}
                  color={!isHost ? 'blue.600' : 'gray.600'}
                >
                  {!isHost ? (score ?? 0) : opponentScore}
                </Text>
              </HStack>
            </Box>

            {/* 分數差距顯示 */}
            {score !== undefined && opponentScore !== undefined && (
              <Text fontSize="xs" color="gray.500" textAlign="center">
                {score > opponentScore
                  ? `領先 ${score - opponentScore} 分`
                  : score < opponentScore
                    ? `落後 ${opponentScore - score} 分`
                    : '平手！'}
              </Text>
            )}
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
                      onClick={() => {
                        router.push(`/profile/${profileId}`);
                      }}
                    >
                      Profile
                    </Text>
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
                  <Text
                    _hover={{
                      color: 'gray.400',
                    }}
                    onClick={() => {
                      router.push(`/profile/${profileId}`);
                    }}
                  >
                    Profile
                  </Text>
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
