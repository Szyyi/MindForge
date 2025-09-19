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
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data
const weeklyData = [
  { day: 'M', cards: 45, accuracy: 84 },
  { day: 'T', cards: 52, accuracy: 92 },
  { day: 'W', cards: 38, accuracy: 84 },
  { day: 'T', cards: 60, accuracy: 91 },
  { day: 'F', cards: 48, accuracy: 87 },
  { day: 'S', cards: 35, accuracy: 85 },
  { day: 'S', cards: 42, accuracy: 90 },
];

const monthlyTrend = [
  { week: 'W1', total: 280 },
  { week: 'W2', total: 320 },
  { week: 'W3', total: 295 },
  { week: 'W4', total: 320 },
];

export default function StatsScreen({ navigation }: any) {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '1Y'>('7D');
  
  // Calculate stats
  const totalCards = weeklyData.reduce((sum, day) => sum + day.cards, 0);
  const avgAccuracy = Math.round(
    weeklyData.reduce((sum, day) => sum + day.accuracy, 0) / weeklyData.length
  );
  const avgPerDay = Math.round(totalCards / 7);
  const maxCards = Math.max(...weeklyData.map(d => d.cards));
  const bestDay = weeklyData.find(d => d.cards === maxCards);
  
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
            <Text style={styles.title}>Statistics</Text>
            <View style={styles.timeRangeContainer}>
              {(['7D', '30D', '1Y'] as const).map((range) => (
                <TouchableOpacity
                  key={range}
                  style={[
                    styles.timeRangeButton,
                    timeRange === range && styles.timeRangeButtonActive
                  ]}
                  onPress={() => {
                    setTimeRange(range);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={[
                    styles.timeRangeText,
                    timeRange === range && styles.timeRangeTextActive
                  ]}>
                    {range}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Primary Metrics */}
          <View style={styles.primaryMetrics}>
            <View style={styles.metricLarge}>
              <Text style={styles.metricLargeValue}>{totalCards}</Text>
              <Text style={styles.metricLargeLabel}>CARDS REVIEWED</Text>
            </View>
            
            <View style={styles.metricDivider} />
            
            <View style={styles.metricLarge}>
              <Text style={styles.metricLargeValue}>{avgAccuracy}%</Text>
              <Text style={styles.metricLargeLabel}>AVG ACCURACY</Text>
            </View>
          </View>

          {/* Secondary Metrics */}
          <View style={styles.secondaryMetrics}>
            <View style={styles.metricSmall}>
              <Text style={styles.metricSmallValue}>{avgPerDay}</Text>
              <Text style={styles.metricSmallLabel}>PER DAY</Text>
            </View>
            
            <View style={styles.metricSmall}>
              <Text style={styles.metricSmallValue}>7</Text>
              <Text style={styles.metricSmallLabel}>STREAK</Text>
            </View>
            
            <View style={styles.metricSmall}>
              <Text style={styles.metricSmallValue}>85%</Text>
              <Text style={styles.metricSmallLabel}>RETENTION</Text>
            </View>
            
            <View style={styles.metricSmall}>
              <Text style={styles.metricSmallValue}>2.3h</Text>
              <Text style={styles.metricSmallLabel}>TOTAL TIME</Text>
            </View>
          </View>

          {/* Daily Chart */}
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Daily Activity</Text>
            <View style={styles.chart}>
              {weeklyData.map((day, index) => {
                const barHeight = (day.cards / maxCards) * 100;
                const isMax = day.cards === maxCards;
                
                return (
                  <View key={index} style={styles.barContainer}>
                    <Text style={styles.barValue}>{day.cards}</Text>
                    <View style={styles.barWrapper}>
                      <View 
                        style={[
                          styles.bar,
                          isMax && styles.barMax,
                          { height: `${barHeight}%` }
                        ]} 
                      />
                    </View>
                    <Text style={[
                      styles.barLabel,
                      isMax && styles.barLabelMax
                    ]}>
                      {day.day}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Best Performance */}
          <View style={styles.bestPerformance}>
            <Text style={styles.sectionTitle}>Best Day</Text>
            <View style={styles.bestDay}>
              <View>
                <Text style={styles.bestDayValue}>
                  {bestDay?.day === 'T' && weeklyData[3] === bestDay ? 'Thursday' :
                   bestDay?.day === 'T' && weeklyData[1] === bestDay ? 'Tuesday' :
                   bestDay?.day === 'M' ? 'Monday' :
                   bestDay?.day === 'W' ? 'Wednesday' :
                   bestDay?.day === 'F' ? 'Friday' :
                   bestDay?.day === 'S' && weeklyData[5] === bestDay ? 'Saturday' : 'Sunday'}
                </Text>
                <Text style={styles.bestDayLabel}>
                  {bestDay?.cards} cards reviewed
                </Text>
              </View>
              <View style={styles.bestDayAccuracy}>
                <Text style={styles.bestDayAccuracyValue}>
                  {bestDay?.accuracy}%
                </Text>
                <Text style={styles.bestDayAccuracyLabel}>ACCURACY</Text>
              </View>
            </View>
          </View>

          {/* Monthly Trend */}
          <View style={styles.trendSection}>
            <Text style={styles.sectionTitle}>Monthly Trend</Text>
            <View style={styles.trendChart}>
              {monthlyTrend.map((week, index) => (
                <View key={index} style={styles.trendItem}>
                  <Text style={styles.trendValue}>{week.total}</Text>
                  <View style={styles.trendBar}>
                    <View 
                      style={[
                        styles.trendFill,
                        { height: `${(week.total / 350) * 100}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.trendLabel}>{week.week}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Categories Summary */}
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>By Category</Text>
            <View style={styles.categoryList}>
              {[
                { name: 'Technology', cards: 245, percent: 35 },
                { name: 'Languages', cards: 180, percent: 26 },
                { name: 'Science', cards: 120, percent: 17 },
                { name: 'History', cards: 95, percent: 14 },
                { name: 'Mathematics', cards: 60, percent: 8 },
              ].map((category, index) => (
                <View key={index} style={styles.categoryRow}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <View style={styles.categoryStats}>
                    <Text style={styles.categoryCards}>{category.cards}</Text>
                    <View style={styles.categoryBarContainer}>
                      <View 
                        style={[
                          styles.categoryBar,
                          { width: `${category.percent}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.categoryPercent}>{category.percent}%</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: spacing.borderRadius.small,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  timeRangeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  timeRangeButtonActive: {
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
  },
  timeRangeText: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
    letterSpacing: 1,
  },
  timeRangeTextActive: {
    color: '#0066FF',
  },
  primaryMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  metricLarge: {
    flex: 1,
    alignItems: 'center',
  },
  metricLargeValue: {
    fontSize: 48,
    fontWeight: '200',
    color: '#FFFFFF',
    lineHeight: 48,
  },
  metricLargeLabel: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(0, 212, 255, 0.7)',
    letterSpacing: 2,
    marginTop: spacing.xs,
  },
  metricDivider: {
    width: 1,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: spacing.xl,
  },
  secondaryMetrics: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  metricSmall: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(0, 102, 255, 0.02)',
    marginHorizontal: spacing.xs,
    borderRadius: spacing.borderRadius.medium,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.05)',
  },
  metricSmallValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  metricSmallLabel: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 1,
    marginTop: spacing.xs,
  },
  chartSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '400',
    color: '#FFFFFF',
    marginBottom: spacing.lg,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barValue: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: spacing.xs,
  },
  barWrapper: {
    width: '60%',
    height: 80,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    backgroundColor: 'rgba(0, 102, 255, 0.2)',
    borderRadius: 2,
  },
  barMax: {
    backgroundColor: '#0066FF',
  },
  barLabel: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.3)',
    marginTop: spacing.xs,
  },
  barLabelMax: {
    color: '#0066FF',
  },
  bestPerformance: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  bestDay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 102, 255, 0.02)',
    borderRadius: spacing.borderRadius.medium,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.05)',
  },
  bestDayValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  bestDayLabel: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: spacing.xs,
  },
  bestDayAccuracy: {
    alignItems: 'center',
  },
  bestDayAccuracyValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '300',
    color: '#00D4FF',
  },
  bestDayAccuracyLabel: {
    fontSize: 9,
    color: 'rgba(0, 212, 255, 0.7)',
    letterSpacing: 1,
  },
  trendSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  trendChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  trendItem: {
    flex: 1,
    alignItems: 'center',
  },
  trendValue: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.3)',
    marginBottom: spacing.xs,
  },
  trendBar: {
    width: 40,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: spacing.borderRadius.small,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  trendFill: {
    width: '100%',
    backgroundColor: 'rgba(0, 102, 255, 0.3)',
  },
  trendLabel: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: spacing.xs,
  },
  categoriesSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  categoryList: {},
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.02)',
  },
  categoryName: {
    fontSize: typography.fontSize.md,
    color: 'rgba(255, 255, 255, 0.7)',
    flex: 1,
  },
  categoryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1.5,
  },
  categoryCards: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.5)',
    width: 40,
    textAlign: 'right',
  },
  categoryBarContainer: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: spacing.md,
    borderRadius: 1,
  },
  categoryBar: {
    height: '100%',
    backgroundColor: '#0066FF',
    borderRadius: 1,
  },
  categoryPercent: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.3)',
    width: 35,
  },
});