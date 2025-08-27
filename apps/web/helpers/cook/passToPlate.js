import autoPlateSystem from '../autoPlateSystem';

const passToPlate = (
  data,
  cookedGroup,
  isDone,
  setStatus,
  setMove,
  dispatch
) => {
  autoPlateSystem(data, cookedGroup?.done.value, isDone, dispatch);
  if (isDone) {
    setStatus(null);
    setMove && setMove(false);
  }
};

export default passToPlate;
