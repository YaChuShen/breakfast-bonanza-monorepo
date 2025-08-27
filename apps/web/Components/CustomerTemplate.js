import { Box, Center, Circle, Image, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { isEqual } from 'lodash';
import { CUSTOMER_NEXT_ORDER, CUSTOMER_OVERTIME } from 'contents/rules';
import scoreList from 'contents/scoreList';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import {
  handleOvertime,
  handleCustomStatus,
  getNextOrder,
  getScore,
  minusScore,
} from 'store/features/customerSlice';
import {
  addFood,
  setTargetItem,
  setTargetPlate,
} from 'store/features/plateSlice';
import { selectPlate } from 'store/features/plateSlice';
import { useSelector } from 'react-redux';
import splitCategories from 'helpers/splitCategories';
import { selectGameConfig } from 'store/features/gameConfigSlice';

const MotionComponent = motion(Box);

const statusColor = {
  eating: '#EDDDD6',
  waiting: '#92AA8D',
  errors: '#CE5242',
};

const circleW = 9.56;
const customerW = 9;

const CustomerImg = ({ src }) => {
  return (
    <Image
      top={1}
      left={2}
      pos="absolute"
      src={`${src}.svg`}
      w={`${customerW}em`}
      alt=""
      draggable="false"
    />
  );
};

const CustomerTemplate = ({
  wishFood,
  status,
  overtime,
  id,
  src,
  className,
  isLevel2,
}) => {
  const dispatch = useDispatch();
  const isCoffee = wishFood === 'coffee';
  const [getScoreAni, setGetScoreAni] = useState();
  const plateData = useSelector(selectPlate);
  const { timerStatus } = useSelector(selectGameConfig);
  const isGameRunning = timerStatus === 'gameRunning';

  const targetScore =
    scoreList[[...splitCategories(plateData.targetItem)].sort().join('&')];

  useEffect(() => {
    const controlTime = (s, time) => {
      if (status === s && !overtime) {
        const t = setTimeout(() => {
          dispatch(handleCustomStatus({ id, status: 'waiting' }));
        }, [time]);
        return () => clearTimeout(t);
      }
    };
    controlTime('errors', 1000);
    controlTime('eating', 5000);
  }, [status]);

  useEffect(() => {
    //isGameRunning：The game must be in progress.
    if (!overtime && isGameRunning) {
      const t = setTimeout(() => {
        dispatch(handleOvertime({ id, status: true }));
        dispatch(minusScore());
        setGetScoreAni(true);
        dispatch(handleCustomStatus({ id, status: 'errors' }));
      }, [CUSTOMER_OVERTIME]);

      if (status === 'eating') clearTimeout(t);

      return () => clearTimeout(t);
    }
  }, [overtime, isGameRunning, status]);

  const handleValidateFood = () => {
    if (wishFood.includes('&')) {
      return isEqual(
        splitCategories(plateData.targetItem)?.sort(),
        splitCategories(wishFood)?.sort()
      );
    } else {
      return wishFood === plateData.targetItem;
    }
  };

  useEffect(() => {
    if (getScoreAni) {
      setTimeout(() => {
        setGetScoreAni(false);
      }, [500]);
    }
  }, [getScoreAni]);

  const submitOrder = () => {
    dispatch(handleOvertime({ id, status: false }));
    dispatch(handleCustomStatus({ id, status: 'eating' }));
    setTimeout(() => {
      dispatch(getNextOrder({ id, isLevel2 }));
    }, [CUSTOMER_NEXT_ORDER]);
    dispatch(getScore({ score: targetScore }));
    setGetScoreAni(true);
  };

  const failureSubmit = () => {
    if (status === 'eating') return;
    dispatch(handleCustomStatus({ id, status: 'errors' }));
    dispatch(setTargetItem({ target: null }));
    dispatch(minusScore());
    setGetScoreAni(true);
  };

  return (
    <Box
      userSelect="none"
      onDrop={(e) => {
        e.preventDefault();
        if (handleValidateFood()) {
          submitOrder();
        } else {
          failureSubmit();
        }
        dispatch(addFood({ id: plateData.targetPlate, targetItem: [] }));
        dispatch(setTargetPlate({ index: null }));
      }}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      pos="relative"
      className={className}
    >
      <Box pos="absolute" bottom="70%" left="-30%">
        {getScoreAni && (
          <MotionComponent
            initial={{ opacity: 0.2, x: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 0.3 },
            }}
            transition={{ duration: 0.2, stiffness: 200 }}
          >
            {status === 'eating' && (
              <Text fontSize="20px" fontWeight={900} color="green.500">
                {`+${targetScore}`}
              </Text>
            )}
            {status === 'errors' && (
              <Text fontSize="20px" fontWeight={900} color="red.500">
                - 30
              </Text>
            )}
          </MotionComponent>
        )}
      </Box>
      <Center
        visibility={status !== 'eating' ? 'visible' : 'hidden'}
        w={isCoffee ? '3em' : '7em'}
        h="4em"
        userSelect="none"
      >
        <Image src={`/${wishFood}.svg`} w="100%" draggable={false} />
      </Center>
      <Circle
        bg={statusColor[status]}
        w={`${circleW}em`}
        h={`${circleW}em`}
        pos="relative"
      >
        {overtime ? (
          <CustomerImg src={`${src}-angry`} />
        ) : (
          <CustomerImg src={src} />
        )}
      </Circle>
    </Box>
  );
};

export default CustomerTemplate;
