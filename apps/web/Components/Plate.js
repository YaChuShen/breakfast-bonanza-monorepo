import { Box, Center, HStack, Image } from '@chakra-ui/react';
import React from 'react';
import FoodTemplate from './FoodTemplate';
import { PLATE_TO_DROP_FOOD } from 'contents/rules';
import { MATERIAL_LIST } from 'contents/rules';
import { useDispatch } from 'react-redux';
import {
  addFood,
  setTargetItem,
  setTargetPlate,
} from 'store/features/plateSlice';
import checkIsPlateFull from 'helpers/checkIsPlateFull';

const foodList = {
  sunnyEgg: { left: '0', bottom: 2, index: 0, w: '5em' },
  hotDog: { left: '3.2em', bottom: 3, index: 1, w: '4.5em' },
  bacon: { left: '2', bottom: 7, index: 2, w: '5em' },
  rosemarry: { left: '3em', bottom: 5, index: 3, w: '2.7em' },
};

const toastFirstPosition = {
  sunnyEgg: { bottom: 5, index: 2, left: 6 },
  hotDog: { bottom: 5, index: 2, left: 6, w: '4.5em' },
  toast: { bottom: 0, index: 1, left: 2 },
  blueberry: { bottom: 0, index: 1, left: 3 },
  butter: { bottom: 0, index: 1, left: 3 },
  bacon: { bottom: 2, index: 1, left: 3 },
  rosemarry: { bottom: 4, index: 4, left: '4.5em', w: '2.7em' },
};

const ShadowTelplate = ({ bottom, left, w, rotate, blur }) => {
  return (
    <Box
      pos="absolute"
      bottom={bottom}
      left={left}
      borderRadius="30%"
      w={w}
      h="1.5em"
      bg="#D0D0D0"
      filter={`blur(${blur}px)`}
      transform={`rotate(${rotate}deg)`}
    />
  );
};

const shadow = {
  toast: <ShadowTelplate bottom={4} left={9} w="4em" rotate={-20} blur={3} />,
  hotDog: <ShadowTelplate bottom={4} left={9} w="4em" rotate={-20} blur={3} />,
};

const Plate = ({ data, index, className }) => {
  const dispatch = useDispatch();
  const key = `plateContent${index + 1}`;
  const food = data[key];
  const { targetPlate, targetItem } = data;
  const isValide = food?.every((e) => PLATE_TO_DROP_FOOD.includes(e));
  const toastFirst = food?.[0] === 'toast';
  const jam = food?.[1] === 'blueberry' || food?.[1] === 'butter';

  const displayRules = (category) => {
    const isToast = category === 'toast';
    //主要是控制css的位置擺放，分為吐司在下面與其他主食的位置
    if (toastFirst) {
      return toastFirstPosition[category];
    } else {
      if (isToast) return null;
      if (Object.keys(foodList).includes(category)) return foodList[category];
    }
    return null;
  };

  const showUp = isValide && food.length > 0 && displayRules(food[0]);

  return (
    <Center
      pos="relative"
      draggable="true"
      onDrop={(e) => {
        //檢查可不可以丟進盤子裡，
        if (
          !targetPlate &&
          !targetItem?.includes('2') &&
          !MATERIAL_LIST?.includes(targetItem)
        ) {
          dispatch(addFood({ id: index + 1, targetItem }));
          dispatch(setTargetItem({ target: null }));
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDragStart={() => {
        dispatch(setTargetItem({ target: food.join('&') }));
        dispatch(setTargetPlate({ index: index + 1 }));
      }}
      onDragEnd={(e) => {
        dispatch(setTargetPlate({ index: null }));
      }}
    >
      <Image src="plate.svg" w="8.3em" alt="plate" className={className} />
      {checkIsPlateFull(data[key]) ? (
        <Image
          src={`${[...data[key]]?.sort().join('&')}.svg`}
          w={jam ? '6.5em' : '8em'}
          left={jam ? 3 : 1}
          alt="food"
          position="absolute"
          zIndex={1}
          cursor="pointer"
        />
      ) : (
        showUp && (
          <>
            {food.map((item, i) => {
              const foodDisplayRule = displayRules(food[i]);
              const rules = i > 0 ? food.length > i && foodDisplayRule : true;
              return (
                rules && (
                  <FoodTemplate
                    value={food[i]}
                    src={food[i]}
                    pos="absolute"
                    bottom={foodDisplayRule.bottom}
                    left={foodDisplayRule.left}
                    zIndex={foodDisplayRule.index}
                    w={foodDisplayRule.w}
                    key={i}
                  />
                )
              );
            })}
          </>
        )
      )}
      {/* {isValide && shadow[food]} */}
    </Center>
  );
};

export default Plate;
