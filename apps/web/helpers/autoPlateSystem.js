import settingPlateRules from './settingPlateRules';
import { addFood } from 'store/features/plateSlice';
import checkIsPlateFull from 'helpers/checkIsPlateFull';

const autoPlateSystem = (data, target, isDone, dispatch) => {
  let i = 1;
  while (i < data.plate + 1) {
    const key = `plateContent${i}`;
    if (
      isDone &&
      settingPlateRules(data[key], target) &&
      !checkIsPlateFull(data[key])
    ) {
      dispatch(addFood({ id: i, targetItem: target }));
      break;
    }
    i++;
  }

  // Object.entries(data).filter(([key, value]) => {
  //   if (key.startsWith("plateContent") && value.length < 2) {
  //     /**Todo */
  //   }
  // });
};

export default autoPlateSystem;
