// ============================================
// src/services/api/sync.ts
// ============================================
import api from './client';
import { Card, Deck, Category } from '../../types/card_types';
import { ReviewHistory } from '../../types/review_types';
import { sqliteDb } from '../storage/sqliteDb';
import { offlineQueue } from '../storage/offlineQueue';
import { storageService } from '../storage/asyncStorage';
import NetInfo from '@react-native-community/netinfo';

// Sync types
interface SyncData {
  cards: Card[];
  decks: Deck[];
  categories: Category[];
  reviews: ReviewHistory[];
  lastSyncedAt: Date;
}

interface SyncResult {
  success: boolean;
  uploaded: {
    cards: number;
    decks: number;
    categories: number;
    reviews: number;
  };
  downloaded: {
    cards: number;
    decks: number;
    categories: number;
    reviews: number;
  };
  conflicts: ConflictItem[];
  lastSyncedAt: Date;
  errors: string[];
}

interface ConflictItem {
  id: string;
  type: 'card' | 'deck' | 'category' | 'review';
  localVersion: any;
  serverVersion: any;
  resolution?: 'local' | 'server' | 'merge';
}

interface SyncStatus {
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  pendingChanges: number;
  syncError: string | null;
  syncProgress: number;
}

interface DeltaSyncRequest {
  lastSyncedAt: Date;
  changes: {
    cards: Partial<Card>[];
    decks: Partial<Deck>[];
    categories: Partial<Category>[];
    reviews: ReviewHistory[];
  };
  deletions: {
    cards: string[];
    decks: string[];
    categories: string[];
  };
}

interface DeltaSyncResponse {
  changes: {
    cards: Card[];
    decks: Deck[];
    categories: Category[];
    reviews: ReviewHistory[];
  };
  deletions: {
    cards: string[];
    decks: string[];
    categories: string[];
  };
  serverTime: Date;
  conflicts: ConflictItem[];
}

// Conflict resolution strategies
enum ConflictResolution {
  LOCAL_WINS = 'local',
  SERVER_WINS = 'server',
  MERGE = 'merge',
  MANUAL = 'manual',
}

// Sync Service Class
class SyncService {
  private isSyncing: boolean = false;
  private syncListeners: ((status: SyncStatus) => void)[] = [];
  private conflictResolutionStrategy: ConflictResolution = ConflictResolution.SERVER_WINS;
  private syncInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize sync service
   */
  async initialize() {
    // Initialize offline queue
    await offlineQueue.initialize();
    
    // Start auto-sync if enabled
    const settings = await storageService.getAppSettings();
    if ((settings as any)?.autoSync) {
      this.startAutoSync();
    }
    
    // Listen for network changes
    this.setupNetworkListener();
  }

  /**
   * Setup network listener for auto-sync
   */
  private setupNetworkListener() {
    NetInfo.addEventListener(async (state) => {
      if (state.isConnected && !this.isSyncing) {
        const queueSize = offlineQueue.getQueueSize();
        if (queueSize > 0) {
          console.log(`Network connected, syncing ${queueSize} pending operations`);
          await this.syncData();
        }
      }
    });
  }

