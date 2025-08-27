import store from '../store';
import { timerStatus } from 'store/features/gameConfigSlice';

const actionList = {
  timerStatus,
};

export const dispatchAction = ({ action, payload }) => {
  if (actionList[action]) {
    return store.dispatch(actionList[action](payload));
  } else {
    console.error(`Action ${action} not found in actionList`);
  }
};
