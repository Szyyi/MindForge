// ============================================
// src/store/slices/syncSlice.ts
// ============================================
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import syncService from '../../services/api/sync';
import NetInfo from '@react-native-community/netinfo';

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

// Async Thunks
export const performSyncAsync = createAsyncThunk(
  'sync/performSync',
  async () => {
    const result = await syncService.syncData();
    return result;
  }
);

export const checkOnlineStatusAsync = createAsyncThunk(
  'sync/checkOnline',
  async () => {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected;
  }
);

export const getSyncStatusAsync = createAsyncThunk(
  'sync/getStatus',
  async () => {
    const status = await syncService.getSyncStatus();
    return status;
  }
);

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
  extraReducers: (builder) => {
    builder
      .addCase(performSyncAsync.pending, (state) => {
        state.isSyncing = true;
      })
      .addCase(performSyncAsync.fulfilled, (state, action) => {
        state.isSyncing = false;
        state.lastSyncTime = action.payload.lastSyncedAt.toISOString();
        state.pendingChanges = 0;
        state.syncErrors = [];
      })
      .addCase(performSyncAsync.rejected, (state, action) => {
        state.isSyncing = false;
        state.syncErrors.push(action.error.message || 'Sync failed');
      })
      .addCase(checkOnlineStatusAsync.fulfilled, (state, action) => {
        state.isOnline = action.payload || false;
      })
      .addCase(getSyncStatusAsync.fulfilled, (state, action) => {
        state.isSyncing = action.payload.isSyncing;
        state.pendingChanges = action.payload.pendingChanges;
        if (action.payload.lastSyncedAt) {
          state.lastSyncTime = action.payload.lastSyncedAt.toISOString();
        }
      });
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