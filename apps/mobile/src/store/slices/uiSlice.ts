// ============================================
// src/store/slices/uiSlice.ts
// ============================================
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { storageService } from '../../services/storage/asyncStorage';
import * as Haptics from 'expo-haptics';

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

// Async thunk to load UI preferences from storage
export const loadUIPreferencesAsync = createAsyncThunk(
  'ui/loadPreferences',
  async () => {
    const settings = await storageService.getAppSettings();
    if (settings?.ui) {
      return settings.ui;
    }
    return null;
  }
);

// Async thunk to save UI preferences to storage
export const saveUIPreferencesAsync = createAsyncThunk(
  'ui/savePreferences',
  async (preferences: Partial<UIState>) => {
    const currentSettings = await storageService.getAppSettings() || {};
    await storageService.updateAppSettings({
      ...currentSettings,
      ui: preferences,
    });
    return preferences;
  }
);

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'dark' | 'light' | 'auto'>) => {
      state.theme = action.payload;
      // Persist preference
      saveUIPreferencesAsync({ theme: action.payload });
    },
    
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled;
      // Persist preference
      saveUIPreferencesAsync({ soundEnabled: state.soundEnabled });
    },
    
    toggleHaptic: (state) => {
      state.hapticEnabled = !state.hapticEnabled;
      // Trigger haptic feedback on toggle
      if (!state.hapticEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      // Persist preference
      saveUIPreferencesAsync({ hapticEnabled: state.hapticEnabled });
    },
    
    toggleAnimations: (state) => {
      state.animationsEnabled = !state.animationsEnabled;
      // Persist preference
      saveUIPreferencesAsync({ animationsEnabled: state.animationsEnabled });
    },
    
    setFontSize: (state, action: PayloadAction<'small' | 'medium' | 'large'>) => {
      state.fontSize = action.payload;
      // Persist preference
      saveUIPreferencesAsync({ fontSize: action.payload });
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
      const toast = {
        id: Date.now().toString(),
        ...action.payload,
      };
      
      state.toasts.push(toast);
      
      // Auto-remove toast after 4 seconds
      setTimeout(() => {
        // This will need to be dispatched from the component
        // Or you can handle it in a middleware
      }, 4000);
      
      // Trigger haptic feedback for toasts
      if (state.hapticEnabled) {
        if (action.payload.type === 'error') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } else if (action.payload.type === 'success') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    },
    
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    },
    
    clearAllToasts: (state) => {
      state.toasts = [];
    },
    
    resetUIState: () => initialState,
  },
  
  extraReducers: (builder) => {
    // Load preferences from storage
    builder.addCase(loadUIPreferencesAsync.fulfilled, (state, action) => {
      if (action.payload) {
        return { ...state, ...action.payload, toasts: state.toasts, activeModal: state.activeModal, loading: state.loading };
      }
    });
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
  clearAllToasts,
  resetUIState,
} = uiSlice.actions;

export default uiSlice.reducer;