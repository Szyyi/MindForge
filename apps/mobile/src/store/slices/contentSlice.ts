// ============================================
// src/store/slices/contentSlice.ts
// ============================================
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ContentSource {
  id: string;
  type: 'url' | 'pdf' | 'text';
  title: string;
  content: string;
  processedAt?: Date;
  cardCount?: number;
}

interface ContentState {
  sources: ContentSource[];
  currentSource: ContentSource | null;
  isProcessing: boolean;
  processingProgress: number;
  error: string | null;
}

const initialState: ContentState = {
  sources: [],
  currentSource: null,
  isProcessing: false,
  processingProgress: 0,
  error: null,
};

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    addSource: (state, action: PayloadAction<ContentSource>) => {
      state.sources.push(action.payload);
    },
    setCurrentSource: (state, action: PayloadAction<ContentSource | null>) => {
      state.currentSource = action.payload;
    },
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },
    setProgress: (state, action: PayloadAction<number>) => {
      state.processingProgress = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    removeSource: (state, action: PayloadAction<string>) => {
      state.sources = state.sources.filter(s => s.id !== action.payload);
    },
  },
});

export const {
  addSource,
  setCurrentSource,
  setProcessing,
  setProgress,
  setError,
  removeSource,
} = contentSlice.actions;
export default contentSlice.reducer;
