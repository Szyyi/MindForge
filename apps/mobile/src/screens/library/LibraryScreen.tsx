// src/screens/library/LibraryScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { GlassCard } from '../../components/common/GlassCard';
import { PremiumButton } from '../../components/common/PremiumButton';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

// Mock data for categories and decks
const mockCategories = [
  { id: '1', name: 'Technology', icon: '💻', color: colors.gradients.primary },
  { id: '2', name: 'Languages', icon: '🗣️', color: colors.gradients.secondary },
  { id: '3', name: 'Science', icon: '🔬', color: colors.gradients.accent },
  { id: '4', name: 'History', icon: '📚', color: colors.gradients.success },
  { id: '5', name: 'Mathematics', icon: '📐', color: colors.gradients.warning },
];

const mockDecks = [
  {
    id: '1',
    title: 'React Native Basics',
    category: 'Technology',
    cardCount: 45,
    dueToday: 12,
    progress: 68,
    lastStudied: '2 hours ago',
  },
  {
    id: '2',
    title: 'Spanish Vocabulary',
    category: 'Languages',
    cardCount: 120,
    dueToday: 8,
    progress: 45,
    lastStudied: 'Yesterday',
  },
  {
    id: '3',
    title: 'Physics Formulas',
    category: 'Science',
    cardCount: 30,
    dueToday: 5,
    progress: 80,
    lastStudied: '3 days ago',
  },
  {
    id: '4',
    title: 'World War II',
    category: 'History',
    cardCount: 75,
    dueToday: 15,
    progress: 35,
    lastStudied: 'Last week',
  },
];

export default function LibraryScreen({ navigation }: any) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const filteredDecks = mockDecks.filter(deck => {
    const matchesCategory = !selectedCategory || deck.category === selectedCategory;
    const matchesSearch = deck.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCategorySelect = (categoryName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(selectedCategory === categoryName ? null : categoryName);
  };

  const renderDeckCard = ({ item }: { item: typeof mockDecks[0] }) => {
    const category = mockCategories.find(c => c.name === item.category);
    
    return (
      <TouchableOpacity 
        style={styles.deckCard}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          // Navigate to deck details
        }}
      >
        <GlassCard style={styles.deckCardInner}>
          <View style={styles.deckHeader}>
            <View style={styles.deckTitleRow}>
              <Text style={styles.deckIcon}>{category?.icon}</Text>
              <View style={styles.deckTitleContainer}>
                <Text style={styles.deckTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.deckCategory}>{item.category}</Text>
              </View>
            </View>
            {item.dueToday > 0 && (
              <View style={styles.dueBadge}>
                <LinearGradient
                  colors={colors.gradients.accent as any}
                  style={styles.dueBadgeGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.dueText}>{item.dueToday} due</Text>
                </LinearGradient>
              </View>
            )}
          </View>

          <View style={styles.deckStats}>
            <View style={styles.statItem}>
              <Ionicons name="layers-outline" size={16} color={colors.text.tertiary} />
              <Text style={styles.statText}>{item.cardCount} cards</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color={colors.text.tertiary} />
              <Text style={styles.statText}>{item.lastStudied}</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressPercent}>{item.progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={category?.color || colors.gradients.primary as any}
                style={[styles.progressFill, { width: `${item.progress}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>
        </GlassCard>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Library</Text>
          <Text style={styles.subtitle}>
            {mockDecks.length} decks, {mockDecks.reduce((acc, d) => acc + d.cardCount, 0)} cards
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <GlassCard style={styles.searchBar}>
            <Ionicons name="search" size={20} color={colors.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search decks..."
              placeholderTextColor={colors.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
              </TouchableOpacity>
            )}
          </GlassCard>

          <TouchableOpacity
            style={styles.viewModeButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setViewMode(viewMode === 'grid' ? 'list' : 'grid');
            }}
          >
            <GlassCard style={styles.viewModeInner}>
              <Ionicons
                name={viewMode === 'grid' ? 'list' : 'grid'}
                size={20}
                color={colors.text.primary}
              />
            </GlassCard>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {mockCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => handleCategorySelect(category.name)}
            >
              <GlassCard
                style={{
                  ...styles.categoryChip,
                  ...(selectedCategory === category.name ? styles.categoryChipActive : {}),
                }}
              >
                <LinearGradient
                  colors={selectedCategory === category.name 
                    ? category.color as any
                    : [colors.glass.medium, colors.glass.light] as any
                  }
                  style={styles.categoryGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={[
                    styles.categoryName,
                    selectedCategory === category.name && styles.categoryNameActive
                  ]}>
                    {category.name}
                  </Text>
                </LinearGradient>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Add New Deck Button */}
        <View style={styles.addButtonContainer}>
          <PremiumButton
            title="+ Create New Deck"
            onPress={() => {
              // Navigate to create deck screen
            }}
            variant="primary"
            size="large"
            style={styles.addButton}
          />
        </View>

        {/* Decks List */}
        <FlatList
          data={filteredDecks}
          renderItem={renderDeckCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.decksList}
          showsVerticalScrollIndicator={false}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode} // Force re-render when view mode changes
        />
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
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  viewModeButton: {
    width: 48,
    height: 48,
  },
  viewModeInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  categoriesContainer: {
    maxHeight: 50,
    marginBottom: spacing.md,
  },
  categoriesContent: {
    paddingHorizontal: spacing.lg,
  },
  categoryChip: {
    marginRight: spacing.sm,
    padding: 0,
    overflow: 'hidden',
  },
  categoryChipActive: {
    transform: [{ scale: 1.05 }],
  },
  categoryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: spacing.xs,
  },
  categoryName: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  categoryNameActive: {
    color: colors.text.primary,
  },
  addButtonContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  addButton: {
    width: '100%',
  },
  decksList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  deckCard: {
    marginBottom: spacing.md,
    flex: 1,
  },
  deckCardInner: {
    padding: spacing.md,
  },
  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  deckTitleRow: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  deckIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  deckTitleContainer: {
    flex: 1,
  },
  deckTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  deckCategory: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  dueBadge: {
    borderRadius: spacing.borderRadius.small,
    overflow: 'hidden',
  },
  dueBadgeGradient: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  dueText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.text.primary,
  },
  deckStats: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  statText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginLeft: spacing.xs,
  },
  progressContainer: {
    marginTop: spacing.xs,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  progressPercent: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.glass.light,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});