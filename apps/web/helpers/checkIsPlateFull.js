import { menuInfo } from 'contents/menuList';
import { isEqual } from 'lodash';

const checkIsPlateFull = (data) => {
  const list = menuInfo.map((e) => {
    return e.ingredient.split('&').sort();
  });

  return list.some((e) => {
    return isEqual(e, [...data]?.sort());
  });
};

export default checkIsPlateFull;
