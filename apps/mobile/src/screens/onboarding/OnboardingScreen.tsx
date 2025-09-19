// src/screens/onboarding/OnboardingScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

import { GlassCard } from '../../components/common/GlassCard';
import { PremiumButton } from '../../components/common/PremiumButton';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { completeOnboardingAsync } from '../../store/slices/userSlice';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: string[];
  features?: string[];
  animation?: 'pulse' | 'rotate' | 'bounce';
}

const slides: OnboardingSlide[] = [
  {
    title: 'Welcome to MindForge',
    subtitle: 'Transform knowledge into lasting memory through science-backed learning techniques',
    icon: 'sparkles',
    gradient: colors.gradients.premium,
    features: [
      '5-minute daily sessions',
      'AI-powered card generation',
      'Offline learning mode',
    ],
    animation: 'pulse',
  },
  {
    title: 'Spaced Repetition',
    subtitle: 'Review at optimal intervals to move knowledge from short-term to long-term memory',
    icon: 'refresh-circle',
    gradient: colors.gradients.primary,
    animation: 'rotate',
  },
  {
    title: 'Active Recall',
    subtitle: 'Test yourself actively instead of passive reading for 10x better retention',
    icon: 'bulb-outline',
    gradient: colors.gradients.secondary,
    animation: 'bounce',
  },
  {
    title: 'Track Your Progress',
    subtitle: 'Watch your knowledge grow with detailed analytics and achievement systems',
    icon: 'stats-chart',
    gradient: colors.gradients.accent,
    animation: 'pulse',
  },
  {
    title: 'Ready to Begin?',
    subtitle: 'Join thousands of learners who are forging their minds every day',
    icon: 'rocket',
    gradient: colors.gradients.holographic,
    animation: 'bounce',
  },
];
export default function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

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

    // Start icon animations
    startIconAnimation();
    
    // Update progress bar
    Animated.timing(progressAnim, {
      toValue: (currentSlide + 1) / slides.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentSlide]);

  const startIconAnimation = () => {
    const currentAnimation = slides[currentSlide].animation;
    
    if (currentAnimation === 'pulse') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else if (currentAnimation === 'rotate') {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();
    } else if (currentAnimation === 'bounce') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -15,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      scrollRef.current?.scrollTo({ x: width * nextSlide, animated: true });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Reset and restart animations
      rotateAnim.setValue(0);
      bounceAnim.setValue(0);
      scaleAnim.setValue(0.8);
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch(completeOnboardingAsync());
    navigation.navigate('Auth');
  };

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    dispatch(completeOnboardingAsync());
    navigation.navigate('Auth');
  };

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (slideIndex !== currentSlide) {
      setCurrentSlide(slideIndex);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    scrollRef.current?.scrollTo({ x: width * index, animated: true });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getAnimatedStyle = (animation?: string) => {
    switch (animation) {
      case 'rotate':
        return {
          transform: [
            { scale: scaleAnim },
            {
              rotate: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        };
      case 'bounce':
        return {
          transform: [
            { scale: scaleAnim },
            { translateY: bounceAnim },
          ],
        };
      case 'pulse':
      default:
        return {
          transform: [{ scale: scaleAnim }],
        };
    }
  };

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header with Skip */}
        <View style={styles.header}>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              >
                <LinearGradient
                  colors={colors.gradients.primary as any}
                  style={StyleSheet.absoluteFillObject}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </Animated.View>
            </View>
          </View>

          {/* Skip Button */}
          {currentSlide < slides.length - 1 && (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <BlurView intensity={20} style={styles.skipBlur}>
                <Text style={styles.skipText}>Skip</Text>
              </BlurView>
            </TouchableOpacity>
          )}
        </View>

        {/* Slides */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          {slides.map((slide, index) => (
            <Animated.View 
              key={index} 
              style={[
                styles.slide,
                { opacity: fadeAnim },
              ]}
            >
              <View style={styles.slideContent}>
                {/* Animated Icon Container */}
                <Animated.View style={getAnimatedStyle(slide.animation)}>
                  <LinearGradient
                    colors={slide.gradient as any}
                    style={styles.iconContainer}
                  >
                    <Ionicons 
                      name={slide.icon} 
                      size={72} 
                      color={colors.text.primary} 
                    />
                  </LinearGradient>
                </Animated.View>

                {/* Content */}
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.subtitle}>{slide.subtitle}</Text>

                {/* Features for first slide */}
                {slide.features && (
                  <View style={styles.features}>
                    {slide.features.map((feature, featureIndex) => (
                      <Animated.View
                        key={featureIndex}
                        style={{
                          opacity: fadeAnim,
                          transform: [{
                            translateX: fadeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-50, 0],
                            }),
                          }],
                        }}
                      >
                        <GlassCard style={styles.featureCard}>
                          <LinearGradient
                            colors={colors.gradients.success as any}
                            style={styles.featureIcon}
                          >
                            <Ionicons 
                              name="checkmark" 
                              size={16} 
                              color={colors.text.primary} 
                            />
                          </LinearGradient>
                          <Text style={styles.featureText}>{feature}</Text>
                        </GlassCard>
                      </Animated.View>
                    ))}
                  </View>
                )}

                {/* Stats for last slide */}
                {index === slides.length - 1 && (
                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>10K+</Text>
                      <Text style={styles.statLabel}>Active Users</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>95%</Text>
                      <Text style={styles.statLabel}>Retention Rate</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>4.9★</Text>
                      <Text style={styles.statLabel}>App Rating</Text>
                    </View>
                  </View>
                )}
              </View>
            </Animated.View>
          ))}
        </ScrollView>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Dots Indicator */}
          <View style={styles.dotsContainer}>
            {slides.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => goToSlide(index)}
              >
                <Animated.View
                  style={[
                    styles.dot,
                    currentSlide === index && styles.activeDot,
                    currentSlide === index && {
                      transform: [{ scale: scaleAnim }],
                    },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Action Buttons */}
          {currentSlide === slides.length - 1 ? (
            <View style={styles.finalButtons}>
              <PremiumButton
                title="Get Started"
                onPress={handleGetStarted}
                size="large"
                variant="primary"
                style={styles.button}
              />
              <TouchableOpacity onPress={handleSkip}>
                <Text style={styles.loginLink}>
                  Already have an account? <Text style={styles.loginLinkBold}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <PremiumButton
              title="Continue"
              onPress={handleNext}
              size="large"
              variant="secondary"
              style={styles.button}
            />
          )}
        </View>
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    zIndex: 10,
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.glass.light,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  skipButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.lg,
    borderRadius: spacing.borderRadius.small,
    overflow: 'hidden',
  },
  skipBlur: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  skipText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  slideContent: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
    shadowColor: colors.glow.purple,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.lg * 1.6,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  features: {
    width: '100%',
    marginTop: spacing.md,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  featureIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  featureText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.glass.border,
  },
  bottomSection: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.glass.medium,
    marginHorizontal: 6,
  },
  activeDot: {
    width: 28,
    height: 8,
    backgroundColor: colors.gradients.primary[0],
  },
  finalButtons: {
    width: '100%',
  },
  button: {
    width: '100%',
    marginBottom: spacing.md,
  },
  loginLink: {
    textAlign: 'center',
    color: colors.text.secondary,
    fontSize: typography.fontSize.md,
    marginTop: spacing.sm,
  },
  loginLinkBold: {
    color: colors.text.primary,
    fontWeight: '600',
  },
});