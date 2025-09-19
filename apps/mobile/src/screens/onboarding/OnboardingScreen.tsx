// ============================================
// src/screens/onboarding/OnboardingScreen.tsx
// ============================================
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { GlassCard } from '../../components/common/GlassCard';
import { PremiumButton } from '../../components/common/PremiumButton';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { completeOnboarding } from '../../store/slices/userSlice';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: string[];
}

const slides: OnboardingSlide[] = [
  {
    title: 'Welcome to MindForge',
    subtitle: 'Transform knowledge into lasting memory through science-backed learning techniques',
    icon: 'sparkles',
    gradient: colors.gradients.primary,
  },
  {
    title: 'Spaced Repetition',
    subtitle: 'Review at optimal intervals to move knowledge from short-term to long-term memory',
    icon: 'refresh-circle',
    gradient: colors.gradients.secondary,
  },
  {
    title: 'Active Recall',
    subtitle: 'Test yourself actively instead of passive reading for 10x better retention',
    icon: 'ban',
    gradient: colors.gradients.accent,
  },
  {
    title: 'Track Your Progress',
    subtitle: 'Watch your knowledge grow with detailed analytics and achievement systems',
    icon: 'stats-chart',
    gradient: colors.gradients.success,
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      scrollRef.current?.scrollTo({ x: width * nextSlide, animated: true });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSkip = () => {
    dispatch(completeOnboarding());
    navigation.navigate('Auth');
  };

  const handleGetStarted = () => {
    dispatch(completeOnboarding());
    navigation.navigate('Auth');
  };

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slideIndex);
  };

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Skip Button */}
        {currentSlide < slides.length - 1 && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}

        {/* Slides */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {slides.map((slide, index) => (
            <View key={index} style={styles.slide}>
              <View style={styles.slideContent}>
                {/* Icon */}
                <LinearGradient
                  colors={slide.gradient as any}
                  style={styles.iconContainer}
                >
                  <Ionicons 
                    name={slide.icon} 
                    size={64} 
                    color={colors.text.primary} 
                  />
                </LinearGradient>

                {/* Content */}
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.subtitle}>{slide.subtitle}</Text>

                {/* Feature List for first slide */}
                {index === 0 && (
                  <View style={styles.features}>
                    <GlassCard style={styles.featureCard}>
                      <Ionicons name="checkmark-circle" size={20} color={colors.status.success} />
                      <Text style={styles.featureText}>5-minute daily sessions</Text>
                    </GlassCard>
                    <GlassCard style={styles.featureCard}>
                      <Ionicons name="checkmark-circle" size={20} color={colors.status.success} />
                      <Text style={styles.featureText}>AI-powered card generation</Text>
                    </GlassCard>
                    <GlassCard style={styles.featureCard}>
                      <Ionicons name="checkmark-circle" size={20} color={colors.status.success} />
                      <Text style={styles.featureText}>Offline learning mode</Text>
                    </GlassCard>
                  </View>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Dots Indicator */}
          <View style={styles.dotsContainer}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentSlide === index && styles.activeDot,
                ]}
              />
            ))}
          </View>

          {/* Action Button */}
          {currentSlide === slides.length - 1 ? (
            <PremiumButton
              title="Get Started"
              onPress={handleGetStarted}
              size="large"
              style={styles.button}
            />
          ) : (
            <PremiumButton
              title="Next"
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
  skipButton: {
    position: 'absolute',
    top: 60,
    right: spacing.lg,
    zIndex: 10,
  },
  skipText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.md,
  },
  slide: {
    width: width,
    height: height * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  slideContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.lg * typography.lineHeight.relaxed,
    paddingHorizontal: spacing.lg,
  },
  features: {
    marginTop: spacing.xl,
    width: '100%',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  featureText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.md,
    marginLeft: spacing.sm,
  },
  bottomSection: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.glass.medium,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.gradients.primary[0],
  },
  button: {
    width: '100%',
  },
});