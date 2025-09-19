// src/navigation/MainStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import tab navigator
import AppTabs from './AppTabs';

// Import content screens
import AddContentScreen from '../screens/content/AddContentScreen';
import ContentDetails from '../screens/content/ContentDetails';
import ContentLibrary from '../screens/content/ContentLibrary';

// Import learning screens
import CategorySelectScreen from '../screens/learning/CategorySelect';
import ReviewSessionScreen from '../screens/learning/ReviewSession';
import ResultScreen from '../screens/learning/ResultsScreen';

// Import review screens
import ReviewScreen from '../screens/review/ReviewScreen';
import DailyReviewScreen from '../screens/home/DailyReviewScreen';

// Import profile screens
import SettingsScreen from '../screens/profile/SettingsScreen';
import SubscriptionScreen from '../screens/profile/SubscriptionScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

export type MainStackParamList = {
  AppTabs: undefined;
  // Content screens
  AddContentScreen: undefined;
  ContentDetails: { contentId: string; source?: string };
  ContentLibrary: undefined;
  // Learning screens
  CategorySelection: undefined;
  ReviewSession: { contentId?: string; categoryId?: string; categories?: string[] };
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
  // Review screens
  Review: { categoryId?: string };
  DailyReview: undefined;
  // Profile screens
  Settings: undefined;
  Subscription: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Main tab navigator */}
      <Stack.Screen 
        name="AppTabs" 
        component={AppTabs} 
        options={{ animation: 'fade' }}
      />
      
      {/* Content Management Screens */}
      <Stack.Screen 
        name="AddContentScreen" 
        component={AddContentScreen} 
      />
      <Stack.Screen 
        name="ContentDetails" 
        component={ContentDetails} 
      />
      <Stack.Screen 
        name="ContentLibrary" 
        component={ContentLibrary} 
      />
      
      {/* Learning & Review Screens */}
      <Stack.Screen 
        name="CategorySelection" 
        component={CategorySelectScreen} 
      />
      <Stack.Screen 
        name="ReviewSession" 
        component={ReviewSessionScreen} 
      />
      <Stack.Screen 
        name="Review" 
        component={ReviewScreen} 
      />
      <Stack.Screen 
        name="DailyReview" 
        component={DailyReviewScreen} 
      />
      <Stack.Screen 
        name="ResultScreen" 
        component={ResultScreen} 
      />
      
      {/* Profile & Settings Screens */}
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
      />
      <Stack.Screen 
        name="Subscription" 
        component={SubscriptionScreen} 
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
      />
    </Stack.Navigator>
  );
}