  /**
   * Start auto-sync interval
   */
  startAutoSync(intervalMinutes: number = 5) {
    this.stopAutoSync();
    
    this.syncInterval = setInterval(async () => {
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected && !this.isSyncing) {
        await this.syncData();
      }
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Stop auto-sync
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Main sync function
   */
  async syncData(): Promise<SyncResult> {
    if (this.isSyncing) {
      throw new Error('Sync already in progress');
    }

    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      throw new Error('No internet connection');
    }

    this.isSyncing = true;
    this.notifyListeners({ 
      isSyncing: true, 
      lastSyncedAt: null, 
      pendingChanges: 0, 
      syncError: null,
      syncProgress: 0,
    });

    try {
      // Process offline queue first
      await offlineQueue.processQueue();
      
      // Get last sync time
      const lastSyncedAt = await storageService.getLastSyncTime();
      
      let result: SyncResult;
      
      if (lastSyncedAt) {
        // Delta sync
        result = await this.deltaSync(lastSyncedAt);
      } else {
        // Full sync
        result = await this.fullSync();
      }
      
      // Update last sync time
      await storageService.setLastSyncTime(result.lastSyncedAt);
      
      this.notifyListeners({ 
        isSyncing: false, 
        lastSyncedAt: result.lastSyncedAt, 
        pendingChanges: 0, 
        syncError: null,
        syncProgress: 100,
      });
      
      return result;
    } catch (error: any) {
      console.error('Sync error:', error);
      
      this.notifyListeners({ 
        isSyncing: false, 
        lastSyncedAt: await storageService.getLastSyncTime(), 
        pendingChanges: offlineQueue.getQueueSize(), 
        syncError: error.message,
        syncProgress: 0,
      });
      
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Perform delta sync (incremental)
   */
  private async deltaSync(lastSyncedAt: Date): Promise<SyncResult> {
    try {
      // Get local changes since last sync
      const unsyncedData = await sqliteDb.getUnsyncedData();
      
      // Prepare delta sync request
      const request: DeltaSyncRequest = {
        lastSyncedAt,
        changes: {
          cards: unsyncedData.cards || [],
          decks: unsyncedData.decks || [],
          categories: unsyncedData.categories || [],
          reviews: unsyncedData.reviews || [],
        },
        deletions: {
          cards: [], // TODO: Track deletions
          decks: [],
          categories: [],
        },
      };

      this.notifyListeners({ 
        isSyncing: true, 
        lastSyncedAt: null, 
        pendingChanges: 0, 
        syncError: null,
        syncProgress: 50,
      });

      // Send to server
      const response = await api.post<DeltaSyncResponse>('/sync/delta', request);
      
      // Handle conflicts
      const resolvedConflicts = await this.resolveConflicts(response.conflicts);
      
      // Apply server changes
      await this.applyServerChanges(response.changes);
      
      // Apply deletions
      await this.applyDeletions(response.deletions);
      
      // Mark local data as synced
      await this.markDataAsSynced(unsyncedData);
      
      return {
        success: true,
        uploaded: {
          cards: unsyncedData.cards?.length || 0,
          decks: unsyncedData.decks?.length || 0,
          categories: unsyncedData.categories?.length || 0,
          reviews: unsyncedData.reviews?.length || 0,
        },
        downloaded: {
          cards: response.changes.cards.length,
          decks: response.changes.decks.length,
          categories: response.changes.categories.length,
          reviews: response.changes.reviews.length,
        },
        conflicts: resolvedConflicts,
        lastSyncedAt: response.serverTime,
        errors: [],
      };
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Perform full sync
   */
  private async fullSync(): Promise<SyncResult> {
    try {
      this.notifyListeners({ 
        isSyncing: true, 
        lastSyncedAt: null, 
        pendingChanges: 0, 
        syncError: null,
        syncProgress: 25,
      });

      // Upload all local data
      const localData = await this.getAllLocalData();
      
      const uploadResponse = await api.post<{ success: boolean; conflicts: ConflictItem[] }>(
        '/sync/upload',
        localData
      );

      this.notifyListeners({ 
        isSyncing: true, 
        lastSyncedAt: null, 
        pendingChanges: 0, 
        syncError: null,
        syncProgress: 50,
      });

      // Download all server data
      const downloadResponse = await api.get<SyncData>('/sync/download');
      
      this.notifyListeners({ 
        isSyncing: true, 
        lastSyncedAt: null, 
        pendingChanges: 0, 
        syncError: null,
        syncProgress: 75,
      });

      // Replace local data with server data
      await this.replaceLocalData(downloadResponse);
      
      return {
        success: true,
        uploaded: {
          cards: localData.cards.length,
          decks: localData.decks.length,
          categories: localData.categories.length,
          reviews: localData.reviews.length,
        },
        downloaded: {
          cards: downloadResponse.cards.length,
          decks: downloadResponse.decks.length,
          categories: downloadResponse.categories.length,
          reviews: downloadResponse.reviews.length,
        },
        conflicts: uploadResponse.conflicts || [],
        lastSyncedAt: downloadResponse.lastSyncedAt,
        errors: [],
      };
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Resolve conflicts between local and server data
   */
  async resolveConflicts(conflicts: ConflictItem[]): Promise<ConflictItem[]> {
    if (conflicts.length === 0) {
      return [];
    }

    const resolved: ConflictItem[] = [];

    for (const conflict of conflicts) {
      let resolution: 'local' | 'server' | 'merge';

      switch (this.conflictResolutionStrategy) {
        case ConflictResolution.LOCAL_WINS:
          resolution = 'local';
          break;
        
        case ConflictResolution.SERVER_WINS:
          resolution = 'server';
          break;
        
        case ConflictResolution.MERGE:
          resolution = await this.mergeConflict(conflict);
          break;
        
        case ConflictResolution.MANUAL:
          // TODO: Implement manual conflict resolution UI
          resolution = 'server'; // Default to server for now
          break;
        
        default:
          resolution = 'server';
      }

      conflict.resolution = resolution;
      resolved.push(conflict);

      // Apply resolution
      await this.applyConflictResolution(conflict);
    }

    return resolved;
  }

  /**
   * Merge conflict (smart resolution)
   */
  private async mergeConflict(conflict: ConflictItem): Promise<'local' | 'server' | 'merge'> {
    // Compare timestamps
    const localTime = new Date(conflict.localVersion.updatedAt).getTime();
    const serverTime = new Date(conflict.serverVersion.updatedAt).getTime();

    // If server is newer, use server
    if (serverTime > localTime) {
      return 'server';
    }
    
    // If local is newer, use local
    if (localTime > serverTime) {
      return 'local';
    }

    // If same time, prefer server for consistency
    return 'server';
  }

  /**
   * Apply conflict resolution
   */
  private async applyConflictResolution(conflict: ConflictItem) {
    switch (conflict.resolution) {
      case 'local':
        // Upload local version to server
        await this.uploadChanges([conflict.localVersion]);
        break;
      
      case 'server':
        // Replace local with server version
        await this.applyServerChanges({ 
          [conflict.type + 's']: [conflict.serverVersion] 
        } as any);
        break;
      
      case 'merge':
        // TODO: Implement merge logic
        break;
    }
  }

  /**
   * Upload local changes to server
   */
  async uploadChanges(changes: any[]): Promise<void> {
    try {
      await api.post('/sync/changes', { changes });
    } catch (error: any) {
      console.error('Upload changes error:', error);
      throw error;
    }
  }

  /**
   * Download server changes
   */
  async downloadChanges(since?: Date): Promise<SyncData> {
    try {
      const params = since ? { since: since.toISOString() } : {};
      const response = await api.get<SyncData>('/sync/changes', { params });
      return response;
    } catch (error: any) {
      console.error('Download changes error:', error);
      throw error;
    }
  }

  /**
   * Apply server changes to local database
   */
  private async applyServerChanges(changes: {
    cards: Card[];
    decks: Deck[];
    categories: Category[];
    reviews: ReviewHistory[];
  }) {
    // Save cards
    for (const card of changes.cards || []) {
      await sqliteDb.saveCard(card);
    }

    // Save categories
    for (const category of changes.categories || []) {
      await sqliteDb.saveCategory(category);
    }

    // Save reviews
    for (const review of changes.reviews || []) {
      await sqliteDb.saveReview(review);
    }

    // Note: Decks are not in SQLite schema yet
  }

  /**
   * Apply deletions from server
   */
  private async applyDeletions(deletions: {
    cards: string[];
    decks: string[];
    categories: string[];
  }) {
    // TODO: Implement deletion in SQLite
    console.log('Applying deletions:', deletions);
  }

  /**
   * Mark local data as synced
   */
  private async markDataAsSynced(data: any) {
    if (data.cards?.length > 0) {
      await sqliteDb.markAsSynced('cards', data.cards.map((c: any) => c.id));
    }
    
    if (data.categories?.length > 0) {
      await sqliteDb.markAsSynced('categories', data.categories.map((c: any) => c.id));
    }
    
    if (data.reviews?.length > 0) {
      await sqliteDb.markAsSynced('reviews', data.reviews.map((r: any) => r.id));
    }
  }

  /**
   * Get all local data for full sync
   */
  private async getAllLocalData(): Promise<SyncData> {
    const cards = await sqliteDb.getCards();
    const categories = await sqliteDb.getCategories();
    
    return {
      cards,
      decks: [], // TODO: Add decks to SQLite
      categories,
      reviews: [], // TODO: Get all reviews
      lastSyncedAt: new Date(),
    };
  }

  /**
   * Replace all local data with server data
   */
  private async replaceLocalData(data: SyncData) {
    // Clear existing data
    await sqliteDb.clearAllData();
    
    // Insert new data
    await this.applyServerChanges({
      cards: data.cards,
      decks: data.decks,
      categories: data.categories,
      reviews: data.reviews,
    });
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    const lastSyncedAt = await storageService.getLastSyncTime();
    const pendingChanges = offlineQueue.getQueueSize();
    
    return {
      isSyncing: this.isSyncing,
      lastSyncedAt,
      pendingChanges,
      syncError: null,
      syncProgress: this.isSyncing ? 50 : 100,
    };
  }

  /**
   * Force sync (bypass checks)
   */
  async forceSync(): Promise<SyncResult> {
    // Clear sync status
    await storageService.remove('@mindforge/last_sync');
    
    // Perform full sync
    return this.syncData();
  }

  /**
   * Reset sync (clear all local data and re-download)
   */
  async resetSync(): Promise<void> {
    try {
      // Clear all local data
      await sqliteDb.clearAllData();
      await storageService.clear();
      await offlineQueue.clearQueue();
      
      // Re-download everything
      await this.fullSync();
    } catch (error: any) {
      console.error('Reset sync error:', error);
      throw error;
    }
  }

  /**
   * Set conflict resolution strategy
   */
  setConflictResolution(strategy: ConflictResolution) {
    this.conflictResolutionStrategy = strategy;
  }

  /**
   * Add sync status listener
   */
  addSyncListener(listener: (status: SyncStatus) => void) {
    this.syncListeners.push(listener);
  }

  /**
   * Remove sync status listener
   */
  removeSyncListener(listener: (status: SyncStatus) => void) {
    this.syncListeners = this.syncListeners.filter(l => l !== listener);
  }

  /**
   * Notify all listeners of sync status
   */
  private notifyListeners(status: SyncStatus) {
    this.syncListeners.forEach(listener => listener(status));
  }

  /**
   * Export data for backup
   */
  async exportData(format: 'json' | 'sqlite' = 'json'): Promise<string | Blob> {
    try {
      const data = await this.getAllLocalData();
      
      if (format === 'json') {
        return JSON.stringify(data, null, 2);
      } else {
        // TODO: Implement SQLite export
        throw new Error('SQLite export not yet implemented');
      }
    } catch (error: any) {
      console.error('Export data error:', error);
      throw error;
    }
  }

  /**
   * Import data from backup
   */
  async importData(data: string | Blob, format: 'json' | 'sqlite' = 'json'): Promise<void> {
    try {
      if (format === 'json') {
        const parsed = JSON.parse(data as string) as SyncData;
        await this.replaceLocalData(parsed);
      } else {
        // TODO: Implement SQLite import
        throw new Error('SQLite import not yet implemented');
      }
    } catch (error: any) {
      console.error('Import data error:', error);
      throw error;
    }
  }

  /**
   * Get last sync time
   */
  async getLastSyncTime(): Promise<Date | null> {
    return storageService.getLastSyncTime();
  }

  /**
   * Clear all sync data and queues
   */
  async clearSyncData(): Promise<void> {
    await offlineQueue.clearQueue();
    await storageService.remove('@mindforge/last_sync');
  }
}

// Create singleton instance
const syncService = new SyncService();

// Export singleton
export default syncService;