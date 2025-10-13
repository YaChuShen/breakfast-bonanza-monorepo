'use client';
import { createSlice } from '@reduxjs/toolkit';
export const gameConfigSlice = createSlice({
  name: 'gameConfig',
  initialState: {
    trashCanOpen: false,
    timerStatus: 'initial',
    score: 0,
    gameMode: 'single', // 'single' | 'multi'
    roomId: null,
    playersInfo: [],
    hostId: null,
    opponentScore: 0,
    opponentName: '',
  },
  reducers: {
    handleTrashCan: (state, action) => {
      const { value } = action.payload;
      state.trashCanOpen = value;
    },
    handleTimerStatus: (state, action) => {
      const { status, roomId } = action.payload;
      state.timerStatus = status;
      if (roomId) {
        state.roomId = roomId;
      }
    },
    setGameMode: (state, action) => {
      const { mode } = action.payload;
      state.gameMode = mode;
    },
    setRoomInfo: (state, action) => {
      const { roomId, playersInfo, hostId } = action.payload;
      if (roomId) state.roomId = roomId;
      if (playersInfo) state.playersInfo = playersInfo;
      if (hostId) state.hostId = hostId;
    },
    setOpponentScore: (state, action) => {
      const { score, playerName } = action.payload;
      state.opponentScore = score;
      if (playerName) state.opponentName = playerName;
    },
    resetGameConfig: (state) => {
      state.gameMode = 'single';
      state.roomId = null;
      state.playersInfo = [];
      state.hostId = null;
      state.opponentScore = 0;
      state.opponentName = '';
      state.timerStatus = 'modeSelection';
    },
  },
});

export const selectGameConfig = (state) => state.gameConfig;
export const {
  handleTrashCan,
  timerStatus,
  setGameMode,
  setRoomInfo,
  setOpponentScore,
  resetGameConfig,
  handleTimerStatus,
} = gameConfigSlice.actions;

export default gameConfigSlice.reducer;
