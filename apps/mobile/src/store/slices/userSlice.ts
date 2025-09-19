// ============================================
// src/store/slices/userSlice.ts
// ============================================
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserStats } from '../../types/user_types';

interface UserState {
  currentUser: User | null;
  hasCompletedOnboarding: boolean;
  stats: UserStats | null;
}

const initialState: UserState = {
  currentUser: null,
  hasCompletedOnboarding: false,
  stats: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.stats = action.payload.stats;
    },
    updateStats: (state, action: PayloadAction<Partial<UserStats>>) => {
      if (state.stats) {
        state.stats = { ...state.stats, ...action.payload };
      }
    },
    completeOnboarding: (state) => {
      state.hasCompletedOnboarding = true;
    },
    resetUser: (state) => {
      state.currentUser = null;
      state.stats = null;
    },
  },
});

export const { setUser, updateStats, completeOnboarding, resetUser } = userSlice.actions;
export default userSlice.reducer;