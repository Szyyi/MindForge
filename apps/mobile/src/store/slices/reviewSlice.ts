// ============================================
// src/store/slices/reviewSlice.ts
// ============================================
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ReviewSession, ReviewHistory, ReviewRating } from '../../types/review_types';
import { Card } from '../../types/card_types';
import learningService from '../../services/api/learning';

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

// Async Thunks
export const fetchNextReviewAsync = createAsyncThunk(
  'review/fetchNext',
  async (limit: number = 20) => {
    const response = await learningService.getNextReview(limit);
    return response;
  }
);

export const submitReviewAsync = createAsyncThunk(
  'review/submit',
  async ({ cardId, rating, timeSpent }: { cardId: string; rating: ReviewRating; timeSpent?: number }) => {
    const updatedCard = await learningService.submitReview(cardId, rating, timeSpent || 0);
    return { cardId, updatedCard };
  }
);

export const startSessionAsync = createAsyncThunk(
  'review/startSession',
  async (categoryId?: string) => {
    const session = await learningService.startStudySession(categoryId);
    return session;
  }
);

export const endSessionAsync = createAsyncThunk(
  'review/endSession',
  async ({ sessionId, stats }: { sessionId: string; stats: any }) => {
    const session = await learningService.endStudySession(sessionId, stats);
    return session;
  }
);

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
  extraReducers: (builder) => {
    builder
      .addCase(fetchNextReviewAsync.fulfilled, (state, action) => {
        state.currentSession = action.payload.session;
        state.reviewQueue = action.payload.cards;
        state.todayReviews = action.payload.cards;
        state.isReviewing = true;
      })
      .addCase(submitReviewAsync.fulfilled, (state, action) => {
        state.reviewQueue = state.reviewQueue.filter(c => c.id !== action.payload.cardId);
      })
      .addCase(startSessionAsync.fulfilled, (state, action) => {
        state.currentSession = action.payload;
        state.isReviewing = true;
      })
      .addCase(endSessionAsync.fulfilled, (state) => {
        state.currentSession = null;
        state.isReviewing = false;
        state.reviewQueue = [];
      });
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
