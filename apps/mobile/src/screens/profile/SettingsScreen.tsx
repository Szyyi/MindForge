// src/screens/settings/SettingsScreen.tsx
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
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';

import { GlassCard } from '../../components/common/GlassCard';
import { PremiumButton } from '../../components/common/PremiumButton';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface SettingsSectionProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, icon, children }) => (
  <GlassCard style={styles.section}>
    <View style={styles.sectionHeader}>
      <LinearGradient
        colors={colors.gradients.primary as any}
        style={styles.sectionIconContainer}
      >
        <Ionicons name={icon} size={20} color={colors.text.primary} />
      </LinearGradient>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
  </GlassCard>
);

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  value?: string | number;
  onPress?: () => void;
  hasToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  danger?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon,
  title,
  subtitle,
  value,
  onPress,
  hasToggle,
  toggleValue,
  onToggle,
  danger,
}) => {
  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <TouchableOpacity 
      style={styles.settingRow} 
      onPress={handlePress}
      disabled={hasToggle}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, danger && styles.iconContainerDanger]}>
          <Ionicons 
            name={icon} 
            size={18} 
            color={danger ? colors.status.error : colors.text.secondary} 
          />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, danger && styles.settingTitleDanger]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.settingRight}>
        {value && !hasToggle && (
          <Text style={styles.settingValue}>{value}</Text>
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
          !value && (
            <Ionicons 
              name="chevron-forward" 
              size={18} 
              color={colors.text.tertiary} 
            />
          )
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  
  // Study Settings
  const [dailyGoal, setDailyGoal] = useState(20);
  const [autoPlay, setAutoPlay] = useState(true);
  const [showTimer, setShowTimer] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);
  
  // Notifications
  const [dailyReminder, setDailyReminder] = useState(true);
  const [streakReminder, setStreakReminder] = useState(true);
  const [achievementAlerts, setAchievementAlerts] = useState(true);
  const [reminderTime, setReminderTime] = useState('9:00 AM');
  
  // Display
  const [fontSize, setFontSize] = useState('Medium');
  const [cardAnimation, setCardAnimation] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  
  // Privacy
  const [analytics, setAnalytics] = useState(true);
  const [crashReports, setCrashReports] = useState(true);
  const [personalization, setPersonalization] = useState(true);

  const handleDailyGoalPress = () => {
    Alert.alert(
      'Daily Goal',
      'Select your daily card review goal',
      [
        { text: '10 cards', onPress: () => setDailyGoal(10) },
        { text: '20 cards', onPress: () => setDailyGoal(20) },
        { text: '30 cards', onPress: () => setDailyGoal(30) },
        { text: '50 cards', onPress: () => setDailyGoal(50) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleFontSizePress = () => {
    Alert.alert(
      'Font Size',
      'Select your preferred font size',
      [
        { text: 'Small', onPress: () => setFontSize('Small') },
        { text: 'Medium', onPress: () => setFontSize('Medium') },
        { text: 'Large', onPress: () => setFontSize('Large') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleReminderTimePress = () => {
    Alert.alert(
      'Daily Reminder Time',
      'Select when you want to be reminded',
      [
        { text: '7:00 AM', onPress: () => setReminderTime('7:00 AM') },
        { text: '9:00 AM', onPress: () => setReminderTime('9:00 AM') },
        { text: '12:00 PM', onPress: () => setReminderTime('12:00 PM') },
        { text: '6:00 PM', onPress: () => setReminderTime('6:00 PM') },
        { text: '9:00 PM', onPress: () => setReminderTime('9:00 PM') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleBackupPress = () => {
    Alert.alert(
      'Backup Data',
      'Your data will be backed up to the cloud',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Backup Now', 
          onPress: () => {
            Alert.alert('Success', 'Your data has been backed up successfully');
          }
        },
      ]
    );
  };

  const handleRestorePress = () => {
    Alert.alert(
      'Restore Data',
      'This will replace your current data with the backed up version',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Restore', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Your data has been restored');
          }
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will free up storage space but may slow down initial loading',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Cache cleared successfully');
          }
        },
      ]
    );
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset All Progress',
      'This will permanently delete all your learning progress. This action cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'All your cards, decks, and progress will be lost forever!',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Yes, Reset Everything', 
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert('Success', 'All progress has been reset');
                  }
                },
              ]
            );
          }
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Account', 
          style: 'destructive',
          onPress: () => {
            console.log('Account deletion initiated');
          }
        },
      ]
    );
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
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Settings</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Study Settings */}
          <SettingsSection title="Study Preferences" icon="school-outline">
            <SettingRow
              icon="flag-outline"
              title="Daily Goal"
              subtitle="Cards to review each day"
              value={`${dailyGoal} cards`}
              onPress={handleDailyGoalPress}
            />
            <SettingRow
              icon="play-circle-outline"
              title="Auto-play Audio"
              subtitle="Automatically play pronunciation"
              hasToggle
              toggleValue={autoPlay}
              onToggle={setAutoPlay}
            />
            <SettingRow
              icon="timer-outline"
              title="Show Timer"
              subtitle="Display time spent on each card"
              hasToggle
              toggleValue={showTimer}
              onToggle={setShowTimer}
            />
            <SettingRow
              icon="phone-portrait-outline"
              title="Vibration Feedback"
              subtitle="Haptic feedback for actions"
              hasToggle
              toggleValue={vibration}
              onToggle={setVibration}
            />
            <SettingRow
              icon="volume-high-outline"
              title="Sound Effects"
              subtitle="Play sounds for correct/incorrect"
              hasToggle
              toggleValue={soundEffects}
              onToggle={setSoundEffects}
            />
          </SettingsSection>

          {/* Notifications */}
          <SettingsSection title="Notifications" icon="notifications-outline">
            <SettingRow
              icon="alarm-outline"
              title="Daily Reminder"
              subtitle={`Remind me at ${reminderTime}`}
              hasToggle
              toggleValue={dailyReminder}
              onToggle={setDailyReminder}
            />
            {dailyReminder && (
              <SettingRow
                icon="time-outline"
                title="Reminder Time"
                value={reminderTime}
                onPress={handleReminderTimePress}
              />
            )}
            <SettingRow
              icon="flame-outline"
              title="Streak Reminders"
              subtitle="Don't lose your streak!"
              hasToggle
              toggleValue={streakReminder}
              onToggle={setStreakReminder}
            />
            <SettingRow
              icon="trophy-outline"
              title="Achievement Alerts"
              subtitle="Celebrate your milestones"
              hasToggle
              toggleValue={achievementAlerts}
              onToggle={setAchievementAlerts}
            />
          </SettingsSection>

          {/* Display */}
          <SettingsSection title="Display" icon="color-palette-outline">
            <SettingRow
              icon="text-outline"
              title="Font Size"
              subtitle="Adjust text size for cards"
              value={fontSize}
              onPress={handleFontSizePress}
            />
            <SettingRow
              icon="sparkles-outline"
              title="Card Animations"
              subtitle="Enable flip and swipe animations"
              hasToggle
              toggleValue={cardAnimation}
              onToggle={setCardAnimation}
            />
            <SettingRow
              icon="accessibility-outline"
              title="Reduce Motion"
              subtitle="Minimize animations"
              hasToggle
              toggleValue={reducedMotion}
              onToggle={setReducedMotion}
            />
          </SettingsSection>

          {/* Data & Storage */}
          <SettingsSection title="Data & Storage" icon="cloud-outline">
            <SettingRow
              icon="cloud-upload-outline"
              title="Backup Data"
              subtitle="Last backup: 2 days ago"
              onPress={handleBackupPress}
            />
            <SettingRow
              icon="cloud-download-outline"
              title="Restore Data"
              subtitle="Restore from cloud backup"
              onPress={handleRestorePress}
            />
            <SettingRow
              icon="trash-outline"
              title="Clear Cache"
              subtitle="Free up storage space"
              onPress={handleClearCache}
            />
          </SettingsSection>

          {/* Privacy */}
          <SettingsSection title="Privacy" icon="shield-checkmark-outline">
            <SettingRow
              icon="analytics-outline"
              title="Usage Analytics"
              subtitle="Help us improve the app"
              hasToggle
              toggleValue={analytics}
              onToggle={setAnalytics}
            />
            <SettingRow
              icon="bug-outline"
              title="Crash Reports"
              subtitle="Automatically send crash data"
              hasToggle
              toggleValue={crashReports}
              onToggle={setCrashReports}
            />
            <SettingRow
              icon="person-outline"
              title="Personalization"
              subtitle="Use data to personalize experience"
              hasToggle
              toggleValue={personalization}
              onToggle={setPersonalization}
            />
          </SettingsSection>

          {/* About */}
          <SettingsSection title="About" icon="information-circle-outline">
            <SettingRow
              icon="document-text-outline"
              title="Terms of Service"
              onPress={() => console.log('Terms')}
            />
            <SettingRow
              icon="shield-outline"
              title="Privacy Policy"
              onPress={() => console.log('Privacy')}
            />
            <SettingRow
              icon="heart-outline"
              title="Rate MindForge"
              subtitle="Love the app? Let us know!"
              onPress={() => console.log('Rate')}
            />
            <SettingRow
              icon="share-outline"
              title="Share MindForge"
              subtitle="Spread the word"
              onPress={() => console.log('Share')}
            />
            <SettingRow
              icon="code-slash-outline"
              title="Version"
              value="1.0.0 (Build 42)"
            />
          </SettingsSection>

          {/* Danger Zone */}
          <SettingsSection title="Danger Zone" icon="warning-outline">
            <SettingRow
              icon="refresh-outline"
              title="Reset All Progress"
              subtitle="Delete all learning data"
              onPress={handleResetProgress}
              danger
            />
            <SettingRow
              icon="trash-bin-outline"
              title="Delete Account"
              subtitle="Permanently delete your account"
              onPress={handleDeleteAccount}
              danger
            />
          </SettingsSection>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  settingRow: {
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
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.glass.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconContainerDanger: {
    backgroundColor: `${colors.status.error}20`,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 2,
  },
  settingTitleDanger: {
    color: colors.status.error,
  },
  settingSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginRight: spacing.xs,
  },
});