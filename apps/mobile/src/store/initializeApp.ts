// ============================================
// src/store/initializeApp.ts
// ============================================
import { store } from './index';
import { checkAuthStatusAsync } from './slices/authSlice';
import { loadUIPreferencesAsync } from './slices/uiSlice';
import { fetchCategoriesAsync, loadLocalCardsAsync } from './slices/cardSlice';
import { fetchUserProfileAsync } from './slices/userSlice';
import { getSyncStatusAsync } from './slices/syncSlice';
import syncService from '../services/api/sync';
import { sqliteDb } from '../services/storage/sqliteDb';
import { offlineQueue } from '../services/storage/offlineQueue';
import { storageService } from '../services/storage/asyncStorage';
import NetInfo from '@react-native-community/netinfo';

/**
 * Initialize all app services and load initial data
 */
export const initializeApp = async (): Promise<void> => {
  try {
    console.log('🚀 Initializing MindForge...');
    
    // Step 1: Initialize local storage and database
    console.log('📦 Initializing storage...');
    await sqliteDb.initialize();
    await offlineQueue.initialize();
    
    // Step 2: Check network status
    const netInfo = await NetInfo.fetch();
    console.log(`🌐 Network status: ${netInfo.isConnected ? 'Online' : 'Offline'}`);
    
    // Step 3: Initialize sync service
    console.log('🔄 Initializing sync service...');
    await syncService.initialize();
    
    // Step 4: Load UI preferences
    console.log('🎨 Loading UI preferences...');
    await store.dispatch(loadUIPreferencesAsync());
    
    // Step 5: Check authentication status
    console.log('🔐 Checking authentication...');
    const authResult = await store.dispatch(checkAuthStatusAsync());
    
    // Step 6: If authenticated, load user data
    if (authResult.meta.requestStatus === 'fulfilled' && (authResult.payload as any)?.isAuthenticated) {
      console.log('👤 Loading user profile...');
      
      // Load user profile
      await store.dispatch(fetchUserProfileAsync());
      
      // Load local cards from SQLite
      console.log('📚 Loading local cards...');
      await store.dispatch(loadLocalCardsAsync());
      
      // Load categories
      console.log('📁 Loading categories...');
      await store.dispatch(fetchCategoriesAsync());
      
      // Check sync status
      console.log('🔄 Checking sync status...');
      await store.dispatch(getSyncStatusAsync());
      
      // If online and has pending changes, trigger sync
      if (netInfo.isConnected) {
        const syncStatus = await syncService.getSyncStatus();
        if (syncStatus.pendingChanges > 0) {
          console.log(`📤 Syncing ${syncStatus.pendingChanges} pending changes...`);
          // Don't await - let it sync in background
          syncService.syncData().catch(error => {
            console.error('Background sync failed:', error);
          });
        }
      }
    }
    
    // Step 7: Check onboarding status
    const hasCompletedOnboarding = await storageService.isOnboardingComplete();
    console.log(`📱 Onboarding completed: ${hasCompletedOnboarding}`);
    
    console.log('✅ MindForge initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing app:', error);
    throw error;
  }
};

/**
 * Clean up resources when app is closing
 */
export const cleanupApp = async (): Promise<void> => {
  try {
    console.log('🧹 Cleaning up MindForge...');
    
    // Stop auto-sync
    syncService.stopAutoSync();
    
    // Process any remaining offline queue items
    const queueSize = offlineQueue.getQueueSize();
    if (queueSize > 0) {
      console.log(`📤 Processing ${queueSize} queued operations...`);
      await offlineQueue.processQueue();
    }
    
    // Close database
    await sqliteDb.close();
    
    // Destroy offline queue
    offlineQueue.destroy();
    
    console.log('✅ Cleanup completed');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
};