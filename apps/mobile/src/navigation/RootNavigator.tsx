// ============================================
// src/navigation/RootNavigator.tsx
// ============================================
import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import AuthStack from './AuthStack';
import AppTabs from './AppTabs';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const { hasCompletedOnboarding } = useSelector((state: RootState) => state.user);

  // Show splash screen while checking auth status
  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'fade',
      }}
    >
      {!isAuthenticated ? (
        <>
          {!hasCompletedOnboarding && (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          )}
          <Stack.Screen name="Auth" component={AuthStack} />
        </>
      ) : (
        <Stack.Screen name="Main" component={AppTabs} />
      )}
    </Stack.Navigator>
  );
}