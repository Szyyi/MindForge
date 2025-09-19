// ============================================
// src/hooks/useNetworkStatus.ts (Bonus: Network monitoring hook)
// ============================================
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useDispatch } from 'react-redux';
import { setOnlineStatus } from '../store/slices/syncSlice';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected || false;
      setIsOnline(online);
      dispatch(setOnlineStatus(online));
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  return isOnline;
};