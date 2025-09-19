// src/screens/stats/StatsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { GlassCard } from '../../components/common/GlassCard';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data for charts
const weeklyData = [
  { day: 'Mon', cards: 45, correct: 38 },
  { day: 'Tue', cards: 52, correct: 48 },
  { day: 'Wed', cards: 38, correct: 32 },
  { day: 'Thu', cards: 60, correct: 55 },
  { day: 'Fri', cards: 48, correct: 42 },
  { day: 'Sat', cards: 35, correct: 30 },
  { day: 'Sun', cards: 42, correct: 38 },
];

const categoryStats = [
  { name: 'Technology', cards: 245, accuracy: 85, color: colors.gradients.primary },
  { name: 'Languages', cards: 180, accuracy: 72, color: colors.gradients.secondary },
  { name: 'Science', cards: 120, accuracy: 90, color: colors.gradients.accent },
  { name: 'History', cards: 95, accuracy: 68, color: colors.gradients.success },
  { name: 'Mathematics', cards: 60, accuracy: 75, color: colors.gradients.warning },
];

export default function StatsScreen({ navigation }: any) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const maxCards = Math.max(...weeklyData.map(d => d.cards));
  
  // Calculate overall stats
  const totalCards = weeklyData.reduce((sum, day) => sum + day.cards, 0);
  const totalCorrect = weeklyData.reduce((sum, day) => sum + day.correct, 0);
  const overallAccuracy = Math.round((totalCorrect / totalCards) * 100);
  const averagePerDay = Math.round(totalCards / 7);
  
  const handleTimeRangeChange = (range: 'week' | 'month' | 'year') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeRange(range);
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
            <Text style={styles.title}>Your Progress</Text>
            <Text style={styles.subtitle}>Keep up the great work! 🚀</Text>
          </View>

          {/* Time Range Selector */}
          <View style={styles.timeRangeContainer}>
            {(['week', 'month', 'year'] as const).map((range) => (
              <TouchableOpacity
                key={range}
                onPress={() => handleTimeRangeChange(range)}
                style={styles.timeRangeButton}
              >
                <GlassCard
                  style={{
                    ...styles.timeRangeCard,
                    ...(timeRange === range ? styles.timeRangeCardActive : {}),
                  }}
                >
                  {timeRange === range ? (
                    <LinearGradient
                      colors={colors.gradients.primary as any}
                      style={styles.timeRangeGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={[styles.timeRangeText, styles.timeRangeTextActive]}>
                        {range.charAt(0).toUpperCase() + range.slice(1)}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <Text style={styles.timeRangeText}>
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </Text>
                  )}
                </GlassCard>
              </TouchableOpacity>
            ))}
          </View>

          {/* Key Metrics */}
          <View style={styles.metricsGrid}>
            <GlassCard style={styles.metricCard}>
              <LinearGradient
                colors={colors.gradients.primary as any}
                style={styles.metricGradient}
              >
                <Ionicons name="trending-up" size={24} color={colors.text.primary} />
                <Text style={styles.metricValue}>{totalCards}</Text>
                <Text style={styles.metricLabel}>Cards Reviewed</Text>
              </LinearGradient>
            </GlassCard>

            <GlassCard style={styles.metricCard}>
              <LinearGradient
                colors={colors.gradients.accent as any}
                style={styles.metricGradient}
              >
                <Ionicons name="checkmark-circle" size={24} color={colors.text.primary} />
                <Text style={styles.metricValue}>{overallAccuracy}%</Text>
                <Text style={styles.metricLabel}>Accuracy Rate</Text>
              </LinearGradient>
            </GlassCard>

            <GlassCard style={styles.metricCard}>
              <LinearGradient
                colors={colors.gradients.secondary as any}
                style={styles.metricGradient}
              >
                <Ionicons name="flame" size={24} color={colors.text.primary} />
                <Text style={styles.metricValue}>7</Text>
                <Text style={styles.metricLabel}>Day Streak</Text>
              </LinearGradient>
            </GlassCard>

            <GlassCard style={styles.metricCard}>
              <LinearGradient
                colors={colors.gradients.success as any}
                style={styles.metricGradient}
              >
                <Ionicons name="calendar" size={24} color={colors.text.primary} />
                <Text style={styles.metricValue}>{averagePerDay}</Text>
                <Text style={styles.metricLabel}>Daily Average</Text>
              </LinearGradient>
            </GlassCard>
          </View>

          {/* Weekly Chart */}
          <GlassCard style={styles.chartCard}>
            <Text style={styles.chartTitle}>This Week's Activity</Text>
            <View style={styles.chart}>
              {weeklyData.map((day, index) => {
                const barHeight = (day.cards / maxCards) * 120;
                const correctHeight = (day.correct / maxCards) * 120;
                
                return (
                  <View key={index} style={styles.barContainer}>
                    <View style={styles.barWrapper}>
                      <View style={[styles.bar, { height: barHeight }]}>
                        <LinearGradient
                          colors={[colors.glass.heavy, colors.glass.medium] as any}
                          style={StyleSheet.absoluteFillObject}
                        />
                      </View>
                      <View style={[styles.barCorrect, { height: correctHeight }]}>
                        <LinearGradient
                          colors={colors.gradients.primary as any}
                          style={StyleSheet.absoluteFillObject}
                        />
                      </View>
                    </View>
                    <Text style={styles.barLabel}>{day.day}</Text>
                    <Text style={styles.barValue}>{day.cards}</Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.glass.heavy }]} />
                <Text style={styles.legendText}>Total Reviewed</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.gradients.primary[0] }]} />
                <Text style={styles.legendText}>Correct Answers</Text>
              </View>
            </View>
          </GlassCard>

          {/* Category Performance */}
          <GlassCard style={styles.categoryCard}>
            <Text style={styles.chartTitle}>Performance by Category</Text>
            {categoryStats.map((category, index) => (
              <View key={index} style={styles.categoryRow}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryCards}>{category.cards} cards</Text>
                </View>
                <View style={styles.categoryAccuracy}>
                  <Text style={styles.accuracyText}>{category.accuracy}%</Text>
                  <View style={styles.accuracyBar}>
                    <LinearGradient
                      colors={category.color as any}
                      style={[styles.accuracyFill, { width: `${category.accuracy}%` }]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>
                </View>
              </View>
            ))}
          </GlassCard>

          {/* Achievement Section */}
          <GlassCard style={styles.achievementCard}>
            <Text style={styles.chartTitle}>Recent Achievements</Text>
            <View style={styles.achievementGrid}>
              <View style={styles.achievement}>
                <LinearGradient
                  colors={colors.gradients.premium as any}
                  style={styles.achievementIcon}
                >
                  <Text style={styles.achievementEmoji}>🏆</Text>
                </LinearGradient>
                <Text style={styles.achievementName}>Week Warrior</Text>
              </View>
              <View style={styles.achievement}>
                <LinearGradient
                  colors={colors.gradients.accent as any}
                  style={styles.achievementIcon}
                >
                  <Text style={styles.achievementEmoji}>🎯</Text>
                </LinearGradient>
                <Text style={styles.achievementName}>Accuracy Pro</Text>
              </View>
              <View style={styles.achievement}>
                <LinearGradient
                  colors={colors.gradients.primary as any}
                  style={styles.achievementIcon}
                >
                  <Text style={styles.achievementEmoji}>📚</Text>
                </LinearGradient>
                <Text style={styles.achievementName}>500 Cards</Text>
              </View>
              <View style={styles.achievement}>
                <LinearGradient
                  colors={colors.gradients.secondary as any}
                  style={styles.achievementIcon}
                >
                  <Text style={styles.achievementEmoji}>⚡</Text>
                </LinearGradient>
                <Text style={styles.achievementName}>Speed Learner</Text>
              </View>
            </View>
          </GlassCard>
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
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  timeRangeButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  timeRangeCard: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  timeRangeCardActive: {
    padding: 0,
    overflow: 'hidden',
  },
  timeRangeGradient: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  timeRangeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  timeRangeTextActive: {
    color: colors.text.primary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  metricCard: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm * 2) / 2,
    margin: spacing.xs,
    padding: 0,
    overflow: 'hidden',
  },
  metricGradient: {
    padding: spacing.md,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginVertical: spacing.xs,
  },
  metricLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.primary,
    opacity: 0.9,
  },
  chartCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  chartTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    marginBottom: spacing.md,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    width: 30,
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: spacing.xs,
  },
  bar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderRadius: spacing.borderRadius.small,
    overflow: 'hidden',
  },
  barCorrect: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderRadius: spacing.borderRadius.small,
    overflow: 'hidden',
  },
  barLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  barValue: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  legendText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  categoryCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
  },
  categoryCards: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  categoryAccuracy: {
    flex: 1,
    alignItems: 'flex-end',
  },
  accuracyText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  accuracyBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.glass.light,
    borderRadius: 2,
    overflow: 'hidden',
  },
  accuracyFill: {
    height: '100%',
    borderRadius: 2,
  },
  achievementCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  achievement: {
    alignItems: 'center',
    width: '45%',
    marginBottom: spacing.md,
  },
  achievementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  achievementEmoji: {
    fontSize: 28,
  },
  achievementName: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});