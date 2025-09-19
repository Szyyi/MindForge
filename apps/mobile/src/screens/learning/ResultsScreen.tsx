// src/screens/learning/ResultScreen.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface RouteParams {
  stats: {
    totalCards: number;
    correct: number;
    incorrect: number;
    accuracy: number;
    timeSpent: number;
    streak: number;
    xpEarned: number;
  };
}

export default function ResultScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { stats } = (route.params as RouteParams) || {
    stats: {
      totalCards: 25,
      correct: 20,
      incorrect: 5,
      accuracy: 80,
      timeSpent: 300,
      streak: 7,
      xpEarned: 150,
    }
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getGradeColor = (accuracy: number) => {
    if (accuracy >= 90) return '#10B981';
    if (accuracy >= 75) return '#0066FF';
    if (accuracy >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getGrade = (accuracy: number) => {
    if (accuracy >= 90) return 'A';
    if (accuracy >= 80) return 'B';
    if (accuracy >= 70) return 'C';
    if (accuracy >= 60) return 'D';
    return 'F';
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
            <TouchableOpacity 
              onPress={() => navigation.navigate('Home')}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>
          </View>

          {/* Result Title */}
          <Animated.View 
            style={[
              styles.resultHeader,
              { 
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <Text style={styles.resultTitle}>Session Complete</Text>
            <Text style={styles.resultSubtitle}>Here's how you did</Text>
          </Animated.View>

          {/* Grade Circle */}
          <Animated.View 
            style={[
              styles.gradeContainer,
              { 
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <View style={[styles.gradeCircle, { borderColor: getGradeColor(stats.accuracy) }]}>
              <Text style={[styles.grade, { color: getGradeColor(stats.accuracy) }]}>
                {getGrade(stats.accuracy)}
              </Text>
              <Text style={styles.accuracyText}>{stats.accuracy}%</Text>
              <Text style={styles.accuracyLabel}>ACCURACY</Text>
            </View>
          </Animated.View>

          {/* Primary Stats */}
          <View style={styles.primaryStats}>
            <View style={styles.primaryStatItem}>
              <Text style={styles.primaryStatValue}>{stats.correct}</Text>
              <Text style={styles.primaryStatLabel}>CORRECT</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.primaryStatItem}>
              <Text style={[styles.primaryStatValue, { color: '#EF4444' }]}>
                {stats.incorrect}
              </Text>
              <Text style={styles.primaryStatLabel}>INCORRECT</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.primaryStatItem}>
              <Text style={styles.primaryStatValue}>{stats.totalCards}</Text>
              <Text style={styles.primaryStatLabel}>TOTAL</Text>
            </View>
          </View>

          {/* Secondary Stats */}
          <View style={styles.secondaryStats}>
            <View style={styles.secondaryStatCard}>
              <Ionicons name="time-outline" size={20} color="#00D4FF" />
              <Text style={styles.secondaryStatValue}>{formatTime(stats.timeSpent)}</Text>
              <Text style={styles.secondaryStatLabel}>TIME SPENT</Text>
            </View>
            
            <View style={styles.secondaryStatCard}>
              <Ionicons name="flame" size={20} color="#F59E0B" />
              <Text style={styles.secondaryStatValue}>{stats.streak}</Text>
              <Text style={styles.secondaryStatLabel}>DAY STREAK</Text>
            </View>
          </View>

          {/* XP Earned */}
          <View style={styles.xpSection}>
            <View style={styles.xpCard}>
              <Text style={styles.xpLabel}>XP EARNED</Text>
              <Text style={styles.xpValue}>+{stats.xpEarned}</Text>
              <View style={styles.xpBar}>
                <Animated.View 
                  style={[
                    styles.xpFill,
                    { 
                      width: `${Math.min(100, (stats.xpEarned / 200) * 100)}%`,
                      opacity: fadeAnim
                    }
                  ]} 
                />
              </View>
            </View>
          </View>

          {/* Incorrect Cards Summary */}
          {stats.incorrect > 0 && (
            <View style={styles.incorrectSection}>
              <Text style={styles.incorrectTitle}>CARDS TO REVIEW AGAIN</Text>
              <Text style={styles.incorrectText}>
                {stats.incorrect} cards have been added to your review queue
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate('Review');
              }}
            >
              <LinearGradient
                colors={['#0066FF', '#0052CC'] as [string, string]}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>REVIEW AGAIN</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('Home');
              }}
            >
              <Text style={styles.secondaryButtonText}>BACK TO HOME</Text>
            </TouchableOpacity>
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
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  resultTitle: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  resultSubtitle: {
    fontSize: typography.fontSize.md,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: spacing.xs,
  },
  gradeContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  gradeCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 102, 255, 0.02)',
  },
  grade: {
    fontSize: 48,
    fontWeight: '700',
  },
  accuracyText: {
    fontSize: typography.fontSize.xl,
    fontWeight: '300',
    color: '#FFFFFF',
    marginTop: spacing.xs,
  },
  accuracyLabel: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
  },
  primaryStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  primaryStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  primaryStatValue: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: '300',
    color: '#10B981',
  },
  primaryStatLabel: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  secondaryStats: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  secondaryStatCard: {
    flex: 1,
    backgroundColor: 'rgba(0, 102, 255, 0.02)',
    borderRadius: spacing.borderRadius.medium,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.05)',
  },
  secondaryStatValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: '400',
    color: '#FFFFFF',
    marginVertical: spacing.sm,
  },
  secondaryStatLabel: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
  },
  xpSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  xpCard: {
    backgroundColor: 'rgba(0, 102, 255, 0.02)',
    borderRadius: spacing.borderRadius.medium,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.05)',
  },
  xpLabel: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(0, 212, 255, 0.7)',
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  xpValue: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: '300',
    color: '#00D4FF',
    marginBottom: spacing.md,
  },
  xpBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#00D4FF',
  },
  incorrectSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: 'rgba(239, 68, 68, 0.02)',
    borderRadius: spacing.borderRadius.medium,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.1)',
  },
  incorrectTitle: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(239, 68, 68, 0.7)',
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  incorrectText: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.5)',
    lineHeight: typography.fontSize.sm * 1.5,
  },
  actions: {
    paddingHorizontal: spacing.lg,
  },
  primaryButton: {
    borderRadius: spacing.borderRadius.medium,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  buttonGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  secondaryButton: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderRadius: spacing.borderRadius.medium,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.md,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
  },
});