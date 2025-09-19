// src/hooks/useOffline.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { useAppSelector } from '../store';
import { storageService } from '../services/storage/asyncStorage';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'SYNC';
  entity: 'card' | 'content' | 'review' | 'preference' | 'progress';
  payload: any;
  timestamp: string;
  retryCount: number;
  maxRetries: number;
}

interface OfflineQueueState {
  queue: OfflineAction[];
  processingId: string | null;
  failedActions: OfflineAction[];
}

interface UseOfflineReturn {
  // State
  isOffline: boolean;
  queueLength: number;
  failedCount: number;
  isProcessingQueue: boolean;
  
  // Queue Management
  addToQueue: (action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount' | 'maxRetries'>) => Promise<void>;
  removeFromQueue: (actionId: string) => Promise<void>;
  clearQueue: () => Promise<void>;
  retryFailedActions: () => Promise<void>;
  
  // Processing
  processQueue: () => Promise<void>;
  
  // Utilities
  getQueuedActions: () => OfflineAction[];
  getFailedActions: () => OfflineAction[];
  canProcessQueue: boolean;
  estimatedSyncTime: number;
}

const OFFLINE_QUEUE_KEY = 'mindforge_offline_queue';
const FAILED_ACTIONS_KEY = 'mindforge_failed_actions';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

export const useOffline = (): UseOfflineReturn => {
  const syncState = useAppSelector((state) => state.sync);
  const authState = useAppSelector((state) => state.auth);
  
  const [queueState, setQueueState] = useState<OfflineQueueState>({
    queue: [],
    processingId: null,
    failedActions: [],
  });
  
  const [isOffline, setIsOffline] = useState(!syncState.isOnline);
  const processingRef = useRef(false);

  // Load queue from storage on mount
  useEffect(() => {
    loadQueueFromStorage();
  }, []);

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = isOffline;
      const nowOnline = state.isConnected || false;
      
      setIsOffline(!nowOnline);
      
      // Process queue when coming back online
      if (wasOffline && nowOnline && queueState.queue.length > 0) {
        setTimeout(() => {
          processQueue();
        }, RETRY_DELAY);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isOffline, queueState.queue.length]);

