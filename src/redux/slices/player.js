// src/redux/slices/player.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentTrack: null,
  isPlaying: false,
  progress: 0,
  volume: 0.7,
  audioRef: null,
  error: null,
  isLoading: false
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentTrack: (state, action) => {
      state.currentTrack = action.payload;
      state.error = null; // Сбрасываем ошибку при смене трека
    },
    setIsPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },
    setProgress: (state, action) => {
      state.progress = action.payload;
    },
    setVolume: (state, action) => {
      state.volume = action.payload;
    },
    setAudioRef: (state, action) => {
      state.audioRef = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isPlaying = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    }
  }
});

// Изменяем экспорт экшенов
export const actions = playerSlice.actions;
export const selectPlayer = (state) => state.player;
export default playerSlice.reducer;