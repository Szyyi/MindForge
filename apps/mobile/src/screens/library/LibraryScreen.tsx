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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data
const mockCategories = [
  { id: '1', name: 'ALL', count: 4 },
  { id: '2', name: 'TECHNOLOGY', count: 1 },
  { id: '3', name: 'LANGUAGES', count: 1 },
  { id: '4', name: 'SCIENCE', count: 1 },
  { id: '5', name: 'HISTORY', count: 1 },
];

const mockDecks = [
  {
    id: '1',
    title: 'React Native Basics',
    category: 'TECHNOLOGY',
    cardCount: 45,
    dueCount: 12,
    mastered: 31,
    lastReview: new Date(Date.now() - 7200000), // 2 hours ago
  },
  {
    id: '2',
    title: 'Spanish Vocabulary',
    category: 'LANGUAGES',
    cardCount: 120,
    dueCount: 8,
    mastered: 54,
    lastReview: new Date(Date.now() - 86400000), // Yesterday
  },
  {
    id: '3',
    title: 'Physics Formulas',
    category: 'SCIENCE',
    cardCount: 30,
    dueCount: 5,
    mastered: 24,
    lastReview: new Date(Date.now() - 259200000), // 3 days ago
  },
  {
    id: '4',
    title: 'World War II',
    category: 'HISTORY',
    cardCount: 75,
    dueCount: 15,
    mastered: 26,
    lastReview: new Date(Date.now() - 604800000), // Last week
  },
];

export default function LibraryScreen({ navigation }: any) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const filteredDecks = mockDecks.filter(deck => {
    const matchesCategory = selectedCategory === 'ALL' || deck.category === selectedCategory;
    const matchesSearch = deck.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalCards = filteredDecks.reduce((acc, deck) => acc + deck.cardCount, 0);
  const totalDue = filteredDecks.reduce((acc, deck) => acc + deck.dueCount, 0);

  const getTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  const renderDeck = ({ item }: { item: typeof mockDecks[0] }) => {
    const progress = (item.mastered / item.cardCount);
    
    return (
      <TouchableOpacity 
        style={styles.deckCard}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          // Navigate to deck details
        }}
        activeOpacity={0.7}
      >
        {/* Deck Title and Category */}
        <View style={styles.deckHeader}>
          <View style={styles.deckTitleContainer}>
            <Text style={styles.deckTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.deckCategory}>{item.category}</Text>
          </View>
          
          {item.dueCount > 0 && (
            <View style={styles.dueBadge}>
              <Text style={styles.dueCount}>{item.dueCount}</Text>
              <Text style={styles.dueLabel}>DUE</Text>
            </View>
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.deckStats}>
          <View style={styles.statGroup}>
            <Text style={styles.statValue}>{item.cardCount}</Text>
            <Text style={styles.statLabel}>CARDS</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statGroup}>
            <Text style={styles.statValue}>{item.mastered}</Text>
            <Text style={styles.statLabel}>MASTERED</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statGroup}>
            <Text style={styles.statValue}>{Math.round(progress * 100)}%</Text>
            <Text style={styles.statLabel}>COMPLETE</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        {/* Last Review */}
        <View style={styles.lastReview}>
          <Ionicons name="time-outline" size={12} color="rgba(255, 255, 255, 0.3)" />
          <Text style={styles.lastReviewText}>
            Reviewed {getTimeAgo(item.lastReview)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0A0F']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Library</Text>
            <Text style={styles.subtitle}>
              {totalCards} cards · {totalDue} due today
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              // Navigate to create deck
            }}
          >
            <Ionicons name="add" size={24} color="#0066FF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[
          styles.searchContainer,
          searchFocused && styles.searchContainerFocused
        ]}>
          <Ionicons 
            name="search" 
            size={18} 
            color={searchFocused ? '#0066FF' : 'rgba(255, 255, 255, 0.3)'} 
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search decks..."
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="rgba(255, 255, 255, 0.3)" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {mockCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.name && styles.categoryChipActive
              ]}
              onPress={() => {
                setSelectedCategory(category.name);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category.name && styles.categoryTextActive
              ]}>
                {category.name}
              </Text>
              <Text style={[
                styles.categoryCount,
                selectedCategory === category.name && styles.categoryCountActive
              ]}>
                {category.count}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Decks List */}
        <FlatList
          data={filteredDecks}
          renderItem={renderDeck}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.decksList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="layers-outline" size={48} color="rgba(255, 255, 255, 0.1)" />
              <Text style={styles.emptyText}>No decks found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try a different search' : 'Create your first deck'}
              </Text>
            </View>
          }
        />
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
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: spacing.xs,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.2)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: spacing.borderRadius.medium,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  searchContainerFocused: {
    borderColor: 'rgba(0, 102, 255, 0.3)',
    backgroundColor: 'rgba(0, 102, 255, 0.02)',
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.fontSize.md,
    color: '#FFFFFF',
  },
  categoriesContainer: {
    maxHeight: 40,
    marginBottom: spacing.lg,
  },
  categoriesContent: {
    paddingHorizontal: spacing.lg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: spacing.borderRadius.small,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  categoryChipActive: {
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
    borderColor: '#0066FF',
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
  },
  categoryTextActive: {
    color: '#0066FF',
  },
  categoryCount: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.3)',
    marginLeft: spacing.xs,
  },
  categoryCountActive: {
    color: 'rgba(0, 102, 255, 0.7)',
  },
  decksList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  deckCard: {
    backgroundColor: 'rgba(0, 102, 255, 0.02)',
    borderRadius: spacing.borderRadius.large,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.05)',
  },
  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  deckTitleContainer: {
    flex: 1,
  },
  deckTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '400',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  deckCategory: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(0, 212, 255, 0.7)',
    letterSpacing: 1,
  },
  dueBadge: {
    alignItems: 'center',
    backgroundColor: '#0066FF',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.small,
  },
  dueCount: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dueLabel: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 1,
  },
  deckStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statGroup: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: '300',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.3)',
    letterSpacing: 1,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 1,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0066FF',
  },
  lastReview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastReviewText: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.3)',
    marginLeft: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.3)',
    marginTop: spacing.xs,
  },
});