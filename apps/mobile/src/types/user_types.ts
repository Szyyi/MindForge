
// ============================================
// src/types/user.types.ts
// ============================================
export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  subscription: SubscriptionTier;
  stats: UserStats;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStats {
  streak: number;
  totalReviews: number;
  cardsLearned: number;
  minutesStudied: number;
  retentionRate: number;
  level: number;
  xp: number;
}

export interface UserPreferences {
  dailyGoal: number;
  notificationTime: string;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  theme: 'dark' | 'light' | 'auto';
}

export enum SubscriptionTier {
  FREE = 'free',
  PRO = 'pro',
  PREMIUM = 'premium',
}