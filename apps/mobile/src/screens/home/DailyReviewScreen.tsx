// src/screens/home/DailyReviewScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DueCategory {
  id: string;
  name: string;
  dueCards: number;
  estimatedTime: number;
  difficulty: number; // 1-5 scale
  lastReviewed: string;
  color: string;
}

interface DailyStats {
  totalDue: number;
  completedToday: number;
  streak: number;
  estimatedTotalTime: number;
  categories: DueCategory[];
}

export default function DailyReviewScreen() {
  const navigation = useNavigation<any>();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const dailyStats: DailyStats = {
    totalDue: 47,
    completedToday: 15,
    streak: 7,
    estimatedTotalTime: 25,
    categories: [
      {
        id: '1',
        name: 'Technology',
        dueCards: 12,
        estimatedTime: 6,
        difficulty: 3,
        lastReviewed: '2 hours ago',
        color: '#0066FF',
      },
      {
        id: '2',
        name: 'Languages',
        dueCards: 8,
        estimatedTime: 4,
        difficulty: 2,
        lastReviewed: 'Yesterday',
        color: '#00D4FF',
      },
      {
        id: '3',
        name: 'Science',
        dueCards: 15,
        estimatedTime: 8,
        difficulty: 4,
        lastReviewed: '3 days ago',
        color: '#4F46E5',
      },
      {
        id: '4',
        name: 'History',
        dueCards: 5,
        estimatedTime: 3,
        difficulty: 2,
        lastReviewed: 'Yesterday',
        color: '#7C3AED',
      },
      {
        id: '5',
        name: 'Mathematics',
        dueCards: 7,
        estimatedTime: 4,
        difficulty: 5,
        lastReviewed: 'Last week',
        color: '#06B6D4',
      },
    ],
  };

  const toggleCategory = (categoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const selectAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedCategories.length === dailyStats.categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(dailyStats.categories.map(c => c.id));
    }
  };

  const handleStartReview = () => {
    if (selectedCategories.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('ReviewSession', { 
      categories: selectedCategories 
    });
  };

  const selectedCards = dailyStats.categories
    .filter(c => selectedCategories.includes(c.id))
    .reduce((sum, c) => sum + c.dueCards, 0);

  const selectedTime = dailyStats.categories
    .filter(c => selectedCategories.includes(c.id))
    .reduce((sum, c) => sum + c.estimatedTime, 0);

  const renderDifficultyDots = (difficulty: number) => {
    return (
      <View style={styles.difficultyContainer}>
        {[1, 2, 3, 4, 5].map((level) => (
          <View
            key={level}
            style={[
              styles.difficultyDot,
              level <= difficulty && styles.difficultyDotActive,
            ]}
          />
        ))}
      </View>
    );
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
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <Text style={styles.title}>Daily Review</Text>
              <Text style={styles.subtitle}>
                {dailyStats.totalDue} cards due today
              </Text>
            </View>
          </View>

          {/* Daily Progress */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>TODAY'S PROGRESS</Text>
              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={16} color="#F59E0B" />
                <Text style={styles.streakText}>{dailyStats.streak} day streak</Text>
              </View>
            </View>
            
            <View style={styles.progressBar}>
              <LinearGradient
                colors={['#0066FF', '#00D4FF'] as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.progressFill,
                  { width: `${(dailyStats.completedToday / dailyStats.totalDue) * 100}%` }
                ]}
              />
            </View>
            
            <View style={styles.progressStats}>
              <Text style={styles.progressStatText}>
                {dailyStats.completedToday} / {dailyStats.totalDue} completed
              </Text>
              <Text style={styles.progressStatText}>
                ~{dailyStats.estimatedTotalTime} min remaining
              </Text>
            </View>
          </View>

          {/* Select All */}
          <TouchableOpacity 
            style={styles.selectAllButton}
            onPress={selectAll}
          >
            <Text style={styles.selectAllText}>
              {selectedCategories.length === dailyStats.categories.length
                ? 'DESELECT ALL'
                : 'SELECT ALL'}
            </Text>
            <View style={styles.selectAllBadge}>
              <Text style={styles.selectAllBadgeText}>
                {selectedCategories.length}/{dailyStats.categories.length}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Categories */}
          <View style={styles.categoriesSection}>
            {dailyStats.categories.map((category) => {
              const isSelected = selectedCategories.includes(category.id);
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    isSelected && styles.categoryCardSelected,
                  ]}
                  onPress={() => toggleCategory(category.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.categoryLeft}>
                    <View style={[styles.categoryIndicator, { backgroundColor: category.color }]} />
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName}>{category.name.toUpperCase()}</Text>
                      <View style={styles.categoryMeta}>
                        <Text style={styles.categoryMetaText}>
                          {category.dueCards} cards • ~{category.estimatedTime} min
                        </Text>
                        {renderDifficultyDots(category.difficulty)}
                      </View>
                      <Text style={styles.lastReviewedText}>
                        Last: {category.lastReviewed}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.categoryRight}>
                    <View style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected
                    ]}>
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Smart Suggestions */}
          <View style={styles.suggestionsCard}>
            <View style={styles.suggestionHeader}>
              <Ionicons name="sparkles" size={16} color="#00D4FF" />
              <Text style={styles.suggestionTitle}>SMART SUGGESTION</Text>
            </View>
            <Text style={styles.suggestionText}>
              Focus on Mathematics and Science today - they have the oldest reviews and highest difficulty.
            </Text>
          </View>

          {/* Bottom Section with Summary */}
          {selectedCategories.length > 0 && (
            <View style={styles.summarySection}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Ionicons name="albums-outline" size={16} color="rgba(255, 255, 255, 0.5)" />
                  <Text style={styles.summaryValue}>{selectedCards}</Text>
                  <Text style={styles.summaryLabel}>cards</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Ionicons name="time-outline" size={16} color="rgba(255, 255, 255, 0.5)" />
                  <Text style={styles.summaryValue}>~{selectedTime}</Text>
                  <Text style={styles.summaryLabel}>minutes</Text>
                </View>
              </View>
            </View>
          )}

          {/* Start Review Button */}
          <TouchableOpacity 
            style={[
              styles.startButton,
              selectedCategories.length === 0 && styles.startButtonDisabled
            ]}
            onPress={handleStartReview}
            disabled={selectedCategories.length === 0}
          >
            <LinearGradient
              colors={
                selectedCategories.length > 0 
                  ? ['#0066FF', '#0052CC'] 
                  : ['#1a1a1a', '#1a1a1a'] as [string, string]
              }
              style={styles.startGradient}
            >
              <Ionicons name="play" size={20} color="#FFFFFF" />
              <Text style={styles.startText}>START DAILY REVIEW</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Skip Option */}
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.skipText}>Skip for today</Text>
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
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: spacing.xs,
  },
  progressCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: 'rgba(0, 102, 255, 0.02)',
    borderRadius: spacing.borderRadius.medium,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.05)',
    marginBottom: spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressTitle: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 2,
    fontWeight: '600',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: spacing.borderRadius.small,
    gap: spacing.xs,
  },
  streakText: {
    fontSize: typography.fontSize.xs,
    color: '#F59E0B',
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStatText: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  selectAllButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  selectAllText: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(0, 212, 255, 0.7)',
    letterSpacing: 2,
    fontWeight: '600',
  },
  selectAllBadge: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: spacing.borderRadius.small,
  },
  selectAllBadgeText: {
    fontSize: typography.fontSize.xs,
    color: '#00D4FF',
  },
  categoriesSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  categoryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: spacing.borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  categoryCardSelected: {
    backgroundColor: 'rgba(0, 102, 255, 0.05)',
    borderColor: '#0066FF',
  },
  categoryLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIndicator: {
    width: 3,
    height: 40,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  categoryMetaText: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  difficultyDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  difficultyDotActive: {
    backgroundColor: '#00D4FF',
  },
  lastReviewedText: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.3)',
  },
  categoryRight: {
    marginLeft: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: spacing.borderRadius.small,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#0066FF',
    borderColor: '#0066FF',
  },
  suggestionsCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: 'rgba(0, 212, 255, 0.02)',
    borderRadius: spacing.borderRadius.medium,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.05)',
    marginBottom: spacing.xl,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  suggestionTitle: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(0, 212, 255, 0.7)',
    letterSpacing: 2,
    fontWeight: '600',
  },
  suggestionText: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: typography.fontSize.sm * 1.5,
  },
  summarySection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: spacing.borderRadius.medium,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  summaryValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: '300',
    color: '#FFFFFF',
  },
  summaryLabel: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: spacing.lg,
  },
  startButton: {
    marginHorizontal: spacing.lg,
    borderRadius: spacing.borderRadius.medium,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startGradient: {
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  startText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  skipText: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.3)',
  },
});