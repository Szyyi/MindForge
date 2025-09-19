// App.tsx - Complete MindForge App Entry Point
import React, { useEffect, useState } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { LinearGradient } from 'expo-linear-gradient';

// Store imports
import { store, persistor } from './src/store';

// Navigation imports
import RootNavigator from './src/navigation/RootNavigator';

// Theme imports
import colors from './src/theme';

// Keep splash screen visible while loading resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts (uncomment when you add Montserrat fonts to assets/fonts/)
        await Font.loadAsync({
          // Montserrat fonts for premium look
          // 'Montserrat-Thin': require('./assets/fonts/Montserrat-Thin.ttf'),
          // 'Montserrat-Light': require('./assets/fonts/Montserrat-Light.ttf'),
           'Montserrat-Regular': require('./assets/fonts/Montserrat-Regular.ttf'),
           'Montserrat-Medium': require('./assets/fonts/Montserrat-Medium.ttf'),
           'Montserrat-SemiBold': require('./assets/fonts/Montserrat-SemiBold.ttf'),
           'Montserrat-Bold': require('./assets/fonts/Montserrat-Bold.ttf'),
          // 'Montserrat-Black': require('./assets/fonts/Montserrat-Black.ttf'),
          
          // Icon fonts (if using Ionicons)
          'Ionicons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
        });

        // Simulate any other loading tasks
        await new Promise(resolve => setTimeout(resolve, 1000)); // Premium feel delay
        
      } catch (e) {
        console.warn('Error loading resources:', e);
      } finally {
        // Tell the app to render
        setAppIsReady(true);
        // Hide splash screen
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  // Loading screen while resources load
  if (!appIsReady) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[colors.colors.background.primary, colors.colors.background.secondary]}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color={colors.colors.text.primary} />
        </LinearGradient>
      </View>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate 
        loading={
          <View style={styles.loadingContainer}>
            <LinearGradient
              colors={[colors.colors.background.primary, colors.colors.background.secondary]}
              style={styles.loadingGradient}
            >
              <ActivityIndicator size="large" color={colors.colors.text.primary} />
            </LinearGradient>
          </View>
        } 
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
                primary: colors.colors.gradients.primary[0],
                background: colors.colors.background.primary,
                card: colors.colors.background.elevated,
                text: colors.colors.text.primary,
                border: colors.colors.glass.border,
                notification: colors.colors.status.info,
              },
              fonts: {
                regular: {
                  fontFamily: 'System',
                  fontWeight: '400',
                },
                medium: {
                  fontFamily: 'System',
                  fontWeight: '500',
                },
                bold: {
                  fontFamily: 'System',
                  fontWeight: '700',
                },
                heavy: {
                  fontFamily: 'System',
                  fontWeight: '900',
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