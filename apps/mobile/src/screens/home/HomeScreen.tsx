
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { GlassCard } from '../../components/common/GlassCard';
import { PremiumButton } from '../../components/common/PremiumButton';
import {colors} from '../../theme/colors';
import {typography} from '../../theme/typography';
import {spacing} from '../../theme/spacing';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const { stats } = useSelector((state: RootState) => state.user);
  const { todayReviews } = useSelector((state: RootState) => state.review);

  // Mock data for now
  const mockStats = {
    streak: 7,
    todayCards: 25,
    completed: 15,
    accuracy: 85,
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
            <Text style={styles.greeting}>Good Morning!</Text>
            <Text style={styles.subtitle}>Ready to forge your mind?</Text>
          </View>

          {/* Streak Card */}
          <GlassCard style={styles.streakCard}>
            <LinearGradient
              colors={colors.gradients.premium as any}
              style={styles.streakGradient}
            >
              <Text style={styles.streakNumber}>{mockStats.streak}</Text>
              <Text style={styles.streakLabel}>Day Streak 🔥</Text>
            </LinearGradient>
          </GlassCard>

          {/* Today's Progress */}
          <GlassCard style={styles.progressCard}>
            <Text style={styles.cardTitle}>Today's Progress</Text>
            <View style={styles.progressStats}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{mockStats.completed}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{mockStats.todayCards}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{mockStats.accuracy}%</Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
            </View>
            
            <View style={styles.progressBar}>
              <LinearGradient
                colors={colors.gradients.primary as any}
                style={[
                  styles.progressFill,
                  { width: `${(mockStats.completed / mockStats.todayCards) * 100}%` }
                ]}
              />
            </View>
          </GlassCard>

          {/* Quick Actions */}
          <View style={styles.actions}>
            <PremiumButton
              title="Start Daily Review"
              onPress={() => navigation.navigate('Review')}
              variant="primary"
              size="large"
              style={styles.mainButton}
            />
            
            <View style={styles.secondaryActions}>
              <PremiumButton
                title="Add Cards"
                onPress={() => navigation.navigate('Library')}
                variant="secondary"
                size="medium"
                style={styles.secondaryButton}
              />
              <PremiumButton
                title="View Stats"
                onPress={() => navigation.navigate('Stats')}
                variant="accent"
                size="medium"
                style={styles.secondaryButton}
              />
            </View>
          </View>

          {/* Categories */}
          <Text style={styles.sectionTitle}>Your Categories</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categories}
          >
            {['Technology', 'Languages', 'Science', 'History'].map((category, index) => (
              <GlassCard key={index} style={styles.categoryCard}>
                <Text style={styles.categoryIcon}>
                  {['💻', '🗣️', '🔬', '📚'][index]}
                </Text>
                <Text style={styles.categoryName}>{category}</Text>
                <Text style={styles.categoryCount}>42 cards</Text>
              </GlassCard>
            ))}
          </ScrollView>
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
  greeting: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  streakCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: 0,
    overflow: 'hidden',
  },
  streakGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 56,
    fontWeight: 'bold',
    color: colors.background.primary,
  },
  streakLabel: {
    fontSize: typography.fontSize.lg,
    color: colors.background.primary,
    fontWeight: '600',
  },
  progressCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: typography.fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.glass.border,
    marginVertical: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.glass.light,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  actions: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  mainButton: {
    marginBottom: spacing.md,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flex: 0.48,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: colors.text.primary,
    marginLeft: spacing.lg,
    marginBottom: spacing.md,
  },
  categories: {
    paddingLeft: spacing.lg,
  },
  categoryCard: {
    width: 120,
    marginRight: spacing.md,
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  categoryName: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  categoryCount: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
});