// ============================================
// src/store/slices/contentSlice.ts
// ============================================
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import contentService from '../../services/api/content';

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

// Async Thunks
export const processWebContentAsync = createAsyncThunk(
  'content/processWeb',
  async ({ url, options }: { url: string; options?: any }) => {
    const result = await contentService.processWebContent(url, options);
    return {
      source: {
        id: `web_${Date.now()}`,
        type: 'url' as const,
        title: url,
        content: result.summary,
        processedAt: new Date(),
        cardCount: result.cards.length,
      },
      cards: result.cards,
    };
  }
);

export const processTextContentAsync = createAsyncThunk(
  'content/processText',
  async ({ text, title = 'Text Input', options }: { text: string; title?: string; options?: any }) => {
    const result = await contentService.processTextContent(text, { ...options, title });
    return {
      source: {
        id: `text_${Date.now()}`,
        type: 'text' as const,
        title,
        content: text,
        processedAt: new Date(),
        cardCount: result.cards.length,
      },
      cards: result.cards,
    };
  }
);

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
  extraReducers: (builder) => {
    builder
      .addCase(processWebContentAsync.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
        state.processingProgress = 0;
      })
      .addCase(processWebContentAsync.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.processingProgress = 100;
        state.sources.push(action.payload.source);
      })
      .addCase(processWebContentAsync.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.error.message || 'Failed to process content';
      })
      .addCase(processTextContentAsync.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
        state.processingProgress = 0;
      })
      .addCase(processTextContentAsync.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.processingProgress = 100;
        state.sources.push(action.payload.source);
      })
      .addCase(processTextContentAsync.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.error.message || 'Failed to process content';
      });
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