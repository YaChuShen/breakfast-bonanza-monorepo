'use client';
import { createSlice } from '@reduxjs/toolkit';
import { range, sample } from 'lodash';
import menuList from 'contents/menuList';
import { menuInfo } from 'contents/menuList';
import { MAX_CUSTOMERS } from 'contents/rules';

const initialState = {
  score: 0,
};

export const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    handleOvertime: (state, action) => {
      const { id, status } = action.payload;
      const key = state[id];
      key.overtime = status;
    },
    handleCustomStatus: (state, action) => {
      const { id, status } = action.payload;
      const key = state[id];
      key.status = status;
    },
    getNextOrder: (state, action) => {
      const { id, isLevel2 } = action.payload;

      const basicList = menuInfo
        .filter((e) => !e.level2)
        .map((e) => e.ingredient);

      const key = state[id];
      key.order = isLevel2 ? sample(menuList) : sample(basicList);
    },
    getScore: (state, action) => {
      const { score } = action.payload;
      state.score = state.score + score;
    },
    minusScore: (state) => {
      state.score = state.score - 30;
    },
    getInitCustomersState: (state, action) => {
      const { isLevel2 } = action.payload;
      const basicList = menuInfo
        .filter((e) => !e.level2)
        .map((e) => e.ingredient);

      const defaultSetting = range(MAX_CUSTOMERS).reduce((all, curr, i) => {
        all[`customer${i + 1}`] = {
          order: isLevel2 ? sample(menuList) : sample(basicList),
          status: 'waiting',
        };
        return all;
      }, {});

      state = { ...state, ...defaultSetting, isLevel2 };
      return state;
    },
  },
});

export const selectCustomer = (state) => state.customer;
export const {
  handleOvertime,
  handleCustomStatus,
  getNextOrder,
  getScore,
  minusScore,
  getInitCustomersState,
} = customerSlice.actions;

export default customerSlice.reducer;
