// ============================================
// src/hooks/useAppState.ts (Bonus: Custom hook for app state)
// ============================================
import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { performSyncAsync } from '../store/slices/syncSlice';

export const useAppState = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App became active - trigger sync if needed
        dispatch(performSyncAsync());
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [dispatch]);
};