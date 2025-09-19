// src/screens/profile/ProfileScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

// Mock user data
const mockUser = {
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  plan: 'PRO',
  joinDate: new Date('2024-09-01'),
  level: 8,
  xp: 3250,
  xpToNext: 750,
};

interface SettingItemProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  value?: string;
  onPress?: () => void;
  hasToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  isDanger?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  value,
  onPress,
  hasToggle,
  toggleValue,
  onToggle,
  isDanger,
}) => {
  return (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={() => {
        if (onPress) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }
      }}
      disabled={hasToggle}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        {icon && (
          <Ionicons 
            name={icon} 
            size={20} 
            color={isDanger ? '#EF4444' : 'rgba(255, 255, 255, 0.5)'} 
            style={styles.settingIcon}
          />
        )}
        <Text style={[
          styles.settingTitle,
          isDanger && styles.settingTitleDanger
        ]}>
          {title}
        </Text>
      </View>
      
      <View style={styles.settingRight}>
        {value && (
          <Text style={styles.settingValue}>{value}</Text>
        )}
        {hasToggle && (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ 
              false: 'rgba(255, 255, 255, 0.1)', 
              true: '#0066FF'
            }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="rgba(255, 255, 255, 0.1)"
          />
        )}
        {onPress && !hasToggle && !value && (
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color="rgba(255, 255, 255, 0.2)" 
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [reminders, setReminders] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  const getMemberDuration = (joinDate: Date) => {
    const months = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return `${months} months`;
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => {
            console.log('Logging out...');
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0A0F']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
          </View>

          {/* User Info Section */}
          <View style={styles.userSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(mockUser.name)}</Text>
              </View>
              {mockUser.plan === 'PRO' && (
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.userName}>{mockUser.name}</Text>
            <Text style={styles.userEmail}>{mockUser.email}</Text>
            
            {/* Level Progress */}
            <View style={styles.levelContainer}>
              <View style={styles.levelHeader}>
                <Text style={styles.levelText}>LEVEL {mockUser.level}</Text>
                <Text style={styles.xpText}>
                  {mockUser.xp} / {mockUser.xp + mockUser.xpToNext} XP
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(mockUser.xp / (mockUser.xp + mockUser.xpToNext)) * 100}%` }
                  ]} 
                />
              </View>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>1,247</Text>
              <Text style={styles.statLabel}>CARDS</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>28</Text>
              <Text style={styles.statLabel}>DECKS</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>15</Text>
              <Text style={styles.statLabel}>STREAK</Text>
            </View>
          </View>

          {/* Settings Sections */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PREFERENCES</Text>
            
            <SettingItem
              icon="notifications-outline"
              title="Daily Reminders"
              hasToggle
              toggleValue={reminders}
              onToggle={setReminders}
            />
            
            <SettingItem
              icon="cloud-offline-outline"
              title="Offline Mode"
              hasToggle
              toggleValue={offlineMode}
              onToggle={setOfflineMode}
            />
            
            <SettingItem
              icon="time-outline"
              title="Study Time"
              value="9:00 AM"
              onPress={() => console.log('Change study time')}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ACCOUNT</Text>
            
            <SettingItem
              icon="diamond-outline"
              title="Subscription"
              value="Pro Plan"
              onPress={() => console.log('Subscription')}
            />
            
            <SettingItem
              icon="calendar-outline"
              title="Member Since"
              value={getMemberDuration(mockUser.joinDate)}
            />
            
            <SettingItem
              icon="shield-checkmark-outline"
              title="Privacy"
              onPress={() => console.log('Privacy')}
            />
            
            <SettingItem
              icon="help-circle-outline"
              title="Support"
              onPress={() => console.log('Support')}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ABOUT</Text>
            
            <SettingItem
              title="Version"
              value="1.0.0"
            />
            
            <SettingItem
              title="Build"
              value="2024.1"
            />
          </View>

          {/* Sign Out */}
          <TouchableOpacity 
            style={styles.signOutButton}
            onPress={handleLogout}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  userSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '400',
    color: '#0066FF',
  },
  proBadge: {
    position: 'absolute',
    bottom: 0,
    right: -5,
    backgroundColor: '#0066FF',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: spacing.borderRadius.small,
  },
  proBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: '400',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: spacing.xl,
  },
  levelContainer: {
    width: '60%',
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  levelText: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(0, 212, 255, 0.7)',
    letterSpacing: 1,
    fontWeight: '600',
  },
  xpText: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 1,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0066FF',
    borderRadius: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: '300',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.3)',
    letterSpacing: 1,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  section: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  sectionTitle: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.3)',
    letterSpacing: 2,
    marginLeft: spacing.lg,
    marginBottom: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: spacing.md,
  },
  settingTitle: {
    fontSize: typography.fontSize.md,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
  },
  settingTitleDanger: {
    color: '#EF4444',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.4)',
    marginRight: spacing.xs,
  },
  signOutButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: spacing.borderRadius.medium,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    alignItems: 'center',
  },
  signOutText: {
    fontSize: typography.fontSize.md,
    color: '#EF4444',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});