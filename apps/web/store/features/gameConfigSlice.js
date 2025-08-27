'use client';
import { createSlice } from '@reduxjs/toolkit';
export const gameConfigSlice = createSlice({
  name: 'gameConfig',
  initialState: {
    trashCanOpen: false,
    timerStatus: 'initial',
    score: 0,
  },
  reducers: {
    handleTrashCan: (state, action) => {
      const { value } = action.payload;
      state.trashCanOpen = value;
    },
    timerStatus: (state, action) => {
      const { status } = action.payload;
      state.timerStatus = status;
    },
  },
});

export const selectGameConfig = (state) => state.gameConfig;
export const { handleTrashCan, timerStatus } = gameConfigSlice.actions;

export default gameConfigSlice.reducer;
