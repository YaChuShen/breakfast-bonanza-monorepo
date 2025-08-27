const toastNotValidArr = ['hotDog', 'sunnyEgg', 'bacon'];

const rules = (plateContent) => {
  return { toast: toastNotValidArr.includes(plateContent?.[0]) };
};
const settingPlateRules = (plateContent, currentValue) => {
  if (
    plateContent.includes(currentValue) ||
    rules(plateContent)[currentValue]
  ) {
    return false;
  } else {
    return true;
  }
};

export default settingPlateRules;
