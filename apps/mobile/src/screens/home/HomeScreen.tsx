// src/screens/home/HomeScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { GlassCard } from '../../components/common/GlassCard';
import { PremiumButton } from '../../components/common/PremiumButton';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data - enhanced
const mockStats = {
  streak: 7,
  todayCards: 25,
  completed: 15,
  accuracy: 85,
  weeklyGoal: 150,
  weeklyCompleted: 89,
  level: 5,
  xp: 1250,
  nextLevelXp: 2000,
};

const upcomingReviews = [
  { time: '2 hrs', count: 5, category: 'Technology' },
  { time: '5 hrs', count: 8, category: 'Languages' },
  { time: 'Tomorrow', count: 12, category: 'Science' },
];

const quickStats = [
  { icon: 'time-outline', value: '5 min', label: 'Avg. Time' },
  { icon: 'trending-up-outline', value: '+12%', label: 'This Week' },
  { icon: 'star-outline', value: '4.8', label: 'Avg. Score' },
];

const categories = [
  { name: 'Technology', icon: '💻', cards: 42, dueToday: 5, color: colors.gradients.primary },
  { name: 'Languages', icon: '🗣️', cards: 38, dueToday: 3, color: colors.gradients.secondary },
  { name: 'Science', icon: '🔬', cards: 29, dueToday: 0, color: colors.gradients.accent },
  { name: 'History', icon: '📚', cards: 51, dueToday: 8, color: colors.gradients.success },
];

