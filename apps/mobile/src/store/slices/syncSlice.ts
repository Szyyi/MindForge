// ============================================
// src/store/slices/syncSlice.ts
// ============================================
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SyncState {
  isSyncing: boolean;
  lastSyncTime: string | null;
  pendingChanges: number;
  syncErrors: string[];
  isOnline: boolean;
}

const initialState: SyncState = {
  isSyncing: false,
  lastSyncTime: null,
  pendingChanges: 0,
  syncErrors: [],
  isOnline: true,
};

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    startSync: (state) => {
      state.isSyncing = true;
    },
    syncSuccess: (state) => {
      state.isSyncing = false;
      state.lastSyncTime = new Date().toISOString();
      state.pendingChanges = 0;
      state.syncErrors = [];
    },
    syncFailure: (state, action: PayloadAction<string>) => {
      state.isSyncing = false;
      state.syncErrors.push(action.payload);
    },
    incrementPendingChanges: (state) => {
      state.pendingChanges += 1;
    },
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    clearSyncErrors: (state) => {
      state.syncErrors = [];
    },
  },
});

export const {
  startSync,
  syncSuccess,
  syncFailure,
  incrementPendingChanges,
  setOnlineStatus,
  clearSyncErrors,
} = syncSlice.actions;
export default syncSlice.reducer;