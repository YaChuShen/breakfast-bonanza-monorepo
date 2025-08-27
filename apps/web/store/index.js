'use client';

import { configureStore } from '@reduxjs/toolkit';
import plateReducer from './features/plateSlice';
import customerReducer from './features/customerSlice';
import gameConfigReducer from './features/gameConfigSlice';

const store = configureStore({
  reducer: {
    plate: plateReducer,
    customer: customerReducer,
    gameConfig: gameConfigReducer,
  },
});

export default store;
