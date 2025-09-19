// src/components/cards/FlipCard.tsx
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
const CARD_HEIGHT = 400;

interface FlipCardProps {
  question: string;
  answer: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  onFlip?: (isFlipped: boolean) => void;
}

export const FlipCard: React.FC<FlipCardProps> = ({
  question,
  answer,
  category = 'General',
  difficulty = 'medium',
  onFlip,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const difficultyColors = {
    easy: colors.status.success,
    medium: colors.gradients.primary[0],
    hard: colors.status.warning,
  };

  const flipCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const newValue = isFlipped ? 0 : 1;
    
    Animated.spring(flipAnimation, {
      toValue: newValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();

    setIsFlipped(!isFlipped);
    onFlip?.(!isFlipped);
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  return (
    <TouchableWithoutFeedback onPress={flipCard}>
      <View style={styles.container}>
        {/* Front of Card */}
        <Animated.View style={[styles.cardContainer, frontAnimatedStyle]}>
          <View style={[styles.card, shadows.large]}>
            <BlurView intensity={30} style={styles.blurView} tint="dark">
              <LinearGradient
                colors={[colors.glass.medium, colors.glass.light]}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.categoryBadge}>
                  <LinearGradient
                    colors={colors.gradients.primary as any}
                    style={styles.categoryGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.categoryText}>{category}</Text>
                  </LinearGradient>
                </View>
                
                <View style={[styles.difficultyIndicator, { backgroundColor: difficultyColors[difficulty] }]} />
              </View>

              {/* Question Content */}
              <View style={styles.contentContainer}>
                <Text style={styles.label}>QUESTION</Text>
                <Text style={styles.questionText}>{question}</Text>
              </View>

              {/* Tap Hint */}
              <View style={styles.hintContainer}>
                <Text style={styles.hintText}>Tap to reveal answer</Text>
              </View>
            </BlurView>
          </View>
        </Animated.View>

        {/* Back of Card */}
        <Animated.View style={[styles.cardContainer, styles.cardBack, backAnimatedStyle]}>
          <View style={[styles.card, shadows.large]}>
            <BlurView intensity={30} style={styles.blurView} tint="dark">
              <LinearGradient
                colors={[colors.gradients.secondary[0], colors.glass.medium] as any}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />

              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.categoryBadge}>
                  <LinearGradient
                    colors={colors.gradients.accent as any}
                    style={styles.categoryGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.categoryText}>{category}</Text>
                  </LinearGradient>
                </View>
              </View>

              {/* Answer Content */}
              <View style={styles.contentContainer}>
                <Text style={styles.label}>ANSWER</Text>
                <Text style={styles.answerText}>{answer}</Text>
              </View>

              {/* Tap Hint */}
              <View style={styles.hintContainer}>
                <Text style={styles.hintText}>Tap to see question</Text>
              </View>
            </BlurView>
          </View>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    position: 'absolute',
    top: 0,
  },
  card: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: colors.glass.light,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  blurView: {
    flex: 1,
    padding: spacing.xl,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  categoryBadge: {
    borderRadius: spacing.borderRadius.small,
    overflow: 'hidden',
  },
  categoryGradient: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  categoryText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  difficultyIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: spacing.lg,
  },
  questionText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xxl,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: typography.fontSize.xxl * 1.4,
  },
  answerText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: typography.fontSize.xl * 1.5,
  },
  hintContainer: {
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  hintText: {
    color: colors.text.muted,
    fontSize: typography.fontSize.sm,
    fontStyle: 'italic',
  },
});