// ============================================
// src/store/slices/userSlice.ts
// ============================================
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, UserStats, UserPreferences } from '../../types/user_types';
import api from '../../services/api/client';
import { storageService } from '../../services/storage/asyncStorage';

interface UserState {
  profile: User | null;
  stats: UserStats | null;
  preferences: UserPreferences | null;
  hasCompletedOnboarding: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  stats: null,
  preferences: null,
  hasCompletedOnboarding: false,
  isLoading: false,
  error: null,
};

// Async Thunks
export const fetchUserProfileAsync = createAsyncThunk(
  'user/fetchProfile',
  async () => {
    const response = await api.get<User>('/user/profile');
    return response;
  }
);

export const updateUserProfileAsync = createAsyncThunk(
  'user/updateProfile',
  async (updates: Partial<User>) => {
    const response = await api.put<User>('/user/profile', updates);
    return response;
  }
);

export const updatePreferencesAsync = createAsyncThunk(
  'user/updatePreferences',
  async (preferences: Partial<UserPreferences>) => {
    const response = await api.put<UserPreferences>('/user/preferences', preferences);
    await storageService.setUserPreferences(response);
    return response;
  }
);

export const completeOnboardingAsync = createAsyncThunk(
  'user/completeOnboarding',
  async () => {
    await storageService.setOnboardingComplete();
    return true;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<User | null>) => {
      state.profile = action.payload;
    },
    setStats: (state, action: PayloadAction<UserStats | null>) => {
      state.stats = action.payload;
    },
    setPreferences: (state, action: PayloadAction<UserPreferences | null>) => {
      state.preferences = action.payload;
    },
    setHasCompletedOnboarding: (state, action: PayloadAction<boolean>) => {
      state.hasCompletedOnboarding = action.payload;
    },
    updateLocalPreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      if (state.preferences) {
        state.preferences = { ...state.preferences, ...action.payload };
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfileAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfileAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.stats = action.payload.stats;
        state.preferences = action.payload.preferences;
      })
      .addCase(fetchUserProfileAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch profile';
      })
      .addCase(updateUserProfileAsync.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(updatePreferencesAsync.fulfilled, (state, action) => {
        state.preferences = action.payload;
      })
      .addCase(completeOnboardingAsync.fulfilled, (state) => {
        state.hasCompletedOnboarding = true;
      });
  },
});

export const {
  setProfile,
  setStats,
  setPreferences,
  setHasCompletedOnboarding,
  updateLocalPreferences,
  setLoading,
  setError,
} = userSlice.actions;

export default userSlice.reducer;