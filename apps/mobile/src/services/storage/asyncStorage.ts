// ============================================
// src/services/storage/asyncStorage.ts
// ============================================
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  USER_PREFERENCES: '@mindforge/user_preferences',
  SESSION_DATA: '@mindforge/session_data',
  ONBOARDING_COMPLETE: '@mindforge/onboarding_complete',
  LAST_SYNC: '@mindforge/last_sync',
  OFFLINE_QUEUE: '@mindforge/offline_queue',
  CACHED_CARDS: '@mindforge/cached_cards',
  REVIEW_HISTORY: '@mindforge/review_history',
  STUDY_STREAK: '@mindforge/study_streak',
  APP_SETTINGS: '@mindforge/app_settings',
  NOTIFICATION_SETTINGS: '@mindforge/notification_settings',
  LEARNING_STATS: '@mindforge/learning_stats',
  LAST_LOGIN_AT: '@mindforge/last_login_at',
  NEEDS_ONBOARDING: '@mindforge/needs_onboarding',
} as const;

class StorageService {
  // Generic methods
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      return false;
    }
  }

  async remove(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      return false;
    }
  }

  async clear(): Promise<boolean> {
    try {
      // Get all keys
      const keys = await AsyncStorage.getAllKeys();
      
      // Filter MindForge keys only (to avoid clearing other app data)
      const mindforgeKeys = keys.filter(key => key.startsWith('@mindforge/'));
      
      // Clear MindForge data
      if (mindforgeKeys.length > 0) {
        await AsyncStorage.multiRemove(mindforgeKeys);
      }
      
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  // User preferences
  async getUserPreferences(): Promise<any> {
    return this.get(STORAGE_KEYS.USER_PREFERENCES);
  }

  async setUserPreferences(preferences: any): Promise<boolean> {
    return this.set(STORAGE_KEYS.USER_PREFERENCES, preferences);
  }

  // Session management
  async getSessionData(): Promise<any> {
    return this.get(STORAGE_KEYS.SESSION_DATA);
  }

  async setSessionData(data: any): Promise<boolean> {
    return this.set(STORAGE_KEYS.SESSION_DATA, data);
  }

  async clearSessionData(): Promise<boolean> {
    return this.remove(STORAGE_KEYS.SESSION_DATA);
  }

  // Onboarding
  async isOnboardingComplete(): Promise<boolean> {
    const value = await this.get<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETE);
    return value || false;
  }

  async setOnboardingComplete(): Promise<boolean> {
    return this.set(STORAGE_KEYS.ONBOARDING_COMPLETE, true);
  }

  // Sync management
  async getLastSyncTime(): Promise<Date | null> {
    const value = await this.get<string>(STORAGE_KEYS.LAST_SYNC);
    return value ? new Date(value) : null;
  }

  async setLastSyncTime(date: Date): Promise<boolean> {
    return this.set(STORAGE_KEYS.LAST_SYNC, date.toISOString());
  }

  // Cache management
  async getCachedCards(categoryId?: string): Promise<any> {
    const key = categoryId 
      ? `${STORAGE_KEYS.CACHED_CARDS}_${categoryId}`
      : STORAGE_KEYS.CACHED_CARDS;
    return this.get(key);
  }

  async setCachedCards(cards: any[], categoryId?: string): Promise<boolean> {
    const key = categoryId 
      ? `${STORAGE_KEYS.CACHED_CARDS}_${categoryId}`
      : STORAGE_KEYS.CACHED_CARDS;
    return this.set(key, cards);
  }

  // Review history
  async getReviewHistory(): Promise<any[]> {
    const history = await this.get<any[]>(STORAGE_KEYS.REVIEW_HISTORY);
    return history || [];
  }

  async addToReviewHistory(review: any): Promise<boolean> {
    const history = await this.getReviewHistory();
    history.push(review);
    // Keep only last 100 reviews
    const trimmedHistory = history.slice(-100);
    return this.set(STORAGE_KEYS.REVIEW_HISTORY, trimmedHistory);
  }

  // Study streak
  async getStudyStreak(): Promise<number> {
    const value = await this.get<number>(STORAGE_KEYS.STUDY_STREAK);
    return value || 0;
  }

  async updateStudyStreak(streak: number): Promise<boolean> {
    return this.set(STORAGE_KEYS.STUDY_STREAK, streak);
  }

  // App settings
  async getAppSettings(): Promise<any> {
    return this.get(STORAGE_KEYS.APP_SETTINGS);
  }

  async updateAppSettings(settings: any): Promise<boolean> {
    const current = await this.getAppSettings() || {};
    return this.set(STORAGE_KEYS.APP_SETTINGS, { ...current, ...settings });
  }

  // Notification settings
  async getNotificationSettings(): Promise<any> {
    return this.get(STORAGE_KEYS.NOTIFICATION_SETTINGS);
  }

  async setNotificationSettings(settings: any): Promise<boolean> {
    return this.set(STORAGE_KEYS.NOTIFICATION_SETTINGS, settings);
  }

  // Learning stats cache
  async getLearningStats(): Promise<any> {
    return this.get(STORAGE_KEYS.LEARNING_STATS);
  }

  async setLearningStats(stats: any): Promise<boolean> {
    return this.set(STORAGE_KEYS.LEARNING_STATS, stats);
  }

  // Multiple operations
  async multiGet(keys: string[]): Promise<Record<string, any>> {
    try {
      const result = await AsyncStorage.multiGet(keys);
      return result.reduce((acc, [key, value]) => {
        acc[key] = value ? JSON.parse(value) : null;
        return acc;
      }, {} as Record<string, any>);
    } catch (error) {
      console.error('Error in multiGet:', error);
      return {};
    }
  }

  async multiSet(keyValuePairs: Array<[string, any]>): Promise<boolean> {
    try {
      const pairs = keyValuePairs.map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]) as Array<[string, string]>;
      
      await AsyncStorage.multiSet(pairs);
      return true;
    } catch (error) {
      console.error('Error in multiSet:', error);
      return false;
    }
  }

  async multiRemove(keys: string[]): Promise<boolean> {
    try {
      await AsyncStorage.multiRemove(keys);
      return true;
    } catch (error) {
      console.error('Error in multiRemove:', error);
      return false;
    }
  }

  // Storage info
  async getStorageInfo(): Promise<{
    totalKeys: number;
    storageSize: number;
    keys: string[];
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const mindforgeKeys = keys.filter(key => key.startsWith('@mindforge/'));
      
      // Calculate approximate storage size
      let totalSize = 0;
      for (const key of mindforgeKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      
      return {
        totalKeys: mindforgeKeys.length,
        storageSize: totalSize,
        keys: mindforgeKeys,
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        totalKeys: 0,
        storageSize: 0,
        keys: [],
      };
    }
  }

  // Debug methods (only in development)
  async debugPrintAll(): Promise<void> {
    if (__DEV__) {
      const info = await this.getStorageInfo();
      console.log('=== MindForge Storage Debug ===');
      console.log(`Total Keys: ${info.totalKeys}`);
      console.log(`Storage Size: ${info.storageSize} bytes`);
      
      for (const key of info.keys) {
        const value = await this.get(key);
        console.log(`${key}:`, value);
      }
      console.log('===============================');
    }
  }

  // Migration utilities
  async migrateData(migrations: Array<{
    version: number;
    migrate: () => Promise<void>;
  }>): Promise<void> {
    const currentVersion = await this.get<number>('@mindforge/data_version') || 0;
    
    for (const migration of migrations) {
      if (migration.version > currentVersion) {
        console.log(`Running migration v${migration.version}...`);
        await migration.migrate();
        await this.set('@mindforge/data_version', migration.version);
      }
    }
  }
}

// Create and export singleton instance
export const storageService = new StorageService();

// Export storage keys for use in other modules
export { STORAGE_KEYS };

// Also export the class for testing purposes
export { StorageService };