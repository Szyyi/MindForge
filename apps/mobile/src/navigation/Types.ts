// src/navigation/types.ts
import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';

// Root Stack
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

// Main Stack (includes tabs and all modal/pushed screens)
export type MainStackParamList = {
  AppTabs: NavigatorScreenParams<AppTabsParamList>;
  // Content screens
  AddContentScreen: undefined;
  ContentDetails: { contentId: string; source?: string };
  ContentLibrary: undefined;
  // Learning screens
  CategorySelection: undefined;
  ReviewSession: { contentId?: string; categoryId?: string };
  Review: { categoryId?: string };
  ResultScreen: { 
    stats: {
      totalCards: number;
      completed: number;
      correct: number;
      incorrect: number;
      timeSpent: number;
      accuracy: number;
      streak: number;
      xpEarned: number;
    };
  };
  DailyReview: undefined;
  // Profile screens
  Settings: undefined;
  Subscription: undefined;
};

// App Tabs
export type AppTabsParamList = {
  Home: undefined;
  Review: undefined;
  Library: undefined;
  Stats: undefined;
  Profile: undefined;
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = 
  CompositeScreenProps<
    NativeStackScreenProps<AuthStackParamList, T>,
    RootStackScreenProps<'Auth'>
  >;

export type MainStackScreenProps<T extends keyof MainStackParamList> = 
  CompositeScreenProps<
    NativeStackScreenProps<MainStackParamList, T>,
    RootStackScreenProps<'Main'>
  >;

export type AppTabsScreenProps<T extends keyof AppTabsParamList> = 
  CompositeScreenProps<
    BottomTabScreenProps<AppTabsParamList, T>,
    MainStackScreenProps<'AppTabs'>
  >;

// Helper type for navigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}