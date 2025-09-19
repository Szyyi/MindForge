// src/navigation/AppTabs.tsx
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Import screens
import HomeScreen from '../screens/home/HomeScreen';
import ReviewScreen from '../screens/review/ReviewScreen';
import ContentLibrary from '../screens/content/ContentLibrary'; // Updated to use the new ContentLibrary
import StatsScreen from '../screens/stats/StatsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Fixed imports - use direct imports from theme files
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export type AppTabsParamList = {
  Home: undefined;
  Review: undefined;
  Library: undefined;
  Stats: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<AppTabsParamList>();

type IconName = keyof typeof Ionicons.glyphMap;

export default function AppTabs() {
  const getTabIcon = (route: string, focused: boolean): IconName => {
    switch (route) {
      case 'Home':
        return focused ? 'home' : 'home-outline';
      case 'Review':
        return focused ? 'refresh-circle' : 'refresh-circle-outline';
      case 'Library':
        return focused ? 'library' : 'library-outline';
      case 'Stats':
        return focused ? 'stats-chart' : 'stats-chart-outline';
      case 'Profile':
        return focused ? 'person' : 'person-outline';
      default:
        return 'home-outline';
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
            <View style={styles.tabBarGradient} />
          </BlurView>
        ),
        tabBarActiveTintColor: colors.gradients.primary[0],
        tabBarInactiveTintColor: colors.text.muted,
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = getTabIcon(route.name, focused);
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarButton: (props: any) => {
          const { onPress, ...otherProps } = props;
          return (
            <View
              {...otherProps}
              onTouchEnd={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (onPress) {
                  onPress();
                }
              }}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Review" component={ReviewScreen} />
      <Tab.Screen name="Library" component={ContentLibrary} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    height: Platform.OS === 'ios' ? 90 : 70,
    borderTopWidth: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 25 : 15,
  },
  tabBarGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.glass.medium,
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
  },
});