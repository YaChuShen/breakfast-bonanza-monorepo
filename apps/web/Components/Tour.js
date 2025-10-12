import { Button, Icon, Text, VStack } from '@chakra-ui/react';
import { components, TourProvider, useTour } from '@reactour/tour';
import { TOUR_SESSION_KEY } from 'contents/rules';
import graphqlClient from 'lib/api-client';
import { useCallback, useEffect } from 'react';
import { HiArrowSmLeft, HiArrowSmRight } from 'react-icons/hi';
import { RxCross2 } from 'react-icons/rx';
import { useDispatch } from 'react-redux';
import { timerStatus } from 'store/features/gameConfigSlice';

const MODE_SELECTION_STATUS = 'modeSelection';

const CheckAlreadyRead = () => {
  const { setIsOpen } = useTour();

  useEffect(() => {
    if (window && sessionStorage.getItem(TOUR_SESSION_KEY)) {
      setIsOpen(false);
    }
  }, [setIsOpen]);
};

function Badge({ children }) {
  return (
    <components.Badge
      styles={{ badge: (base) => ({ ...base, backgroundColor: 'gray' }) }}
    >
      {children}
    </components.Badge>
  );
}

function Close({ onClickStartGame }) {
  const { setIsOpen } = useTour();
  return (
    <button
      onClick={() => {
        setIsOpen(false);
        onClickStartGame();
      }}
      style={{ position: 'absolute', right: 15, top: 10 }}
    >
      <Icon as={RxCross2}></Icon>
    </button>
  );
}

function Content({ content, currentStep }) {
  return (
    <VStack spacing={4} pt="4" key={currentStep} maxW="12em" h="13em">
      <Text fontSize="14px">{content}</Text>
      <video autoPlay muted playsInline loop width={130}>
        <source src={`${currentStep + 1}.mp4`} type="video/mp4" />
      </video>
    </VStack>
  );
}

const Tour = ({ children, profileId }) => {
  const dispatch = useDispatch();

  const finishTourFlow = useCallback(() => {
    window.sessionStorage.setItem(TOUR_SESSION_KEY, true);
    dispatch(timerStatus({ status: MODE_SELECTION_STATUS }));
  }, [dispatch]);

  const onClickStartGame = useCallback(async () => {
    if (!profileId) {
      console.error('ProfileId is missing, cannot complete tour');
      finishTourFlow();
      return;
    }

    try {
      await graphqlClient.tour(profileId);
    } catch (error) {
      console.error('Failed to complete tour:', error);
    } finally {
      finishTourFlow();
    }
  }, [profileId, finishTourFlow]);

  const steps = [
    {
      selector: '.first-step',
      content: 'Drag the egg into the pen',
    },
    {
      selector: '.two-step',
      content: 'And drag the cooked food on the plate',
    },
    {
      selector: '.three-step',
      content: 'If your meal is done, drag to the customer! Finish!',
    },
    {
      selector: '.four-step',
      content: `When the toast is done, click the toaster's button and then click again to the customer`,
    },
    {
      selector: '.fifth-step',
      content: 'If the food gets burnt, please drag to the trash can',
    },
  ];

  return (
    <TourProvider
      steps={steps}
      disableInteraction
      onClickMask={() => {
        // 防止點擊遮罩時關閉 tour
        return;
      }}
      onClickHighlighted={(e) => {
        e.stopPropagation();
      }}
      styles={{
        popover: (base) => ({
          ...base,
          borderRadius: '20px',
        }),
        maskArea: (base) => ({ ...base, rx: '20px' }),
      }}
      padding={{
        popover: [20, 20],
      }}
      showDots={false}
      components={{
        Badge,
        Close: () => <Close onClickStartGame={onClickStartGame} />,
        Content,
      }}
      disableDotsNavigation={false}
      prevButton={({ currentStep, setCurrentStep }) => {
        const isFirstStep = currentStep === 0;
        return (
          <Button
            variant="ghost"
            visibility={isFirstStep ? 'hidden' : 'visible'}
            isDisabled={false}
            onClick={() => {
              setCurrentStep((s) => Math.max(0, s - 1));
            }}
          >
            <Icon as={HiArrowSmLeft} w="1.5em" h="1.5em" color="gray.500" />
          </Button>
        );
      }}
      nextButton={({ currentStep, stepsLength, setIsOpen, setCurrentStep }) => {
        const isLastStep = currentStep === stepsLength - 1;

        const handleNextClick = async () => {
          if (isLastStep) {
            setIsOpen(false);
            onClickStartGame();
          } else {
            setCurrentStep((s) => Math.min(stepsLength - 1, s + 1));
          }
        };

        return (
          <Button
            mt="0"
            variant="ghost"
            isDisabled={false}
            size="sm"
            onClick={handleNextClick}
          >
            {isLastStep ? (
              <Text color="gray.500">Start Game</Text>
            ) : (
              <Icon as={HiArrowSmRight} w="1.5em" h="1.5em" color="gray.500" />
            )}
          </Button>
        );
      }}
      onClickStartGame={onClickStartGame}
      position="top"
    >
      {children}
      <CheckAlreadyRead />
    </TourProvider>
  );
};

export default Tour;
