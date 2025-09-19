// src/navigation/ContentStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import the new content screens
import AddContentScreen from '../screens/content/AddContentScreen';
import ContentDetails from '../screens/content/ContentDetails';
import ContentLibrary from '../screens/content/ContentLibrary';

// Import learning screens that connect to content
import CategorySelectScreen from '../screens/learning/CategorySelect';
import ReviewSessionScreen from '../screens/learning/ReviewSession';
import ResultScreen from '../screens/learning/ResultsScreen';

export type ContentStackParamList = {
  AddContentScreen: undefined;
  ContentDetails: { contentId: string; source?: string };
  ContentLibrary: undefined;
  CategorySelection: undefined;
  ReviewSession: { contentId?: string; categoryId?: string };
  ResultScreen: { stats: any };
};

const Stack = createNativeStackNavigator<ContentStackParamList>();

export default function ContentStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="ContentLibrary" component={ContentLibrary} />
      <Stack.Screen name="AddContentScreen" component={AddContentScreen} />
      <Stack.Screen name="ContentDetails" component={ContentDetails} />
      <Stack.Screen name="CategorySelection" component={CategorySelectScreen} />
      <Stack.Screen name="ReviewSession" component={ReviewSessionScreen} />
      <Stack.Screen name="ResultScreen" component={ResultScreen} />
    </Stack.Navigator>
  );
}