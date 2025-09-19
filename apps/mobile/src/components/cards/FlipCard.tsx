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
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
const CARD_HEIGHT = 400;

interface FlipCardProps {
  question: string;
  answer: string;
  category?: string;
  cardNumber?: number;
  totalCards?: number;
  onFlip?: (isFlipped: boolean) => void;
}

export const FlipCard: React.FC<FlipCardProps> = ({
  question,
  answer,
  category = 'GENERAL',
  cardNumber,
  totalCards,
  onFlip,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  const flipCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Small scale animation for feedback
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Flip animation
    const newValue = isFlipped ? 0 : 1;
    
    Animated.timing(flipAnimation, {
      toValue: newValue,
      duration: 400,
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

  const frontOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <TouchableWithoutFeedback onPress={flipCard}>
      <Animated.View style={[
        styles.container,
        { transform: [{ scale: scaleAnimation }] }
      ]}>
        {/* Front of Card - Question */}
        <Animated.View 
          style={[
            styles.card,
            {
              transform: [{ rotateY: frontInterpolate }],
              opacity: frontOpacity,
            },
          ]}
        >
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.categoryText}>{category.toUpperCase()}</Text>
            {cardNumber && totalCards && (
              <Text style={styles.cardCounter}>{cardNumber}/{totalCards}</Text>
            )}
          </View>

          {/* Question Content */}
          <View style={styles.contentContainer}>
            <View style={styles.questionMark}>
              <Text style={styles.questionMarkText}>?</Text>
            </View>
            <Text style={styles.questionText}>{question}</Text>
          </View>

          {/* Tap Hint */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>TAP TO REVEAL</Text>
          </View>
        </Animated.View>

        {/* Back of Card - Answer */}
        <Animated.View 
          style={[
            styles.card,
            styles.cardBack,
            {
              transform: [{ rotateY: backInterpolate }],
              opacity: backOpacity,
            },
          ]}
        >
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.answerLabel}>ANSWER</Text>
            {cardNumber && totalCards && (
              <Text style={styles.cardCounter}>{cardNumber}/{totalCards}</Text>
            )}
          </View>

          {/* Answer Content */}
          <View style={styles.contentContainer}>
            <Text style={styles.answerText}>{answer}</Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerDots}>
              <View style={[styles.dot, styles.dotInactive]} />
              <View style={[styles.dot, styles.dotActive]} />
            </View>
            <Text style={styles.footerText}>RATE YOUR RECALL</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'relative',
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: spacing.borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.1)',
    padding: spacing.xl,
    backfaceVisibility: 'hidden',
    justifyContent: 'space-between',
  },
  cardBack: {
    backgroundColor: 'rgba(0, 102, 255, 0.02)',
    borderColor: 'rgba(0, 102, 255, 0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(0, 212, 255, 0.7)',
    fontWeight: '600',
    letterSpacing: 2,
  },
  answerLabel: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(0, 212, 255, 0.7)',
    fontWeight: '600',
    letterSpacing: 2,
  },
  cardCounter: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.3)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  questionMark: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 102, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  questionMarkText: {
    fontSize: 28,
    color: '#0066FF',
    fontWeight: '300',
  },
  questionText: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '300',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: typography.fontSize.xxl * 1.4,
    paddingHorizontal: spacing.md,
  },
  answerText: {
    fontSize: typography.fontSize.xl,
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: typography.fontSize.xl * 1.5,
    paddingHorizontal: spacing.md,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.3)',
    letterSpacing: 2,
  },
  footerDots: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: '#0066FF',
  },
  dotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});