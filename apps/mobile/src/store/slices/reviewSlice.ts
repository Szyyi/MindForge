// ============================================
// src/store/slices/reviewSlice.ts
// ============================================
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ReviewSession, ReviewHistory } from '../../types/review_types';
import { Card } from '../../types/card_types';

interface ReviewState {
  currentSession: ReviewSession | null;
  todayReviews: Card[];
  reviewQueue: Card[];
  history: ReviewHistory[];
  isReviewing: boolean;
}

const initialState: ReviewState = {
  currentSession: null,
  todayReviews: [],
  reviewQueue: [],
  history: [],
  isReviewing: false,
};

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    startSession: (state, action: PayloadAction<ReviewSession>) => {
      state.currentSession = action.payload;
      state.isReviewing = true;
    },
    endSession: (state) => {
      state.currentSession = null;
      state.isReviewing = false;
      state.reviewQueue = [];
    },
    setReviewQueue: (state, action: PayloadAction<Card[]>) => {
      state.reviewQueue = action.payload;
      state.todayReviews = action.payload;
    },
    removeFromQueue: (state, action: PayloadAction<string>) => {
      state.reviewQueue = state.reviewQueue.filter(c => c.id !== action.payload);
    },
    addToHistory: (state, action: PayloadAction<ReviewHistory>) => {
      state.history.push(action.payload);
    },
  },
});

export const {
  startSession,
  endSession,
  setReviewQueue,
  removeFromQueue,
  addToHistory,
} = reviewSlice.actions;
export default reviewSlice.reducer;