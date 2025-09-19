// ============================================
// src/store/slices/learningSlice.ts
// ============================================
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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