  // Load queue from storage
  const loadQueueFromStorage = async () => {
    try {
      const storedQueue = await storageService.get(OFFLINE_QUEUE_KEY);
      const storedFailed = await storageService.get(FAILED_ACTIONS_KEY);
      
      setQueueState({
        queue: Array.isArray(storedQueue) ? storedQueue : [],
        processingId: null,
        failedActions: Array.isArray(storedFailed) ? storedFailed : [],
      });
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  };

  // Save queue to storage
  const saveQueueToStorage = async (queue: OfflineAction[], failedActions: OfflineAction[]) => {
    try {
      await storageService.set(OFFLINE_QUEUE_KEY, queue);
      await storageService.set(FAILED_ACTIONS_KEY, failedActions);
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  };

  // Add action to queue
  const addToQueue = useCallback(async (
    action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount' | 'maxRetries'>
  ): Promise<void> => {
    const newAction: OfflineAction = {
      ...action,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      maxRetries: MAX_RETRIES,
    };

    setQueueState(prev => {
      const updatedQueue = [...prev.queue, newAction];
      saveQueueToStorage(updatedQueue, prev.failedActions);
      
      return {
        ...prev,
        queue: updatedQueue,
      };
    });

    // If online and authenticated, process immediately
    if (!isOffline && authState.isAuthenticated) {
      setTimeout(() => {
        processQueue();
      }, 500);
    }
  }, [isOffline, authState.isAuthenticated]);

  // Remove action from queue
  const removeFromQueue = useCallback(async (actionId: string): Promise<void> => {
    setQueueState(prev => {
      const updatedQueue = prev.queue.filter(action => action.id !== actionId);
      saveQueueToStorage(updatedQueue, prev.failedActions);
      
      return {
        ...prev,
        queue: updatedQueue,
        processingId: prev.processingId === actionId ? null : prev.processingId,
      };
    });
  }, []);

  // Clear entire queue
  const clearQueue = useCallback(async (): Promise<void> => {
    return new Promise((resolve) => {
      Alert.alert(
        'Clear Offline Queue',
        `Are you sure you want to clear ${queueState.queue.length} queued actions? This cannot be undone.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(),
          },
          {
            text: 'Clear',
            style: 'destructive',
            onPress: async () => {
              setQueueState(prev => ({
                ...prev,
                queue: [],
                processingId: null,
              }));
              await storageService.remove(OFFLINE_QUEUE_KEY);
              resolve();
            },
          },
        ]
      );
    });
  }, [queueState.queue.length]);

  // Process offline queue
  const processQueue = useCallback(async (): Promise<void> => {
    // Check if already processing or if conditions aren't met
    if (
      processingRef.current ||
      isOffline ||
      !authState.isAuthenticated ||
      queueState.queue.length === 0
    ) {
      return;
    }

    processingRef.current = true;
    const processedIds: string[] = [];
    const failedActions: OfflineAction[] = [];

    for (const action of queueState.queue) {
      setQueueState(prev => ({
        ...prev,
        processingId: action.id,
      }));

      try {
        // Process action based on type and entity
        await processAction(action);
        processedIds.push(action.id);
      } catch (error) {
        console.error(`Failed to process action ${action.id}:`, error);
        
        // Increment retry count
        const updatedAction = {
          ...action,
          retryCount: action.retryCount + 1,
        };

        if (updatedAction.retryCount >= updatedAction.maxRetries) {
          failedActions.push(updatedAction);
          processedIds.push(action.id); // Remove from queue
        }
      }

      // Small delay between actions
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Update queue state
    setQueueState(prev => {
      const remainingQueue = prev.queue.filter(action => !processedIds.includes(action.id));
      const updatedFailed = [...prev.failedActions, ...failedActions];
      
      saveQueueToStorage(remainingQueue, updatedFailed);
      
      return {
        queue: remainingQueue,
        processingId: null,
        failedActions: updatedFailed,
      };
    });

    processingRef.current = false;

    // Show summary if actions were processed
    if (processedIds.length > 0) {
      const successCount = processedIds.length - failedActions.length;
      if (failedActions.length > 0) {
        Alert.alert(
          'Sync Completed',
          `${successCount} actions synced successfully, ${failedActions.length} failed.`,
          [{ text: 'OK' }]
        );
      }
    }
  }, [isOffline, authState.isAuthenticated, queueState.queue]);

  // Process individual action (implement based on your API)
  const processAction = async (action: OfflineAction): Promise<void> => {
    // This should call your actual API endpoints based on action type and entity
    // For now, simulating with a delay
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 90% success rate
        if (Math.random() > 0.1) {
          resolve(undefined);
        } else {
          reject(new Error('Simulated failure'));
        }
      }, 500);
    });
  };

  // Retry failed actions
  const retryFailedActions = useCallback(async (): Promise<void> => {
    if (queueState.failedActions.length === 0) return;

    // Move failed actions back to queue with reset retry count
    setQueueState(prev => {
      const retriedActions = prev.failedActions.map(action => ({
        ...action,
        retryCount: 0,
      }));
      
      const updatedQueue = [...prev.queue, ...retriedActions];
      saveQueueToStorage(updatedQueue, []);
      
      return {
        ...prev,
        queue: updatedQueue,
        failedActions: [],
      };
    });

    // Process queue if online
    if (!isOffline && authState.isAuthenticated) {
      setTimeout(() => {
        processQueue();
      }, RETRY_DELAY);
    }
  }, [queueState.failedActions, isOffline, authState.isAuthenticated, processQueue]);

  // Get queued actions
  const getQueuedActions = useCallback((): OfflineAction[] => {
    return queueState.queue;
  }, [queueState.queue]);

  // Get failed actions
  const getFailedActions = useCallback((): OfflineAction[] => {
    return queueState.failedActions;
  }, [queueState.failedActions]);

  // Calculate estimated sync time (rough estimate)
  const getEstimatedSyncTime = useCallback((): number => {
    // Estimate 500ms per action
    return queueState.queue.length * 0.5;
  }, [queueState.queue.length]);

  return {
    // State
    isOffline,
    queueLength: queueState.queue.length,
    failedCount: queueState.failedActions.length,
    isProcessingQueue: processingRef.current || queueState.processingId !== null,
    
    // Queue Management
    addToQueue,
    removeFromQueue,
    clearQueue,
    retryFailedActions,
    
    // Processing
    processQueue,
    
    // Utilities
    getQueuedActions,
    getFailedActions,
    canProcessQueue: !isOffline && authState.isAuthenticated && queueState.queue.length > 0,
    estimatedSyncTime: getEstimatedSyncTime(),
  };
};