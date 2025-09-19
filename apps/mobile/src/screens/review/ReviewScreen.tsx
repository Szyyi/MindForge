// src/screens/review/ReviewScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flipAnim = useRef(new Animated.Value(0)).current;
  const swipeAnim = useRef(new Animated.ValueXY()).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const currentCard = mockCards[currentCardIndex];
  const progress = (currentCardIndex / mockCards.length);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentCardIndex]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dx) > 5 && isCardFlipped;
      },
      onPanResponderMove: (_, gesture) => {
        swipeAnim.setValue({ x: gesture.dx, y: 0 });
      },
      onPanResponderRelease: (_, gesture) => {
        const swipeThreshold = SCREEN_WIDTH * 0.25;
        
        if (Math.abs(gesture.dx) > swipeThreshold && isCardFlipped) {
          const direction = gesture.dx > 0 ? 'right' : 'left';
          handleSwipe(direction);
        } else {
          Animated.spring(swipeAnim, {
            toValue: { x: 0, y: 0 },
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
    
    Animated.timing(swipeAnim, {
      toValue: { x: toValue, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      handleRating(direction === 'right' ? 4 : 1);
    });
  };

  const handleCardFlip = () => {
    if (!isCardFlipped) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsCardFlipped(true);
      Animated.timing(flipAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleRating = (rating: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const newStats = { ...sessionStats };
    newStats.completed += 1;
    
    if (rating >= 3) {
      newStats.correct += 1;
      newStats.streak += 1;
    } else {
      newStats.streak = 0;
    }
    
    setSessionStats(newStats);
    
    if (currentCardIndex < mockCards.length - 1) {
      // Fade out current card
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentCardIndex(currentCardIndex + 1);
        setIsCardFlipped(false);
        swipeAnim.setValue({ x: 0, y: 0 });
        flipAnim.setValue(0);
        scaleAnim.setValue(0.9);
        
        // Fade in new card
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      navigation.navigate('ReviewComplete', { stats: newStats });
    }
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0A0F']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Minimal Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="rgba(255, 255, 255, 0.5)" />
          </TouchableOpacity>
          
          <View style={styles.progressInfo}>
            <Text style={styles.cardCount}>{currentCardIndex + 1}/{mockCards.length}</Text>
          </View>
          
          <View style={styles.streakContainer}>
            {sessionStats.streak > 0 && (
              <>
                <Text style={styles.streakNumber}>{sessionStats.streak}</Text>
                <Ionicons name="flame" size={20} color="#0066FF" />
              </>
            )}
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill,
              { 
                width: `${progress * 100}%`,
              }
            ]}
          />
        </View>

        {/* Card Area */}
        <View style={styles.cardContainer}>
          <Animated.View
            style={[
              styles.card,
              {
                opacity: fadeAnim,
                transform: [
                  { translateX: swipeAnim.x },
                  { scale: scaleAnim },
                  { 
                    rotate: swipeAnim.x.interpolate({
                      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
                      outputRange: ['-8deg', '0deg', '8deg'],
                    })
                  },
                ],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <TouchableOpacity 
              activeOpacity={1}
              onPress={handleCardFlip}
              style={styles.cardTouchable}
            >
              {/* Front of card */}
              <Animated.View 
                style={[
                  styles.cardFace,
                  styles.cardFront,
                  {
                    transform: [{ rotateY: frontInterpolate }],
                  },
                ]}
              >
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{currentCard.category.toUpperCase()}</Text>
                </View>
                
                <View style={styles.cardContent}>
                  <Text style={styles.questionText}>{currentCard.question}</Text>
                </View>
                
                <View style={styles.tapHint}>
                  <Text style={styles.tapHintText}>TAP TO REVEAL</Text>
                </View>
              </Animated.View>

              {/* Back of card */}
              <Animated.View 
                style={[
                  styles.cardFace,
                  styles.cardBack,
                  {
                    transform: [{ rotateY: backInterpolate }],
                  },
                ]}
              >
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>ANSWER</Text>
                </View>
                
                <View style={styles.cardContent}>
                  <Text style={styles.answerText}>{currentCard.answer}</Text>
                </View>
                
                {isCardFlipped && (
                  <View style={styles.swipeIndicator}>
                    <Ionicons name="arrow-back" size={16} color="rgba(255, 0, 0, 0.3)" />
                    <Text style={styles.swipeText}>SWIPE OR TAP BELOW</Text>
                    <Ionicons name="arrow-forward" size={16} color="rgba(0, 255, 0, 0.3)" />
                  </View>
                )}
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Rating Buttons - Minimal */}
        <Animated.View 
          style={[
            styles.ratingContainer,
            { opacity: isCardFlipped ? 1 : 0.3 }
          ]}
        >
          <TouchableOpacity 
            style={[styles.ratingButton, styles.ratingButtonFail]}
            onPress={() => handleRating(1)}
            disabled={!isCardFlipped}
          >
            <Text style={styles.ratingNumber}>1</Text>
            <Text style={styles.ratingLabel}>AGAIN</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.ratingButton, styles.ratingButtonHard]}
            onPress={() => handleRating(2)}
            disabled={!isCardFlipped}
          >
            <Text style={styles.ratingNumber}>2</Text>
            <Text style={styles.ratingLabel}>HARD</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.ratingButton, styles.ratingButtonGood]}
            onPress={() => handleRating(3)}
            disabled={!isCardFlipped}
          >
            <Text style={styles.ratingNumber}>3</Text>
            <Text style={styles.ratingLabel}>GOOD</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.ratingButton, styles.ratingButtonEasy]}
            onPress={() => handleRating(4)}
            disabled={!isCardFlipped}
          >
            <Text style={styles.ratingNumber}>4</Text>
            <Text style={styles.ratingLabel}>EASY</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Minimal Stats */}
        <View style={styles.bottomStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{sessionStats.correct}</Text>
            <Text style={styles.statLabel}>CORRECT</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {sessionStats.completed > 0 
                ? Math.round((sessionStats.correct / sessionStats.completed) * 100) 
                : 0}%
            </Text>
            <Text style={styles.statLabel}>ACCURACY</Text>
          </View>
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
  progressInfo: {
    alignItems: 'center',
  },
  cardCount: {
    fontSize: typography.fontSize.md,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '300',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 40,
  },
  streakNumber: {
    fontSize: typography.fontSize.md,
    color: '#0066FF',
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: spacing.lg,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0066FF',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: SCREEN_WIDTH - (spacing.lg * 2),
    height: SCREEN_HEIGHT * 0.45,
    position: 'relative',
  },
  cardTouchable: {
    width: '100%',
    height: '100%',
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 102, 255, 0.02)',
    borderRadius: spacing.borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.1)',
    backfaceVisibility: 'hidden',
    padding: spacing.xl,
    justifyContent: 'space-between',
  },
  cardFront: {
    zIndex: 2,
  },
  cardBack: {
    transform: [{ rotateY: '180deg' }],
  },
  categoryBadge: {
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(0, 212, 255, 0.7)',
    letterSpacing: 2,
    fontWeight: '600',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionText: {
    fontSize: typography.fontSize.xxl,
    color: '#FFFFFF',
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: typography.fontSize.xxl * 1.4,
  },
  answerText: {
    fontSize: typography.fontSize.xl,
    color: '#FFFFFF',
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: typography.fontSize.xl * 1.5,
  },
  tapHint: {
    alignItems: 'center',
  },
  tapHintText: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.3)',
    letterSpacing: 2,
  },
  swipeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeText: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.3)',
    letterSpacing: 1,
    marginHorizontal: spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  ratingButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
    paddingVertical: spacing.lg,
    borderRadius: spacing.borderRadius.medium,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  ratingButtonFail: {
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  ratingButtonHard: {
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  ratingButtonGood: {
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  ratingButtonEasy: {
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  ratingNumber: {
    fontSize: typography.fontSize.xl,
    color: '#FFFFFF',
    fontWeight: '200',
    marginBottom: spacing.xs,
  },
  ratingLabel: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 1,
  },
  bottomStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '400',
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.3)',
    letterSpacing: 1,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});