// ============================================
// src/store/slices/learningSlice.ts
// ============================================
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import learningService from '../../services/api/learning';

interface LearningStats {
  dailyGoal: number;
  dailyProgress: number;
  weeklyProgress: number[];
  monthlyProgress: number[];
  totalMinutesStudied: number;
  averageAccuracy: number;
  bestStreak: number;
}

interface LearningState {
  stats: LearningStats;
  currentStreak: number;
  lastStudyDate: string | null;
  achievements: string[];
  isStudying: boolean;
}

const initialState: LearningState = {
  stats: {
    dailyGoal: 20,
    dailyProgress: 0,
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
    monthlyProgress: [],
    totalMinutesStudied: 0,
    averageAccuracy: 0,
    bestStreak: 0,
  },
  currentStreak: 0,
  lastStudyDate: null,
  achievements: [],
  isStudying: false,
};

// Async Thunks
export const fetchProgressAsync = createAsyncThunk(
  'learning/fetchProgress',
  async () => {
    const progress = await learningService.getProgress();
    return progress;
  }
);

export const fetchStatsAsync = createAsyncThunk(
  'learning/fetchStats',
  async (period: 'day' | 'week' | 'month' | 'all' = 'week') => {
    const stats = await learningService.getStats(period);
    return stats;
  }
);

const learningSlice = createSlice({
  name: 'learning',
  initialState,
  reducers: {
    updateDailyProgress: (state, action: PayloadAction<number>) => {
      state.stats.dailyProgress = action.payload;
    },
    incrementStreak: (state) => {
      state.currentStreak += 1;
      if (state.currentStreak > state.stats.bestStreak) {
        state.stats.bestStreak = state.currentStreak;
      }
    },
    resetStreak: (state) => {
      state.currentStreak = 0;
    },
    addAchievement: (state, action: PayloadAction<string>) => {
      if (!state.achievements.includes(action.payload)) {
        state.achievements.push(action.payload);
      }
    },
    setStudying: (state, action: PayloadAction<boolean>) => {
      state.isStudying = action.payload;
    },
    updateStats: (state, action: PayloadAction<Partial<LearningStats>>) => {
      state.stats = { ...state.stats, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProgressAsync.fulfilled, (state, action) => {
        state.stats.dailyProgress = action.payload.dailyProgress;
        state.currentStreak = action.payload.studyStreak;
        state.stats.averageAccuracy = action.payload.retentionRate;
      })
      .addCase(fetchStatsAsync.fulfilled, (state, action) => {
        const { stats } = action.payload;
        state.stats.totalMinutesStudied = stats.minutesStudied;
        state.currentStreak = stats.streak;
      });
  },
});

export const {
  updateDailyProgress,
  incrementStreak,
  resetStreak,
  addAchievement,
  setStudying,
  updateStats,
} = learningSlice.actions;
export default learningSlice.reducer;