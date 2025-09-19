// src/screens/review/ReviewScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { FlipCard } from '../../components/cards/FlipCard';
import { PremiumButton } from '../../components/common/PremiumButton';
import { GlassCard } from '../../components/common/GlassCard';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Mock data for cards
const mockCards = [
  {
    id: 1,
    question: "What is the capital of France?",
    answer: "Paris is the capital and most populous city of France.",
    category: "Geography",
    difficulty: "easy" as const,
  },
  {
    id: 2,
    question: "What is React Native?",
    answer: "A framework for building native apps using React, developed by Facebook.",
    category: "Technology",
    difficulty: "medium" as const,
  },
  {
    id: 3,
    question: "What is the Pythagorean theorem?",
    answer: "a² + b² = c² - The square of the hypotenuse equals the sum of squares of the other two sides.",
    category: "Mathematics",
    difficulty: "medium" as const,
  },
];

export default function ReviewScreen({ navigation }: any) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    total: mockCards.length,
    completed: 0,
    correct: 0,
    streak: 0,
  });
  const swipeAnim = useRef(new Animated.ValueXY()).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const currentCard = mockCards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / mockCards.length) * 100;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dx) > 5;
      },
      onPanResponderMove: (_, gesture) => {
        swipeAnim.setValue({ x: gesture.dx, y: 0 });
        const opacity = 1 - Math.abs(gesture.dx) / (SCREEN_WIDTH / 2);
        opacityAnim.setValue(opacity);
      },
      onPanResponderRelease: (_, gesture) => {
        const swipeThreshold = SCREEN_WIDTH * 0.25;
        
        if (Math.abs(gesture.dx) > swipeThreshold) {
          // Card was swiped
          const direction = gesture.dx > 0 ? 'right' : 'left';
          handleSwipe(direction);
        } else {
          // Reset position
          Animated.spring(swipeAnim, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            tension: 40,
            useNativeDriver: false,
          }).start();
          Animated.spring(opacityAnim, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const handleSwipe = (direction: 'left' | 'right') => {
    const toValue = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    
    Animated.parallel([
      Animated.timing(swipeAnim, {
        toValue: { x: toValue, y: 0 },
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      handleRating(direction === 'right' ? 'correct' : 'again');
    });
  };

  const handleRating = (rating: 'again' | 'hard' | 'good' | 'correct') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Update stats based on rating
    const newStats = { ...sessionStats };
    newStats.completed += 1;
    
    if (rating === 'correct' || rating === 'good') {
      newStats.correct += 1;
      newStats.streak += 1;
    } else {
      newStats.streak = 0;
    }
    
    setSessionStats(newStats);
    
    // Move to next card
    if (currentCardIndex < mockCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsCardFlipped(false);
      // Reset animation values
      swipeAnim.setValue({ x: 0, y: 0 });
      opacityAnim.setValue(1);
    } else {
      // Session complete
      console.log('Session complete!', newStats);
    }
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
            <View style={styles.headerTop}>
              <Text style={styles.sessionTitle}>Daily Review</Text>
              <GlassCard style={styles.streakBadge}>
                <Text style={styles.streakText}>🔥 {sessionStats.streak}</Text>
              </GlassCard>
            </View>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={colors.gradients.primary as any}
                  style={[styles.progressFill, { width: `${progress}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
              <Text style={styles.progressText}>
                {currentCardIndex + 1} / {mockCards.length}
              </Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statNumber}>{sessionStats.completed}</Text>
              <Text style={styles.statLabel}>Reviewed</Text>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <Text style={[styles.statNumber, { color: colors.status.success }]}>
                {sessionStats.correct}
              </Text>
              <Text style={styles.statLabel}>Correct</Text>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <Text style={[styles.statNumber, { color: colors.gradients.accent[0] }]}>
                {sessionStats.correct > 0 
                  ? Math.round((sessionStats.correct / sessionStats.completed) * 100) 
                  : 0}%
              </Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </GlassCard>
          </View>

          {/* Card Container */}
          <View style={styles.cardContainer}>
            <Animated.View
              style={[
                styles.animatedCard,
                {
                  transform: [
                    { translateX: swipeAnim.x },
                    { rotate: swipeAnim.x.interpolate({
                      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
                      outputRange: ['-10deg', '0deg', '10deg'],
                    })},
                  ],
                  opacity: opacityAnim,
                },
              ]}
              {...panResponder.panHandlers}
            >
              <FlipCard
                question={currentCard.question}
                answer={currentCard.answer}
                category={currentCard.category}
                difficulty={currentCard.difficulty}
                onFlip={setIsCardFlipped}
              />
            </Animated.View>
          </View>

          {/* Rating Buttons */}
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingTitle}>
              {isCardFlipped ? 'How well did you know this?' : 'Flip the card first'}
            </Text>
            <View style={styles.ratingButtons}>
              <PremiumButton
                title="Again"
                onPress={() => handleRating('again')}
                variant="secondary"
                size="medium"
                disabled={!isCardFlipped}
                style={styles.ratingButton}
              />
              <PremiumButton
                title="Hard"
                onPress={() => handleRating('hard')}
                variant="accent"
                size="medium"
                disabled={!isCardFlipped}
                style={styles.ratingButton}
              />
              <PremiumButton
                title="Good"
                onPress={() => handleRating('good')}
                variant="primary"
                size="medium"
                disabled={!isCardFlipped}
                style={styles.ratingButton}
              />
              <PremiumButton
                title="Easy"
                onPress={() => handleRating('correct')}
                variant="primary"
                size="medium"
                disabled={!isCardFlipped}
                style={styles.ratingButton}
              />
            </View>
          </View>

          {/* Swipe Hint */}
          <View style={styles.swipeHint}>
            <Text style={styles.swipeHintText}>
              ← Swipe left for "Again" | Swipe right for "Easy" →
            </Text>
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
  sessionTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  streakBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  streakText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
  },
  progressContainer: {
    marginTop: spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.glass.light,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 0.3,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  cardContainer: {
    height: 420,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  animatedCard: {
    position: 'absolute',
  },
  ratingContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  ratingTitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingButton: {
    flex: 0.23,
  },
  swipeHint: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  swipeHintText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
});