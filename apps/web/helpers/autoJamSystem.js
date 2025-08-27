import { addFood } from 'store/features/plateSlice';

const autoJamSystem = (data, target, dispatch) => {
  let i = 1;
  while (i < data.plate + 1) {
    const key = `plateContent${i}`;
    //如果盤子裡面有吐司又是只有一個食物
    if (data[key].includes('toast') && data[key].length === 1) {
      dispatch(addFood({ id: i, targetItem: target }));
      break;
    }
    i++;
  }
};

export default autoJamSystem;
