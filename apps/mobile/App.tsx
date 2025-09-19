// App.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { 
  StatusBar, 
  View, 
  StyleSheet, 
  AppState, 
  AppStateStatus,
  LogBox 
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Audio } from 'expo-av';

// Store imports
import { store, persistor } from './src/store';
import { initializeApp, cleanupApp } from './src/store/initializeApp';
import syncService from './src/services/api/sync';

// Navigation imports
import RootNavigator from './src/navigation/RootNavigator';

// Screen imports
import CustomSplashScreen from './src/screens/SplashScreen';

// Theme imports
import { colors } from './src/theme/colors';

// Ignore specific warnings in development
if (__DEV__) {
  LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
    'VirtualizedLists should never be nested',
  ]);
}

// Keep native splash screen visible while loading resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const [minimumLoadTime, setMinimumLoadTime] = useState(false);

  // Configure audio for video playback
  const configureAudio = useCallback(async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.warn('Error configuring audio:', error);
    }
  }, []);

  // Load fonts
  const loadFonts = useCallback(async () => {
    try {
      await Font.loadAsync({
        'Montserrat-Regular': require('./assets/fonts/Montserrat-Regular.ttf'),
        'Montserrat-Medium': require('./assets/fonts/Montserrat-Medium.ttf'),
        'Montserrat-SemiBold': require('./assets/fonts/Montserrat-SemiBold.ttf'),
        'Montserrat-Bold': require('./assets/fonts/Montserrat-Bold.ttf'),
        'Ionicons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
      });
      setFontLoaded(true);
    } catch (e) {
      console.warn('Error loading fonts:', e);
      setFontLoaded(true); // Continue anyway
    }
  }, []);

  useEffect(() => {
    let appStateSubscription: any;
    let minimumTimer: NodeJS.Timeout;

    async function prepare() {
      try {
        // Configure audio for video
        await configureAudio();

        // Load fonts first
        await loadFonts();

        // Initialize app services and load data
        await initializeApp();

        // Set minimum display time for splash screen (3 seconds)
        minimumTimer = setTimeout(() => {
          setMinimumLoadTime(true);
        }, 3000);

        // Mark app as ready
        setAppIsReady(true);
        
        // Hide native splash screen immediately to show custom video splash
        await SplashScreen.hideAsync();
        
      } catch (e) {
        console.warn('Error during app initialization:', e);
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();

    // Handle app state changes
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        // App going to background - save any pending data
        cleanupApp().catch(console.error);
      } else if (nextAppState === 'active' && appIsReady && !showCustomSplash) {
        // App coming to foreground - check for updates
        syncService.syncData().catch(console.error);
      }
    };

    appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup on unmount
    return () => {
      if (appStateSubscription) {
        appStateSubscription.remove();
      }
      if (minimumTimer) {
        clearTimeout(minimumTimer);
      }
      cleanupApp().catch(console.error);
    };
  }, [loadFonts, configureAudio, appIsReady, showCustomSplash]);

  // Hide custom splash screen when everything is ready
  useEffect(() => {
    if (appIsReady && fontLoaded && minimumLoadTime) {
      // Add a small delay for smooth transition
      setTimeout(() => {
        setShowCustomSplash(false);
      }, 500);
    }
  }, [appIsReady, fontLoaded, minimumLoadTime]);

  // Show custom video splash screen while loading
  if (showCustomSplash) {
    return <CustomSplashScreen />;
  }

  // Show nothing while fonts are still loading (edge case)
  if (!fontLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate 
        loading={null} // No loading screen needed as we handle it above
        persistor={persistor}
      >
        <SafeAreaProvider>
          <StatusBar 
            barStyle="light-content" 
            backgroundColor="transparent" 
            translucent={true}
          />
          <NavigationContainer
            theme={{
              dark: true,
              colors: {
                primary: colors.gradients.primary[0],
                background: colors.background.primary,
                card: colors.background.elevated,
                text: colors.text.primary,
                border: colors.glass.border,
                notification: colors.status.info,
              },
              fonts: {
                regular: {
                  fontFamily: 'Montserrat-Regular',
                  fontWeight: '400' as const,
                },
                medium: {
                  fontFamily: 'Montserrat-Medium',
                  fontWeight: '500' as const,
                },
                bold: {
                  fontFamily: 'Montserrat-Bold',
                  fontWeight: '700' as const,
                },
                heavy: {
                  fontFamily: 'Montserrat-Bold',
                  fontWeight: '900' as const,
                },
              },
            }}
          >
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});