// src/screens/home/HomeScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const { stats } = useSelector((state: RootState) => state.user);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Mock data - minimal
  const dailyProgress = 0.6; // 60% complete
  const streak = 7;
  const cardsToday = 25;
  const cardsCompleted = 15;
  const nextReviewTime = "2h 15m";

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    
    // Smooth entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: dailyProgress,
        duration: 1500,
        delay: 500,
        useNativeDriver: false,
      }),
    ]).start();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={styles.container}>
      {/* Pure Black Background */}
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
          {/* Minimal Header */}
          <Animated.View 
            style={[
              styles.header,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.date}>
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
            
            {/* Profile Avatar */}
            <TouchableOpacity 
              onPress={() => navigation.navigate('Profile')}
              style={styles.profileButton}
            >
              <LinearGradient
                colors={['#0066FF', '#003D99'] as [string, string, ...string[]]}
                style={styles.profileGradient}
              >
                <Ionicons name="person" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Main Stats Card - Ultra Minimal */}
          <Animated.View 
            style={[
              styles.mainCard,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Streak Counter */}
            <View style={styles.streakContainer}>
              <Text style={styles.streakNumber}>{streak}</Text>
              <Text style={styles.streakLabel}>DAY STREAK</Text>
            </View>

            {/* Progress Ring */}
            <View style={styles.progressContainer}>
              <View style={styles.progressRing}>
                <Animated.View style={styles.progressRingOuter}>
                  {/* This would be replaced with a proper circular progress component */}
                  <View style={styles.progressInner}>
                    <Text style={styles.progressPercent}>
                      {Math.round(dailyProgress * 100)}%
                    </Text>
                    <Text style={styles.progressLabel}>COMPLETE</Text>
                  </View>
                </Animated.View>
              </View>
              
              {/* Cards Info */}
              <View style={styles.cardsInfo}>
                <Text style={styles.cardsCompleted}>{cardsCompleted}</Text>
                <Text style={styles.cardsDivider}>/</Text>
                <Text style={styles.cardsTotal}>{cardsToday}</Text>
                <Text style={styles.cardsLabel}>cards today</Text>
              </View>
            </View>

            {/* Next Review Timer */}
            <View style={styles.timerContainer}>
              <Ionicons name="time-outline" size={16} color="#00D4FF" />
              <Text style={styles.timerText}>Next review in {nextReviewTime}</Text>
            </View>
          </Animated.View>

          {/* Primary Action Button */}
          <Animated.View 
            style={[
              styles.actionContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                navigation.navigate('Review');
              }}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#0066FF', '#0052CC'] as [string, string, ...string[]]}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>START REVIEW</Text>
                <View style={styles.buttonSubtext}>
                  <Text style={styles.buttonCards}>
                    {cardsToday - cardsCompleted} cards
                  </Text>
                  <Text style={styles.buttonTime}>~5 min</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Quick Stats Grid - Minimal */}
          <Animated.View 
            style={[
              styles.statsGrid,
              { opacity: fadeAnim }
            ]}
          >
            <TouchableOpacity 
              style={styles.statCard}
              onPress={() => navigation.navigate('Stats')}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="trending-up" size={20} color="#00D4FF" />
              </View>
              <Text style={styles.statValue}>85%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.statCard}
              onPress={() => navigation.navigate('Library')}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="layers-outline" size={20} color="#00D4FF" />
              </View>
              <Text style={styles.statValue}>142</Text>
              <Text style={styles.statLabel}>Total Cards</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.statCard}
              onPress={() => navigation.navigate('Stats')}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="trophy-outline" size={20} color="#00D4FF" />
              </View>
              <Text style={styles.statValue}>LVL 5</Text>
              <Text style={styles.statLabel}>Rank</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Categories Section - Simplified */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Library')}>
                <Ionicons name="arrow-forward" size={20} color="#0066FF" />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
            >
              {['Technology', 'Languages', 'Science'].map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.categoryCard}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate('Library');
                  }}
                >
                  <LinearGradient
                    colors={['rgba(0, 102, 255, 0.1)', 'rgba(0, 102, 255, 0.05)'] as [string, string]}
                    style={styles.categoryGradient}
                  >
                    <Text style={styles.categoryName}>{category}</Text>
                    <View style={styles.categoryBottom}>
                      <Text style={styles.categoryCount}>
                        {20 + index * 8} cards
                      </Text>
                      {index === 0 && (
                        <View style={styles.dueBadge}>
                          <Text style={styles.dueText}>5 DUE</Text>
                        </View>
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Add New Card Quick Action */}
          <TouchableOpacity
            style={styles.addCardButton}
            onPress={() => navigation.navigate('Library')}
          >
            <Ionicons name="add-circle-outline" size={24} color="#0066FF" />
            <Text style={styles.addCardText}>Add New Cards</Text>
          </TouchableOpacity>
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  greeting: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  date: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: spacing.xs,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    backgroundColor: 'rgba(0, 102, 255, 0.03)',
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.1)',
  },
  streakContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  streakNumber: {
    fontSize: 72,
    fontWeight: '200',
    color: '#FFFFFF',
    lineHeight: 72,
  },
  streakLabel: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(0, 212, 255, 0.7)',
    letterSpacing: 2,
    marginTop: spacing.xs,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  progressRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: 'rgba(0, 102, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  progressRingOuter: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: '#0066FF',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  },
  progressInner: {
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: '300',
    color: '#FFFFFF',
  },
  progressLabel: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
  },
  cardsInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cardsCompleted: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '400',
    color: '#00D4FF',
  },
  cardsDivider: {
    fontSize: typography.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: spacing.xs,
  },
  cardsTotal: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  cardsLabel: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.5)',
    marginLeft: spacing.sm,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(0, 212, 255, 0.7)',
    marginLeft: spacing.xs,
  },
  actionContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xxl,
  },
  primaryButton: {
    borderRadius: spacing.borderRadius.large,
    overflow: 'hidden',
    elevation: 0,
  },
  buttonGradient: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  buttonSubtext: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  buttonCards: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  buttonTime: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(0, 102, 255, 0.02)',
    borderRadius: spacing.borderRadius.large,
    padding: spacing.lg,
    marginHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.05)',
    alignItems: 'center',
  },
  statIconContainer: {
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  categoriesScroll: {
    paddingLeft: spacing.lg,
  },
  categoryCard: {
    width: SCREEN_WIDTH * 0.35,
    marginRight: spacing.md,
    borderRadius: spacing.borderRadius.medium,
    overflow: 'hidden',
  },
  categoryGradient: {
    padding: spacing.md,
    minHeight: 80,
    justifyContent: 'space-between',
  },
  categoryName: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  categoryBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryCount: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  dueBadge: {
    backgroundColor: '#0066FF',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: spacing.borderRadius.small,
  },
  dueText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: spacing.borderRadius.medium,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.2)',
    borderStyle: 'dashed',
  },
  addCardText: {
    fontSize: typography.fontSize.md,
    color: '#0066FF',
    marginLeft: spacing.sm,
  },
});