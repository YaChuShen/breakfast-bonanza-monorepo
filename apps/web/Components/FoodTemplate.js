import { Center, Image } from '@chakra-ui/react';
import { useDispatch } from 'react-redux';
import { setTargetItem } from 'store/features/plateSlice';

const size = {
  coffee: '2.5em',
  toast: '6.5em',
  'blueberry-toast': '6.5em',
};

const FoodTemplate = ({ value, src, w = '5em', className, ...props }) => {
  const dispatch = useDispatch();

  return (
    <Center {...props}>
      <Image
        src={`/${src}.svg`}
        alt=""
        w={size[value] ?? w}
        maxW="8em"
        className={className}
        draggable="true"
        cursor="grab"
        onDragStart={() => {
          dispatch(setTargetItem({ target: value }));
        }}
      />
    </Center>
  );
};

export default FoodTemplate;
