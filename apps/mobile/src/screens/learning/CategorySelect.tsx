// src/screens/learning/CategorySelectScreen.tsx
import React, { useState } from 'react';
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

const categories = [
  { id: '1', name: 'TECHNOLOGY', cards: 245, due: 12, color: '#0066FF' },
  { id: '2', name: 'LANGUAGES', cards: 180, due: 8, color: '#00D4FF' },
  { id: '3', name: 'SCIENCE', cards: 120, due: 5, color: '#4F46E5' },
  { id: '4', name: 'HISTORY', cards: 95, due: 0, color: '#7C3AED' },
  { id: '5', name: 'MATHEMATICS', cards: 60, due: 3, color: '#06B6D4' },
  { id: '6', name: 'ALL CATEGORIES', cards: 700, due: 28, color: '#FFFFFF' },
];

export default function CategorySelectScreen() {
  const navigation = useNavigation<any>();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Navigate to review with selected category
    setTimeout(() => {
      navigation.navigate('Review', { categoryId });
    }, 200);
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
              <Text style={styles.title}>Choose Category</Text>
              <Text style={styles.subtitle}>Select what you want to review</Text>
            </View>
          </View>

          {/* Categories Grid */}
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.categoryCardSelected
                ]}
                onPress={() => handleCategorySelect(category.id)}
                activeOpacity={0.7}
              >
                {/* Category Color Indicator */}
                <View style={[styles.colorIndicator, { backgroundColor: category.color }]} />
                
                {/* Category Content */}
                <View style={styles.categoryContent}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  
                  <View style={styles.categoryStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{category.cards}</Text>
                      <Text style={styles.statLabel}>TOTAL</Text>
                    </View>
                    
                    {category.due > 0 && (
                      <>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                          <Text style={[styles.statValue, styles.dueValue]}>{category.due}</Text>
                          <Text style={[styles.statLabel, styles.dueLabel]}>DUE</Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>

                {/* Arrow */}
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color="rgba(255, 255, 255, 0.2)" 
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Start */}
          <View style={styles.quickStart}>
            <Text style={styles.quickStartText}>Or continue where you left off</Text>
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={() => navigation.navigate('Review')}
            >
              <LinearGradient
                colors={['#0066FF', '#0052CC'] as [string, string]}
                style={styles.continueGradient}
              >
                <Text style={styles.continueText}>CONTINUE LAST SESSION</Text>
              </LinearGradient>
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
  categoriesGrid: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: spacing.borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  categoryCardSelected: {
    borderColor: '#0066FF',
    backgroundColor: 'rgba(0, 102, 255, 0.05)',
  },
  colorIndicator: {
    width: 3,
    height: 40,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  categoryContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  categoryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.7)',
    marginRight: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.3)',
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: spacing.md,
  },
  dueValue: {
    color: '#00D4FF',
  },
  dueLabel: {
    color: 'rgba(0, 212, 255, 0.7)',
  },
  quickStart: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  quickStartText: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.3)',
    marginBottom: spacing.md,
  },
  continueButton: {
    width: '100%',
    borderRadius: spacing.borderRadius.medium,
    overflow: 'hidden',
  },
  continueGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  continueText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});