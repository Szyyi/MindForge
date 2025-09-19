// src/hooks/useSync.ts
import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  performSyncAsync,
  checkOnlineStatusAsync,
  getSyncStatusAsync,
  incrementPendingChanges,
  clearSyncErrors,
} from '../store/slices/syncSlice';
import NetInfo from '@react-native-community/netinfo';
import { AppState, AppStateStatus } from 'react-native';

interface UseSyncReturn {
  // State
  isSyncing: boolean;
  lastSyncTime: string | null;
  pendingChanges: number;
  syncErrors: string[];
  isOnline: boolean;
  
  // Actions
  syncNow: () => Promise<boolean>;
  checkSyncStatus: () => Promise<void>;
  markChangesPending: () => void;
  clearErrors: () => void;
  
  // Utilities
  canSync: boolean;
  timeSinceLastSync: number | null;
  hasPendingChanges: boolean;
  hasErrors: boolean;
  syncStatusText: string;
}

const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
const IMMEDIATE_SYNC_THRESHOLD = 10; // Sync immediately after 10 changes

export const useSync = (autoSync: boolean = true): UseSyncReturn => {
  const dispatch = useAppDispatch();
  const syncState = useAppSelector((state) => state.sync);
  const authState = useAppSelector((state) => state.auth);
  
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncAttemptRef = useRef<number>(0);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Calculate time since last sync
  const getTimeSinceLastSync = useCallback((): number | null => {
    if (!syncState.lastSyncTime) return null;
    return Date.now() - new Date(syncState.lastSyncTime).getTime();
  }, [syncState.lastSyncTime]);

  // Generate sync status text
  const getSyncStatusText = useCallback((): string => {
    if (!syncState.isOnline) return 'Offline';
    if (syncState.isSyncing) return 'Syncing...';
    if (syncState.syncErrors.length > 0) return 'Sync failed';
    if (syncState.pendingChanges > 0) return `${syncState.pendingChanges} pending changes`;
    if (syncState.lastSyncTime) {
      const timeSince = getTimeSinceLastSync();
      if (timeSince && timeSince < 60000) return 'Synced just now';
      if (timeSince && timeSince < 3600000) {
        const minutes = Math.floor(timeSince / 60000);
        return `Synced ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      }
      if (timeSince && timeSince < 86400000) {
        const hours = Math.floor(timeSince / 3600000);
        return `Synced ${hours} hour${hours > 1 ? 's' : ''} ago`;
      }
      return 'Synced recently';
    }
    return 'Not synced';
  }, [syncState, getTimeSinceLastSync]);

  // Perform sync
  const syncNow = useCallback(async (): Promise<boolean> => {
    // Check if can sync
    if (!authState.isAuthenticated || !syncState.isOnline || syncState.isSyncing) {
      return false;
    }

    // Prevent rapid sync attempts
    const now = Date.now();
    if (now - lastSyncAttemptRef.current < 1000) {
      return false;
    }
    lastSyncAttemptRef.current = now;

    try {
      await dispatch(performSyncAsync()).unwrap();
      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    }
  }, [dispatch, authState.isAuthenticated, syncState.isOnline, syncState.isSyncing]);

  // Check sync status
  const checkSyncStatus = useCallback(async (): Promise<void> => {
    try {
      await dispatch(getSyncStatusAsync()).unwrap();
    } catch (error) {
      console.error('Failed to check sync status:', error);
    }
  }, [dispatch]);

  // Mark changes as pending
  const markChangesPending = useCallback(() => {
    dispatch(incrementPendingChanges());
    
    // Trigger immediate sync if threshold reached
    if (syncState.pendingChanges >= IMMEDIATE_SYNC_THRESHOLD && syncState.isOnline && !syncState.isSyncing) {
      syncNow();
    }
  }, [dispatch, syncState.pendingChanges, syncState.isOnline, syncState.isSyncing, syncNow]);

  // Clear sync errors
  const clearErrors = useCallback(() => {
    dispatch(clearSyncErrors());
  }, [dispatch]);

  // Setup network listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      dispatch(checkOnlineStatusAsync());
      
      // Attempt sync when coming back online
      if (state.isConnected && syncState.pendingChanges > 0) {
        setTimeout(() => {
          syncNow();
        }, 2000); // Wait 2 seconds for connection to stabilize
      }
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch, syncState.pendingChanges, syncNow]);

  // Setup app state listener
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // Coming from background to foreground
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        if (authState.isAuthenticated && syncState.isOnline) {
          checkSyncStatus();
          
          // Sync if it's been a while
          const timeSince = getTimeSinceLastSync();
          if (timeSince && timeSince > SYNC_INTERVAL) {
            syncNow();
          }
        }
      }
      
      // Going to background
      if (appStateRef.current === 'active' && nextAppState.match(/inactive|background/)) {
        if (syncState.pendingChanges > 0 && syncState.isOnline) {
          syncNow();
        }
      }
      
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [authState.isAuthenticated, syncState, syncNow, checkSyncStatus, getTimeSinceLastSync]);

  // Setup auto-sync interval
  useEffect(() => {
    if (autoSync && authState.isAuthenticated) {
      // Initial sync check
      checkSyncStatus();

      // Setup interval for periodic sync
      syncIntervalRef.current = setInterval(() => {
        if (syncState.isOnline && (syncState.pendingChanges > 0 || getTimeSinceLastSync()! > SYNC_INTERVAL)) {
          syncNow();
        }
      }, SYNC_INTERVAL);

      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
          syncIntervalRef.current = null;
        }
      };
    }
  }, [autoSync, authState.isAuthenticated, syncState.isOnline, syncState.pendingChanges, syncNow, checkSyncStatus, getTimeSinceLastSync]);

  return {
    // State
    isSyncing: syncState.isSyncing,
    lastSyncTime: syncState.lastSyncTime,
    pendingChanges: syncState.pendingChanges,
    syncErrors: syncState.syncErrors,
    isOnline: syncState.isOnline,
    
    // Actions
    syncNow,
    checkSyncStatus,
    markChangesPending,
    clearErrors,
    
    // Utilities
    canSync: authState.isAuthenticated && syncState.isOnline && !syncState.isSyncing,
    timeSinceLastSync: getTimeSinceLastSync(),
    hasPendingChanges: syncState.pendingChanges > 0,
    hasErrors: syncState.syncErrors.length > 0,
    syncStatusText: getSyncStatusText(),
  };
};