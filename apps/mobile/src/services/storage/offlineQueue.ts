// ============================================
// src/services/storage/offlineQueue.ts
// ============================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const QUEUE_KEY = '@mindforge/offline_queue';

export interface QueuedOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'SYNC';
  entity: 'card' | 'deck' | 'review' | 'user' | 'category';
  data: any;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

class OfflineQueueService {
  private queue: QueuedOperation[] = [];
  private isProcessing: boolean = false;
  private processInterval: NodeJS.Timeout | null = null;
  private networkUnsubscribe: (() => void) | null = null;

  async initialize() {
    // Load queue from storage
    await this.loadQueue();
    
    // Start monitoring network status
    this.startNetworkMonitoring();
    
    // Process queue periodically
    this.startQueueProcessor();
  }

  private async loadQueue() {
    try {
      const queueData = await AsyncStorage.getItem(QUEUE_KEY);
      this.queue = queueData ? JSON.parse(queueData) : [];
      console.log(`Loaded ${this.queue.length} items from offline queue`);
    } catch (error) {
      console.error('Error loading offline queue:', error);
      this.queue = [];
    }
  }

  private async saveQueue() {
    try {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  async addToQueue(operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retries' | 'maxRetries'>): Promise<string> {
    const queueItem: QueuedOperation = {
      ...operation,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: 3,
    };

    this.queue.push(queueItem);
    await this.saveQueue();
    
    console.log(`Added to offline queue: ${operation.type} ${operation.entity}`);
    
    // Try to process immediately if online
    this.processQueue();
    
    return queueItem.id;
  }

  private startNetworkMonitoring() {
    this.networkUnsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && !this.isProcessing && this.queue.length > 0) {
        console.log('Network connected, processing offline queue...');
        this.processQueue();
      }
    });
  }

  private startQueueProcessor() {
    // Process queue every 30 seconds
    this.processInterval = setInterval(() => {
      if (this.queue.length > 0) {
        this.processQueue();
      }
    }, 30000);
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      console.log('No connection, skipping queue processing');
      return;
    }

    this.isProcessing = true;
    console.log(`Processing ${this.queue.length} queued operations...`);

    try {
      const itemsToProcess = [...this.queue];
      const processedIds: string[] = [];
      const failedItems: QueuedOperation[] = [];

      for (const item of itemsToProcess) {
        try {
          await this.processOperation(item);
          processedIds.push(item.id);
          console.log(`Successfully processed: ${item.type} ${item.entity}`);
        } catch (error) {
          console.error(`Error processing queue item ${item.id}:`, error);
          
          // Increment retry count
          item.retries++;
          
          // Remove if max retries exceeded
          if (item.retries >= item.maxRetries) {
            processedIds.push(item.id);
            console.error(`Max retries exceeded for item ${item.id}, removing from queue`);
          } else {
            failedItems.push(item);
          }
        }
      }

      // Update queue: remove processed items, keep failed items with updated retry count
      this.queue = failedItems;
      await this.saveQueue();
      
      console.log(`Queue processing complete. Processed: ${processedIds.length}, Remaining: ${this.queue.length}`);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processOperation(operation: QueuedOperation): Promise<void> {
    console.log('Processing operation:', operation.type, operation.entity);
    
    // Dynamically import services to avoid circular dependencies
    switch (operation.entity) {
      case 'card':
        await this.processCardOperation(operation);
        break;
      
      case 'deck':
        await this.processDeckOperation(operation);
        break;
      
      case 'category':
        await this.processCategoryOperation(operation);
        break;
      
      case 'review':
        await this.processReviewOperation(operation);
        break;
      
      case 'user':
        await this.processUserOperation(operation);
        break;
      
      default:
        throw new Error(`Unknown entity type: ${operation.entity}`);
    }
  }

  private async processCardOperation(operation: QueuedOperation) {
    // Import content service dynamically
    const { default: api } = await import('../api/client');
    
    switch (operation.type) {
      case 'CREATE':
        await api.post('/cards', operation.data);
        break;
      case 'UPDATE':
        await api.put(`/cards/${operation.data.id}`, operation.data);
        break;
      case 'DELETE':
        await api.delete(`/cards/${operation.data.id}`);
        break;
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  private async processDeckOperation(operation: QueuedOperation) {
    const { default: api } = await import('../api/client');
    
    switch (operation.type) {
      case 'CREATE':
        await api.post('/decks', operation.data);
        break;
      case 'UPDATE':
        await api.put(`/decks/${operation.data.id}`, operation.data);
        break;
      case 'DELETE':
        await api.delete(`/decks/${operation.data.id}`);
        break;
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  private async processCategoryOperation(operation: QueuedOperation) {
    const { default: api } = await import('../api/client');
    
    switch (operation.type) {
      case 'CREATE':
        await api.post('/categories', operation.data);
        break;
      case 'UPDATE':
        await api.put(`/categories/${operation.data.id}`, operation.data);
        break;
      case 'DELETE':
        await api.delete(`/categories/${operation.data.id}`);
        break;
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  private async processReviewOperation(operation: QueuedOperation) {
    const { default: api } = await import('../api/client');
    
    if (operation.type === 'CREATE') {
      await api.post('/learning/review', {
        cardId: operation.data.cardId,
        rating: operation.data.rating,
        timeSpent: operation.data.timeSpent || 0,
      });
    } else {
      throw new Error(`Unknown review operation type: ${operation.type}`);
    }
  }

  private async processUserOperation(operation: QueuedOperation) {
    const { default: api } = await import('../api/client');
    
    switch (operation.type) {
      case 'UPDATE':
        await api.put('/user/profile', operation.data);
        break;
      default:
        throw new Error(`Unknown user operation type: ${operation.type}`);
    }
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  async getQueuedOperations(): Promise<QueuedOperation[]> {
    return [...this.queue];
  }

  async clearQueue() {
    this.queue = [];
    await this.saveQueue();
    console.log('Offline queue cleared');
  }

  async removeFromQueue(operationId: string) {
    this.queue = this.queue.filter(item => item.id !== operationId);
    await this.saveQueue();
  }

  async retryFailedOperations() {
    // Reset retry count for all items and try again
    this.queue.forEach(item => {
      item.retries = 0;
    });
    await this.saveQueue();
    await this.processQueue();
  }

  getQueueStatus(): {
    queueSize: number;
    isProcessing: boolean;
    oldestItem: Date | null;
  } {
    return {
      queueSize: this.queue.length,
      isProcessing: this.isProcessing,
      oldestItem: this.queue.length > 0 
        ? new Date(Math.min(...this.queue.map(item => item.timestamp)))
        : null,
    };
  }

  destroy() {
    // Clean up intervals and listeners
    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
    }
    
    if (this.networkUnsubscribe) {
      this.networkUnsubscribe();
      this.networkUnsubscribe = null;
    }
  }
}

// Create and export singleton instance
export const offlineQueue = new OfflineQueueService();

// Also export the class for testing purposes
export { OfflineQueueService };