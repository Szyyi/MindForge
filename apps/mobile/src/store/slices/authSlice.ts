// ============================================
// src/store/slices/authSlice.ts
// ============================================
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  refreshToken: string | null;
  userId: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  token: null,
  refreshToken: null,
  userId: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
    },
    loginSuccess: (state, action: PayloadAction<{
      token: string;
      refreshToken: string;
      userId: string;
    }>) => {
      state.isAuthenticated = true;
      state.isLoading = false;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.userId = action.payload.userId;
    },
    loginFailure: (state) => {
      state.isLoading = false;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.refreshToken = null;
      state.userId = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;