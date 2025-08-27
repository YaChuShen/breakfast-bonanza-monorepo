import { Box, Image } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { toasterList } from '../contents/cookedList';
import Progress from './Progress';
import FoodTemplate from './FoodTemplate';
import onDragEnter from '../helpers/cook/onDragEnter';
import onDrop from '../helpers/cook/onDrop';
import passToPlate from '../helpers/cook/passToPlate';
import { MUTURITY_TIME, OVERTIME } from 'contents/rules';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { selectPlate } from 'store/features/plateSlice';
import { setTargetItem } from 'store/features/plateSlice';
import { handleTrashCan } from 'store/features/gameConfigSlice';

const statusList = {
  cooking: 'toasterIn0',
  maturity: 'toasterIn1',
  over: 'toasterIn2',
  done: 'toaster1',
  overDone: 'toaster2',
};

const Toaster = ({ tool, w = '14em', ...props }) => {
  const dispatch = useDispatch();
  const [cookedGroup, setCookedGroup] = useState();
  const [status, setStatus] = useState();
  const [move, setMove] = useState();
  const [haveOverCook, setHaveOverCook] = useState();
  const plateData = useSelector(selectPlate);
  const { targetItem } = plateData;

  const isCooking = status === 'cooking';
  const isMaturity = status === 'maturity';
  const isDone = status === 'done';
  const isOver = status === 'over';
  const isOverDone = status === 'overDone';

  useEffect(() => {
    if (isCooking) {
      const s = setTimeout(() => {
        setStatus('maturity');
      }, [MUTURITY_TIME]);
      return () => clearTimeout(s);
    }
    if (isMaturity) {
      const s = setTimeout(() => {
        setStatus('over');
      }, [OVERTIME]);
      return () => clearTimeout(s);
    }
    if (isOver) {
      setHaveOverCook(true);
    }
  }, [status]);

  const turnOn = () => {
    if (isMaturity) {
      setStatus('done');
    } else if (isOver) {
      setStatus('overDone');
    }
  };

  const overCookOnDragEnd = () => {
    if (targetItem === null) {
      setMove(false);
      setHaveOverCook(false);
    }
  };

  const overCookOnDragStart = () => {
    if (haveOverCook) {
      dispatch(setTargetItem({ target: cookedGroup?.over.value }));
    }
  };

  const overCookOnDoubleClick = () => {
    if (haveOverCook) {
      setStatus(null);
      dispatch(handleTrashCan({ value: true }));
      setHaveOverCook(false);
      setMove(false);
    }
  };

  const dragItem = (
    <Box
      visibility={move ? 'visible' : 'hidden'}
      draggable="true"
      onDragEnd={overCookOnDragEnd}
      onDragStart={overCookOnDragStart}
      onDoubleClick={overCookOnDoubleClick}
    >
      <FoodTemplate
        src={haveOverCook ? 'toast2' : 'toast'}
        pos="absolute"
        top={-2}
        left={10}
        w="7em"
      />
    </Box>
  );

  return (
    <Box
      onDragEnter={() =>
        onDragEnter(
          targetItem,
          status,
          haveOverCook,
          toasterList,
          setCookedGroup
        )
      }
      onDrop={() => !move && onDrop(targetItem, cookedGroup, status, setStatus)}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      {...props}
      className="four-step"
    >
      <Box pos="relative" cursor={(isDone || isOverDone) && 'pointer'}>
        {(isCooking || isMaturity) && (
          <Progress
            time={MUTURITY_TIME / 20}
            pos="absolute"
            size="30px"
            top={0}
            left={0}
          />
        )}
        {dragItem}
        {status ? (
          <Box
            pos="relative"
            onClick={() =>
              passToPlate(
                plateData,
                cookedGroup,
                isDone,
                setStatus,
                setMove,
                dispatch
              )
            }
            onMouseDown={(e) => {
              if (isOverDone) {
                setMove(true);
                setStatus(null);
              }
            }}
          >
            <Image
              src={`/${statusList[status]}.svg`}
              pointerEvents="none"
              cursor={(isDone || isOver) && 'pointer'}
              userSelect="none"
              w={w}
              alt="toaster"
            />
          </Box>
        ) : (
          <Box w={w}>
            <Image
              src={`/toaster.svg`}
              pointerEvents={'none'}
              userSelect="none"
              w={w}
              alt="toaster"
            />
          </Box>
        )}
        <Box
          onClick={turnOn}
          w="3em"
          h="3em"
          cursor="pointer"
          pos="absolute"
          bottom={'2em'}
          right={-4}
        />
      </Box>
    </Box>
  );
};

export default Toaster;
