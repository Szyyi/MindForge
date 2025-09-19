// ============================================
// src/store/slices/uiSlice.ts
// ============================================
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'dark' | 'light' | 'auto';
  soundEnabled: boolean;
  hapticEnabled: boolean;
  animationsEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large';
  activeModal: string | null;
  loading: boolean;
  toasts: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>;
}

const initialState: UIState = {
  theme: 'dark',
  soundEnabled: true,
  hapticEnabled: true,
  animationsEnabled: true,
  fontSize: 'medium',
  activeModal: null,
  loading: false,
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'dark' | 'light' | 'auto'>) => {
      state.theme = action.payload;
    },
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled;
    },
    toggleHaptic: (state) => {
      state.hapticEnabled = !state.hapticEnabled;
    },
    toggleAnimations: (state) => {
      state.animationsEnabled = !state.animationsEnabled;
    },
    setFontSize: (state, action: PayloadAction<'small' | 'medium' | 'large'>) => {
      state.fontSize = action.payload;
    },
    showModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload;
    },
    hideModal: (state) => {
      state.activeModal = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    showToast: (state, action: PayloadAction<{
      message: string;
      type: 'success' | 'error' | 'info';
    }>) => {
      state.toasts.push({
        id: Date.now().toString(),
        ...action.payload,
      });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    },
  },
});

export const {
  setTheme,
  toggleSound,
  toggleHaptic,
  toggleAnimations,
  setFontSize,
  showModal,
  hideModal,
  setLoading,
  showToast,
  removeToast,
} = uiSlice.actions;
export default uiSlice.reducer;