export default function HomeScreen({ navigation }: any) {
  const { stats } = useSelector((state: RootState) => state.user);
  const { todayReviews } = useSelector((state: RootState) => state.review);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for streak
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Update time
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getUserName = () => 'Alex'; // Replace with actual user name from Redux

  const progressPercentage = (mockStats.completed / mockStats.todayCards) * 100;
  const weeklyProgress = (mockStats.weeklyCompleted / mockStats.weeklyGoal) * 100;
  const xpProgress = ((mockStats.xp - 1000) / (mockStats.nextLevelXp - 1000)) * 100; // Assuming level starts at 1000 XP

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
          {/* Premium Header */}
          <Animated.View 
            style={[
              styles.header,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
            ]}
          >
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>{getGreeting()}, {getUserName()}!</Text>
                <Text style={styles.subtitle}>Let's make today count</Text>
              </View>
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => navigation.navigate('Profile')}
              >
                <LinearGradient
                  colors={colors.gradients.holographic as any}
                  style={styles.profileGradient}
                >
                  <Text style={styles.profileInitials}>AM</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Quick Stats Row */}
            <View style={styles.quickStatsRow}>
              {quickStats.map((stat, index) => (
                <View key={index} style={styles.quickStat}>
                  <Ionicons name={stat.icon as any} size={16} color={colors.text.tertiary} />
                  <Text style={styles.quickStatValue}>{stat.value}</Text>
                  <Text style={styles.quickStatLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Hero Streak Card - Enhanced */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity 
              activeOpacity={0.9}
              onPress={() => navigation.navigate('Stats')}
            >
              <GlassCard style={styles.heroCard}>
                <LinearGradient
                  colors={colors.gradients.premium as any}
                  style={styles.heroGradient}
                >
                  <View style={styles.heroContent}>
                    <View style={styles.streakSection}>
                      <View style={styles.streakCircle}>
                        <Text style={styles.streakNumber}>{mockStats.streak}</Text>
                      </View>
                      <Text style={styles.streakLabel}>Day Streak</Text>
                      <Text style={styles.streakEmoji}>🔥</Text>
                    </View>
                    
                    <View style={styles.heroStats}>
                      <View style={styles.heroStatItem}>
                        <Text style={styles.heroStatValue}>{mockStats.completed}/{mockStats.todayCards}</Text>
                        <Text style={styles.heroStatLabel}>Today's Cards</Text>
                      </View>
                      <View style={styles.heroStatDivider} />
                      <View style={styles.heroStatItem}>
                        <Text style={styles.heroStatValue}>{mockStats.accuracy}%</Text>
                        <Text style={styles.heroStatLabel}>Accuracy</Text>
                      </View>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.heroProgressContainer}>
                    <View style={styles.heroProgressBar}>
                      <Animated.View style={[styles.heroProgressFill, { width: `${progressPercentage}%` }]} />
                    </View>
                    <Text style={styles.heroProgressText}>
                      {mockStats.todayCards - mockStats.completed} cards remaining today
                    </Text>
                  </View>
                </LinearGradient>
              </GlassCard>
            </TouchableOpacity>
          </Animated.View>

          {/* Level & XP Card */}
          <GlassCard style={styles.levelCard}>
            <View style={styles.levelHeader}>
              <View style={styles.levelBadge}>
                <LinearGradient
                  colors={colors.gradients.holographic as any}
                  style={styles.levelGradient}
                >
                  <Text style={styles.levelNumber}>LVL {mockStats.level}</Text>
                </LinearGradient>
              </View>
              <View style={styles.levelInfo}>
                <Text style={styles.levelTitle}>Knowledge Seeker</Text>
                <Text style={styles.xpText}>{mockStats.xp} / {mockStats.nextLevelXp} XP</Text>
              </View>
              <View style={styles.levelReward}>
                <Ionicons name="gift" size={20} color={colors.gradients.accent[0]} />
                <Text style={styles.rewardText}>+2</Text>
              </View>
            </View>
            <View style={styles.xpProgressBar}>
              <LinearGradient
                colors={colors.gradients.primary as any}
                style={[styles.xpProgressFill, { width: `${xpProgress}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </GlassCard>

          {/* Main Action Button */}
          <View style={styles.mainAction}>
            <PremiumButton
              title="Start Today's Review"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate('Review');
              }}
              variant="primary"
              size="large"
              style={styles.reviewButton}
            />
            <Text style={styles.reviewHint}>
              {mockStats.todayCards - mockStats.completed} cards ready • ~5 min
            </Text>
          </View>

          {/* Upcoming Reviews */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Reviews</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Library')}>
                <Text style={styles.sectionLink}>See all →</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.upcomingList}
            >
              {upcomingReviews.map((review, index) => (
                <GlassCard key={index} style={styles.upcomingCard}>
                  <View style={styles.upcomingTime}>
                    <Ionicons name="time-outline" size={14} color={colors.text.tertiary} />
                    <Text style={styles.upcomingTimeText}>{review.time}</Text>
                  </View>
                  <Text style={styles.upcomingCount}>{review.count}</Text>
                  <Text style={styles.upcomingLabel}>cards</Text>
                  <Text style={styles.upcomingCategory}>{review.category}</Text>
                </GlassCard>
              ))}
            </ScrollView>
          </View>

          {/* Categories Grid - Enhanced */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Categories</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Library')}>
                <Ionicons name="add-circle" size={24} color={colors.gradients.primary[0]} />
              </TouchableOpacity>
            </View>
            <View style={styles.categoriesGrid}>
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.categoryCard}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate('Library');
                  }}
                >
                  <GlassCard style={styles.categoryInner}>
                    <LinearGradient
                      colors={category.color as any}
                      style={styles.categoryGradient}
                    >
                      <Text style={styles.categoryIcon}>{category.icon}</Text>
                    </LinearGradient>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <View style={styles.categoryStats}>
                      <Text style={styles.categoryCount}>{category.cards} cards</Text>
                      {category.dueToday > 0 && (
                        <View style={styles.dueBadge}>
                          <Text style={styles.dueText}>{category.dueToday} due</Text>
                        </View>
                      )}
                    </View>
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Weekly Goal Card */}
          <GlassCard style={styles.weeklyCard}>
            <View style={styles.weeklyHeader}>
              <Text style={styles.weeklyTitle}>Weekly Goal</Text>
              <Text style={styles.weeklyProgress}>
                {mockStats.weeklyCompleted} / {mockStats.weeklyGoal}
              </Text>
            </View>
            <View style={styles.weeklyBarContainer}>
              <View style={styles.weeklyBar}>
                <LinearGradient
                  colors={colors.gradients.success as any}
                  style={[styles.weeklyFill, { width: `${weeklyProgress}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
            </View>
            <View style={styles.weeklyDays}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                <View key={index} style={styles.weeklyDay}>
                  <View style={[
                    styles.weeklyDayDot,
                    index < 4 && styles.weeklyDayDotActive
                  ]} />
                  <Text style={styles.weeklyDayText}>{day}</Text>
                </View>
              ))}
            </View>
          </GlassCard>

          {/* Quick Actions Grid */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Library')}
            >
              <LinearGradient
                colors={[colors.glass.medium, colors.glass.light]}
                style={styles.quickActionGradient}
              >
                <Ionicons name="add-circle-outline" size={24} color={colors.text.primary} />
                <Text style={styles.quickActionText}>Add Cards</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Stats')}
            >
              <LinearGradient
                colors={[colors.glass.medium, colors.glass.light]}
                style={styles.quickActionGradient}
              >
                <Ionicons name="stats-chart-outline" size={24} color={colors.text.primary} />
                <Text style={styles.quickActionText}>Statistics</Text>
              </LinearGradient>
            </TouchableOpacity>
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
    padding: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  greeting: {
    fontSize: typography.fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  profileGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
    marginVertical: 2,
  },
  quickStatLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  heroCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: 0,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: spacing.xl,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  streakSection: {
    alignItems: 'center',
  },
  streakCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  streakNumber: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  streakLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
  },
  streakEmoji: {
    fontSize: 24,
    marginTop: spacing.xs,
  },
  heroStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginLeft: spacing.xl,
  },
  heroStatItem: {
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  heroStatLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    opacity: 0.8,
  },
  heroStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroProgressContainer: {
    marginTop: spacing.md,
  },
  heroProgressBar: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  heroProgressFill: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 6,
  },
  heroProgressText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    opacity: 0.9,
    textAlign: 'center',
  },
  levelCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  levelBadge: {
    marginRight: spacing.md,
  },
  levelGradient: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.small,
  },
  levelNumber: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.text.primary,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
  },
  xpText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  levelReward: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.gradients.accent[0],
    marginLeft: spacing.xs,
  },
  xpProgressBar: {
    height: 6,
    backgroundColor: colors.glass.light,
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  mainAction: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  reviewButton: {
    marginBottom: spacing.sm,
  },
  reviewHint: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: colors.text.primary,
  },
  sectionLink: {
    fontSize: typography.fontSize.sm,
    color: colors.gradients.primary[0],
    fontWeight: '500',
  },
  upcomingList: {
    paddingLeft: spacing.lg,
  },
  upcomingCard: {
    width: 100,
    marginRight: spacing.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  upcomingTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  upcomingTimeText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginLeft: spacing.xs,
  },
  upcomingCount: {
    fontSize: typography.fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  upcomingLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  upcomingCategory: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
  },
  categoryCard: {
    width: '48%',
    marginBottom: spacing.md,
    marginHorizontal: '1%',
  },
  categoryInner: {
    padding: spacing.md,
  },
  categoryGradient: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  categoryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryCount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  dueBadge: {
    backgroundColor: colors.status.error,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: spacing.borderRadius.small,
  },
  dueText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.text.primary,
  },
  weeklyCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  weeklyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  weeklyProgress: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  weeklyBarContainer: {
    marginBottom: spacing.md,
  },
  weeklyBar: {
    height: 8,
    backgroundColor: colors.glass.light,
    borderRadius: 4,
    overflow: 'hidden',
  },
  weeklyFill: {
    height: '100%',
    borderRadius: 4,
  },
  weeklyDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weeklyDay: {
    alignItems: 'center',
  },
  weeklyDayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.glass.medium,
    marginBottom: spacing.xs,
  },
  weeklyDayDotActive: {
    backgroundColor: colors.status.success,
  },
  weeklyDayText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  quickActionCard: {
    flex: 1,
    marginHorizontal: spacing.xs,
    borderRadius: spacing.borderRadius.medium,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: spacing.md,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
});