// src/screens/content/ContentLibrary.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
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

interface ContentItem {
  id: string;
  title: string;
  category: string;
  totalCards: number;
  reviewedCards: number;
  mastery: number;
  lastReviewed: string;
  sourceType: 'url' | 'file' | 'manual';
  dueCards: number;
}

const mockContent: ContentItem[] = [
  {
    id: '1',
    title: 'Introduction to Machine Learning',
    category: 'Technology',
    totalCards: 45,
    reviewedCards: 28,
    mastery: 62,
    lastReviewed: '2 hours ago',
    sourceType: 'url',
    dueCards: 5,
  },
  {
    id: '2',
    title: 'Spanish Vocabulary: Common Phrases',
    category: 'Languages',
    totalCards: 120,
    reviewedCards: 85,
    mastery: 71,
    lastReviewed: 'Yesterday',
    sourceType: 'manual',
    dueCards: 12,
  },
  {
    id: '3',
    title: 'Quantum Physics Fundamentals',
    category: 'Science',
    totalCards: 65,
    reviewedCards: 15,
    mastery: 23,
    lastReviewed: '3 days ago',
    sourceType: 'file',
    dueCards: 8,
  },
  {
    id: '4',
    title: 'World War II: Key Events',
    category: 'History',
    totalCards: 80,
    reviewedCards: 80,
    mastery: 95,
    lastReviewed: 'Last week',
    sourceType: 'url',
    dueCards: 0,
  },
  {
    id: '5',
    title: 'Advanced Calculus',
    category: 'Mathematics',
    totalCards: 55,
    reviewedCards: 20,
    mastery: 36,
    lastReviewed: '5 days ago',
    sourceType: 'file',
    dueCards: 3,
  },
];

const categories = ['All', 'Technology', 'Languages', 'Science', 'History', 'Mathematics'];

export default function ContentLibrary() {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'recent' | 'mastery' | 'due'>('recent');

  const handleContentPress = (contentId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('ContentDetails', { contentId });
  };

  const handleAddContent = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('AddContentScreen');
  };

  const filteredContent = mockContent.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedContent = [...filteredContent].sort((a, b) => {
    switch (sortBy) {
      case 'mastery':
        return b.mastery - a.mastery;
      case 'due':
        return b.dueCards - a.dueCards;
      default:
        return 0; // Keep original order for 'recent'
    }
  });

  const renderContentItem = ({ item }: { item: ContentItem }) => (
    <TouchableOpacity 
      style={styles.contentCard}
      onPress={() => handleContentPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.categoryIndicator}>
          <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(item.category) }]} />
          <Text style={styles.categoryLabel}>{item.category.toUpperCase()}</Text>
        </View>
        {item.dueCards > 0 && (
          <View style={styles.dueBadge}>
            <Text style={styles.dueText}>{item.dueCards} DUE</Text>
          </View>
        )}
      </View>

      <Text style={styles.contentTitle} numberOfLines={2}>{item.title}</Text>

      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={['#0066FF', '#00D4FF'] as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${item.mastery}%` }]}
          />
        </View>
        <Text style={styles.masteryText}>{item.mastery}% mastered</Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.cardStat}>
          <Ionicons name="albums-outline" size={14} color="rgba(255, 255, 255, 0.3)" />
          <Text style={styles.cardStatText}>{item.reviewedCards}/{item.totalCards}</Text>
        </View>
        <View style={styles.cardStat}>
          <Ionicons name="time-outline" size={14} color="rgba(255, 255, 255, 0.3)" />
          <Text style={styles.cardStatText}>{item.lastReviewed}</Text>
        </View>
        <Ionicons 
          name={getSourceIcon(item.sourceType)} 
          size={14} 
          color="rgba(255, 255, 255, 0.3)" 
        />
      </View>
    </TouchableOpacity>
  );

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Technology': '#0066FF',
      'Languages': '#00D4FF',
      'Science': '#4F46E5',
      'History': '#7C3AED',
      'Mathematics': '#06B6D4',
    };
    return colors[category] || '#FFFFFF';
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'url': return 'link';
      case 'file': return 'document-text';
      case 'manual': return 'create';
      default: return 'document';
    }
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
            <Text style={styles.subtitle}>{sortedContent.length} items</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddContent}
          >
            <LinearGradient
              colors={['#0066FF', '#0052CC'] as [string, string]}
              style={styles.addGradient}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.3)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search content..."
            placeholderTextColor="rgba(255, 255, 255, 0.2)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="rgba(255, 255, 255, 0.3)" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter */}
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === category && styles.categoryChipTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort Options */}
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>SORT BY</Text>
          <View style={styles.sortOptions}>
            <TouchableOpacity
              style={[styles.sortChip, sortBy === 'recent' && styles.sortChipActive]}
              onPress={() => setSortBy('recent')}
            >
              <Text style={[styles.sortText, sortBy === 'recent' && styles.sortTextActive]}>
                Recent
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortChip, sortBy === 'mastery' && styles.sortChipActive]}
              onPress={() => setSortBy('mastery')}
            >
              <Text style={[styles.sortText, sortBy === 'mastery' && styles.sortTextActive]}>
                Mastery
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortChip, sortBy === 'due' && styles.sortChipActive]}
              onPress={() => setSortBy('due')}
            >
              <Text style={[styles.sortText, sortBy === 'due' && styles.sortTextActive]}>
                Due
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content List */}
        <FlatList
          data={sortedContent}
          renderItem={renderContentItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="library-outline" size={48} color="rgba(255, 255, 255, 0.1)" />
              <Text style={styles.emptyText}>No content found</Text>
              <Text style={styles.emptySubtext}>Add your first content to start learning</Text>
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
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: spacing.xs,
  },
  addButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  addGradient: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: spacing.borderRadius.medium,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: '#FFFFFF',
    paddingVertical: spacing.md,
    marginLeft: spacing.sm,
  },
  categoryScroll: {
    maxHeight: 40,
    marginBottom: spacing.md,
  },
  categoryContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: spacing.borderRadius.small,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  categoryChipActive: {
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
    borderColor: '#0066FF',
  },
  categoryChipText: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  categoryChipTextActive: {
    color: '#0066FF',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sortLabel: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.3)',
    letterSpacing: 2,
    marginRight: spacing.md,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  sortChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: spacing.borderRadius.small,
  },
  sortChipActive: {
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
  },
  sortText: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.3)',
  },
  sortTextActive: {
    color: '#00D4FF',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  contentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: spacing.borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryLabel: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
  },
  dueBadge: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: spacing.borderRadius.small,
  },
  dueText: {
    fontSize: typography.fontSize.xs,
    color: '#00D4FF',
    fontWeight: '600',
  },
  contentTitle: {
    fontSize: typography.fontSize.lg,
    color: '#FFFFFF',
    fontWeight: '400',
    marginBottom: spacing.md,
    lineHeight: typography.fontSize.lg * 1.3,
  },
  progressSection: {
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  masteryText: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.3)',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  cardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardStatText: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.3)',
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.2)',
    marginTop: spacing.xs,
  },
});