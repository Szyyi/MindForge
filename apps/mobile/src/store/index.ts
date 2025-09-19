// ============================================
// src/store/index.ts (Complete store configuration)
// ============================================
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';

import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import cardsReducer from './slices/cardSlice';
import reviewReducer from './slices/reviewSlice';
import contentReducer from './slices/contentSlice';
import learningReducer from './slices/learningSlice';
import syncReducer from './slices/syncSlice';
import uiReducer from './slices/uiSlice';

const rootPersistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'user', 'ui'], // Only persist these slices
  blacklist: ['sync'], // Don't persist sync state
};

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  cards: cardsReducer,
  review: reviewReducer,
  content: contentReducer,
  learning: learningReducer,
  sync: syncReducer,
  ui: uiReducer,
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);



export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
        ],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;