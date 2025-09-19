// src/screens/learning/ReviewSessionScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SessionStats {
  totalCards: number;
  completed: number;
  correct: number;
  incorrect: number;
  timeSpent: number; // in seconds
  accuracy: number;
  streak: number;
  xpEarned: number;
}

export default function ReviewSessionScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalCards: 25,
    completed: 0,
    correct: 0,
    incorrect: 0,
    timeSpent: 0,
    accuracy: 0,
    streak: 0,
    xpEarned: 0,
  });
  
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionActive) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartSession = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSessionActive(true);
    navigation.navigate('Review');
  };

  const handlePauseSession = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSessionActive(false);
  };

  const handleEndSession = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setSessionActive(false);
    navigation.navigate('ResultScreen', { stats: sessionStats });
  };

  const progress = sessionStats.completed / sessionStats.totalCards;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0A0F']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="rgba(255, 255, 255, 0.5)" />
          </TouchableOpacity>
          
          <Text style={styles.timer}>{formatTime(sessionTime)}</Text>
          
          <TouchableOpacity 
            onPress={handlePauseSession}
            style={styles.pauseButton}
          >
            <Ionicons 
              name={sessionActive ? "pause" : "play"} 
              size={20} 
              color="rgba(255, 255, 255, 0.5)" 
            />
          </TouchableOpacity>
        </View>

        {/* Progress Ring */}
        <View style={styles.progressSection}>
          <View style={styles.progressRing}>
            {/* This would be replaced with a proper circular progress component */}
            <View style={styles.progressInner}>
              <Text style={styles.progressPercent}>
                {Math.round(progress * 100)}%
              </Text>
              <Text style={styles.progressLabel}>COMPLETE</Text>
            </View>
          </View>
          
          <Text style={styles.cardsRemaining}>
            {sessionStats.totalCards - sessionStats.completed} cards remaining
          </Text>
        </View>

        {/* Session Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <View style={styles.statHeader}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.statLabel}>CORRECT</Text>
              </View>
              <Text style={styles.statValue}>{sessionStats.correct}</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <View style={styles.statHeader}>
                <Ionicons name="close-circle" size={16} color="#EF4444" />
                <Text style={styles.statLabel}>INCORRECT</Text>
              </View>
              <Text style={styles.statValue}>{sessionStats.incorrect}</Text>
            </View>
          </View>
          
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <View style={styles.statHeader}>
                <Ionicons name="trending-up" size={16} color="#0066FF" />
                <Text style={styles.statLabel}>ACCURACY</Text>
              </View>
              <Text style={styles.statValue}>
                {sessionStats.completed > 0 
                  ? Math.round((sessionStats.correct / sessionStats.completed) * 100)
                  : 0}%
              </Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <View style={styles.statHeader}>
                <Ionicons name="flame" size={16} color="#F59E0B" />
                <Text style={styles.statLabel}>STREAK</Text>
              </View>
              <Text style={styles.statValue}>{sessionStats.streak}</Text>
            </View>
          </View>
        </View>

        {/* Session Controls */}
        <View style={styles.controls}>
          {!sessionActive && sessionStats.completed === 0 ? (
            <TouchableOpacity 
              style={styles.startButton}
              onPress={handleStartSession}
            >
              <LinearGradient
                colors={['#0066FF', '#0052CC'] as [string, string]}
                style={styles.startGradient}
              >
                <Text style={styles.startText}>START SESSION</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <>
              {sessionActive ? (
                <TouchableOpacity 
                  style={styles.continueButton}
                  onPress={() => navigation.navigate('Review')}
                >
                  <Text style={styles.continueText}>CONTINUE REVIEWING</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.resumeButton}
                  onPress={() => setSessionActive(true)}
                >
                  <Text style={styles.resumeText}>RESUME SESSION</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.endButton}
                onPress={handleEndSession}
              >
                <Text style={styles.endText}>END SESSION</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Tips */}
        <View style={styles.tips}>
          <Text style={styles.tipTitle}>SESSION TIPS</Text>
          <Text style={styles.tipText}>
            • Take your time with each card{'\n'}
            • Focus on understanding, not memorizing{'\n'}
            • Review incorrect cards again later
          </Text>
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: '#00D4FF',
    letterSpacing: 1,
  },
  pauseButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
  },
  progressSection: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  progressRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 8,
    borderColor: 'rgba(0, 102, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  progressInner: {
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 48,
    fontWeight: '200',
    color: '#FFFFFF',
    lineHeight: 48,
  },
  progressLabel: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 2,
    marginTop: spacing.xs,
  },
  cardsRemaining: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  statsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xxl,
  },
  statRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 102, 255, 0.02)',
    borderRadius: spacing.borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.05)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
    marginLeft: spacing.xs,
  },
  statValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '300',
    color: '#FFFFFF',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  controls: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  startButton: {
    borderRadius: spacing.borderRadius.medium,
    overflow: 'hidden',
  },
  startGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  startText: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  continueButton: {
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
    borderRadius: spacing.borderRadius.medium,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#0066FF',
  },
  continueText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: '#0066FF',
    letterSpacing: 1,
  },
  resumeButton: {
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
    borderRadius: spacing.borderRadius.medium,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
  },
  resumeText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: '#00D4FF',
    letterSpacing: 1,
  },
  endButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: spacing.borderRadius.medium,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  endText: {
    fontSize: typography.fontSize.md,
    color: '#EF4444',
    letterSpacing: 1,
  },
  tips: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  tipTitle: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(0, 212, 255, 0.7)',
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  tipText: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.4)',
    lineHeight: typography.fontSize.sm * 1.6,
  },
});