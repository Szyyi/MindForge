// src/screens/profile/ProfileScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';

import { GlassCard } from '../../components/common/GlassCard';
import { PremiumButton } from '../../components/common/PremiumButton';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

// Mock user data
const mockUser = {
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  avatar: null, // Will use initials
  plan: 'Pro',
  joinDate: 'September 2024',
  totalCards: 1247,
  totalDecks: 28,
  studyStreak: 15,
  achievements: 12,
  level: 8,
  xp: 3250,
  xpToNextLevel: 750,
};

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  hasToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  showBadge?: boolean;
  badgeText?: string;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  hasToggle,
  toggleValue,
  onToggle,
  showBadge,
  badgeText,
}) => {
  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={handlePress}
      disabled={hasToggle}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIconContainer}>
          <LinearGradient
            colors={[colors.glass.medium, colors.glass.light]}
            style={styles.settingIconGradient}
          >
            <Ionicons name={icon} size={20} color={colors.text.primary} />
          </LinearGradient>
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      
      <View style={styles.settingRight}>
        {showBadge && badgeText && (
          <View style={styles.badge}>
            <LinearGradient
              colors={colors.gradients.accent as any}
              style={styles.badgeGradient}
            >
              <Text style={styles.badgeText}>{badgeText}</Text>
            </LinearGradient>
          </View>
        )}
        {hasToggle ? (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ 
              false: colors.glass.medium, 
              true: colors.gradients.primary[0] 
            }}
            thumbColor={colors.text.primary}
          />
        ) : (
          !showBadge && (
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={colors.text.tertiary} 
            />
          )
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  const progressPercentage = (mockUser.xp / (mockUser.xp + mockUser.xpToNextLevel)) * 100;

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            // Dispatch logout action
            console.log('Logging out...');
          }
        },
      ]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => console.log('Settings')}
            >
              <BlurView intensity={20} style={styles.settingsBlur}>
                <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <GlassCard style={styles.profileCard}>
            <LinearGradient
              colors={colors.gradients.premium as any}
              style={styles.profileGradient}
            >
              {/* Avatar Section */}
              <View style={styles.avatarSection}>
                {mockUser.avatar ? (
                  <Image source={{ uri: mockUser.avatar }} style={styles.avatar} />
                ) : (
                  <LinearGradient
                    colors={colors.gradients.holographic as any}
                    style={styles.avatarPlaceholder}
                  >
                    <Text style={styles.avatarInitials}>
                      {getInitials(mockUser.name)}
                    </Text>
                  </LinearGradient>
                )}
                
                {/* Plan Badge */}
                <View style={styles.planBadge}>
                  <LinearGradient
                    colors={colors.gradients.premium as any}
                    style={styles.planBadgeGradient}
                  >
                    <Ionicons name="diamond" size={12} color={colors.text.primary} />
                    <Text style={styles.planBadgeText}>{mockUser.plan}</Text>
                  </LinearGradient>
                </View>
              </View>

              {/* User Info */}
              <Text style={styles.userName}>{mockUser.name}</Text>
              <Text style={styles.userEmail}>{mockUser.email}</Text>
              <Text style={styles.joinDate}>Member since {mockUser.joinDate}</Text>

              {/* Level Progress */}
              <View style={styles.levelSection}>
                <View style={styles.levelHeader}>
                  <Text style={styles.levelText}>Level {mockUser.level}</Text>
                  <Text style={styles.xpText}>{mockUser.xp} / {mockUser.xp + mockUser.xpToNextLevel} XP</Text>
                </View>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={colors.gradients.primary as any}
                    style={[styles.progressFill, { width: `${progressPercentage}%` }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
                <Text style={styles.nextLevelText}>
                  {mockUser.xpToNextLevel} XP to Level {mockUser.level + 1}
                </Text>
              </View>
            </LinearGradient>
          </GlassCard>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <GlassCard style={styles.statCard}>
              <LinearGradient
                colors={[colors.gradients.primary[1], colors.gradients.primary[0]] as any}
                style={styles.statGradient}
              >
                <Ionicons name="flame" size={24} color={colors.text.primary} />
                <Text style={styles.statValue}>{mockUser.studyStreak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </LinearGradient>
            </GlassCard>

            <GlassCard style={styles.statCard}>
              <LinearGradient
                colors={[colors.gradients.secondary[1], colors.gradients.secondary[0]] as any}
                style={styles.statGradient}
              >
                <Ionicons name="library" size={24} color={colors.text.primary} />
                <Text style={styles.statValue}>{mockUser.totalDecks}</Text>
                <Text style={styles.statLabel}>Total Decks</Text>
              </LinearGradient>
            </GlassCard>

            <GlassCard style={styles.statCard}>
              <LinearGradient
                colors={[colors.gradients.accent[1], colors.gradients.accent[0]] as any}
                style={styles.statGradient}
              >
                <Ionicons name="layers" size={24} color={colors.text.primary} />
                <Text style={styles.statValue}>{mockUser.totalCards}</Text>
                <Text style={styles.statLabel}>Cards Studied</Text>
              </LinearGradient>
            </GlassCard>

            <GlassCard style={styles.statCard}>
              <LinearGradient
                colors={[colors.gradients.success[1], colors.gradients.success[0]] as any}
                style={styles.statGradient}
              >
                <Ionicons name="trophy" size={24} color={colors.text.primary} />
                <Text style={styles.statValue}>{mockUser.achievements}</Text>
                <Text style={styles.statLabel}>Achievements</Text>
              </LinearGradient>
            </GlassCard>
          </View>

          {/* Settings Section */}
          <GlassCard style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            
            <SettingItem
              icon="notifications-outline"
              title="Daily Reminders"
              subtitle="Get notified for daily reviews"
              hasToggle
              toggleValue={notificationsEnabled}
              onToggle={setNotificationsEnabled}
            />
            
            <SettingItem
              icon="moon-outline"
              title="Dark Mode"
              subtitle="Always enabled for premium feel"
              hasToggle
              toggleValue={darkMode}
              onToggle={setDarkMode}
            />
            
            <SettingItem
              icon="cloud-offline-outline"
              title="Offline Mode"
              subtitle="Study without internet"
              hasToggle
              toggleValue={offlineMode}
              onToggle={setOfflineMode}
            />
          </GlassCard>

          {/* Account Section */}
          <GlassCard style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <SettingItem
              icon="diamond-outline"
              title="Subscription"
              subtitle="Pro Plan - Active"
              onPress={() => console.log('Subscription')}
              showBadge
              badgeText="PRO"
            />
            
            <SettingItem
              icon="shield-checkmark-outline"
              title="Privacy & Security"
              onPress={() => console.log('Privacy')}
            />
            
            <SettingItem
              icon="help-circle-outline"
              title="Help & Support"
              onPress={() => console.log('Support')}
            />
            
            <SettingItem
              icon="information-circle-outline"
              title="About MindForge"
              subtitle="Version 1.0.0"
              onPress={() => console.log('About')}
            />
          </GlassCard>

          {/* Logout Button */}
          <PremiumButton
            title="Logout"
            onPress={handleLogout}
            variant="secondary"
            size="large"
            style={styles.logoutButton}
          />

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Made with passion for learning
            </Text>
            <LinearGradient
              colors={colors.gradients.premium as any}
              style={styles.footerGradient}
            >
              <Text style={styles.footerEmoji}>✨</Text>
            </LinearGradient>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  settingsBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.glass.light,
  },
  profileCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: 0,
    overflow: 'hidden',
  },
  profileGradient: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  avatarSection: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.glass.shimmer,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  planBadge: {
    position: 'absolute',
    bottom: 0,
    right: -5,
    borderRadius: spacing.borderRadius.small,
    overflow: 'hidden',
  },
  planBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  planBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.text.primary,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  joinDate: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    opacity: 0.7,
    marginBottom: spacing.lg,
  },
  levelSection: {
    width: '100%',
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  levelText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
  },
  xpText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    opacity: 0.8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  nextLevelText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.primary,
    opacity: 0.7,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: '48%',
    margin: '1%',
    padding: 0,
    overflow: 'hidden',
  },
  statGradient: {
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginVertical: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.primary,
    opacity: 0.9,
  },
  settingsSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  settingIconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  settingSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    borderRadius: spacing.borderRadius.small,
    overflow: 'hidden',
  },
  badgeGradient: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.text.primary,
    textTransform: 'uppercase',
  },
  logoutButton: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
  },
  footerGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerEmoji: {
    fontSize: 20,
  },
});