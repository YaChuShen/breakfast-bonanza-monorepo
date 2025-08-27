'use client';
import { createSlice } from '@reduxjs/toolkit';
import { range } from 'lodash';
import { MAX_PLATE } from 'contents/rules';

const p = range(MAX_PLATE).reduce((all, curr, i) => {
  all[`plateContent${i + 1}`] = [];
  return all;
}, {});

const initialState = {
  ...p,
  status: 'idle',
  targetItem: '',
  targetPlate: '',
  plate: MAX_PLATE,
};

export const plateSlice = createSlice({
  name: 'plate',
  initialState,
  reducers: {
    addFood: (state, action) => {
      const { id, targetItem } = action.payload;
      const plateKey = `plateContent${id}`;
      if (!state[plateKey] || targetItem.length === 0) {
        state[plateKey] = [];
      } else {
        state[plateKey].push(targetItem);
      }
    },
    setTargetItem: (state, action) => {
      const { target } = action.payload;
      state.targetItem = target;
    },
    setTargetPlate: (state, action) => {
      const { index } = action.payload;
      state.targetPlate = index;
    },
  },
});

export const selectPlate = (state) => state.plate;
export const { addFood, setTargetItem, setTargetPlate } = plateSlice.actions;

export default plateSlice.reducer;
