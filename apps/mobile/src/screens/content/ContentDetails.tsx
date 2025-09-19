// src/screens/content/ContentDetails.tsx
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ContentMetadata {
  id: string;
  title: string;
  source: string;
  sourceType: 'url' | 'file' | 'manual';
  category: string;
  totalCards: number;
  reviewedCards: number;
  mastery: number;
  lastReviewed: string;
  nextReview: string;
  estimatedTime: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  createdAt: string;
  tags: string[];
}

export default function ContentDetails() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'cards' | 'stats'>('overview');
  
  // Mock data - would come from props/API
  const content: ContentMetadata = {
    id: '1',
    title: 'Introduction to Machine Learning',
    source: 'https://example.com/ml-intro',
    sourceType: 'url',
    category: 'Technology',
    totalCards: 45,
    reviewedCards: 28,
    mastery: 62,
    lastReviewed: '2 hours ago',
    nextReview: 'Tomorrow at 9:00 AM',
    estimatedTime: 15,
    difficulty: 'Intermediate',
    createdAt: 'Sept 15, 2025',
    tags: ['AI', 'Neural Networks', 'Deep Learning'],
  };

  const handleStartReview = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('ReviewSession', { contentId: content.id });
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to edit screen
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // Show confirmation dialog
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Progress Card */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>LEARNING PROGRESS</Text>
          <Text style={styles.progressPercent}>{content.mastery}%</Text>
        </View>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={['#0066FF', '#00D4FF'] as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${content.mastery}%` }]}
          />
        </View>
        <View style={styles.progressStats}>
          <View style={styles.progressStat}>
            <Text style={styles.statNumber}>{content.reviewedCards}</Text>
            <Text style={styles.statLabel}>Reviewed</Text>
          </View>
          <View style={styles.progressStat}>
            <Text style={styles.statNumber}>{content.totalCards - content.reviewedCards}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
          <View style={styles.progressStat}>
            <Text style={styles.statNumber}>{content.totalCards}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </View>

      {/* Details Grid */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={20} color="rgba(255, 255, 255, 0.3)" />
          <Text style={styles.detailLabel}>Next Review</Text>
          <Text style={styles.detailValue}>{content.nextReview}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="hourglass-outline" size={20} color="rgba(255, 255, 255, 0.3)" />
          <Text style={styles.detailLabel}>Est. Time</Text>
          <Text style={styles.detailValue}>{content.estimatedTime} min</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="trending-up" size={20} color="rgba(255, 255, 255, 0.3)" />
          <Text style={styles.detailLabel}>Difficulty</Text>
          <Text style={styles.detailValue}>{content.difficulty}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={20} color="rgba(255, 255, 255, 0.3)" />
          <Text style={styles.detailLabel}>Created</Text>
          <Text style={styles.detailValue}>{content.createdAt}</Text>
        </View>
      </View>

      {/* Tags */}
      <View style={styles.tagsSection}>
        <Text style={styles.sectionTitle}>TAGS</Text>
        <View style={styles.tagsContainer}>
          {content.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Source */}
      <View style={styles.sourceSection}>
        <Text style={styles.sectionTitle}>SOURCE</Text>
        <TouchableOpacity style={styles.sourceCard}>
          <Ionicons 
            name={content.sourceType === 'url' ? 'link' : 'document-text'} 
            size={20} 
            color="rgba(255, 255, 255, 0.3)" 
          />
          <Text style={styles.sourceText} numberOfLines={1}>{content.source}</Text>
          <Ionicons name="open-outline" size={16} color="rgba(255, 255, 255, 0.3)" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCardsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.comingSoon}>Card management coming soon</Text>
    </View>
  );

  const renderStatsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.comingSoon}>Detailed statistics coming soon</Text>
    </View>
  );

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
            
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
                <Ionicons name="create-outline" size={22} color="rgba(255, 255, 255, 0.5)" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                <Ionicons name="trash-outline" size={22} color="rgba(239, 68, 68, 0.7)" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content Title & Category */}
          <View style={styles.titleSection}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{content.category.toUpperCase()}</Text>
            </View>
            <Text style={styles.contentTitle}>{content.title}</Text>
            <Text style={styles.lastReviewed}>Last reviewed {content.lastReviewed}</Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
              onPress={() => setActiveTab('overview')}
            >
              <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
                OVERVIEW
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'cards' && styles.tabActive]}
              onPress={() => setActiveTab('cards')}
            >
              <Text style={[styles.tabText, activeTab === 'cards' && styles.tabTextActive]}>
                CARDS
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'stats' && styles.tabActive]}
              onPress={() => setActiveTab('stats')}
            >
              <Text style={[styles.tabText, activeTab === 'stats' && styles.tabTextActive]}>
                STATS
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'cards' && renderCardsTab()}
          {activeTab === 'stats' && renderStatsTab()}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.reviewButton}
              onPress={handleStartReview}
            >
              <LinearGradient
                colors={['#0066FF', '#0052CC'] as [string, string]}
                style={styles.reviewGradient}
              >
                <Ionicons name="play" size={20} color="#FFFFFF" />
                <Text style={styles.reviewText}>START REVIEW</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton}>
              <Ionicons name="download-outline" size={20} color="rgba(255, 255, 255, 0.5)" />
              <Text style={styles.secondaryButtonText}>EXPORT</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
  },
  titleSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.small,
    marginBottom: spacing.sm,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    color: '#0066FF',
    letterSpacing: 1,
    fontWeight: '600',
  },
  contentTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  lastReviewed: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.3)',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  tab: {
    paddingVertical: spacing.md,
    marginRight: spacing.xl,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#0066FF',
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.3)',
    letterSpacing: 1,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#0066FF',
  },
  tabContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  progressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: spacing.borderRadius.medium,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
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
  progressPercent: {
    fontSize: typography.fontSize.xl,
    color: '#0066FF',
    fontWeight: '300',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressStat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.fontSize.lg,
    color: '#FFFFFF',
    fontWeight: '300',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.3)',
    letterSpacing: 1,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
    marginBottom: spacing.lg,
  },
  detailItem: {
    width: '50%',
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.lg,
  },
  detailLabel: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.3)',
    letterSpacing: 1,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  detailValue: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  tagsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.3)',
    letterSpacing: 2,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.small,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.1)',
  },
  tagText: {
    fontSize: typography.fontSize.xs,
    color: '#00D4FF',
  },
  sourceSection: {
    marginBottom: spacing.lg,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: spacing.borderRadius.medium,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: spacing.sm,
  },
  sourceText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  comingSoon: {
    fontSize: typography.fontSize.md,
    color: 'rgba(255, 255, 255, 0.3)',
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  actions: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  reviewButton: {
    borderRadius: spacing.borderRadius.medium,
    overflow: 'hidden',
  },
  reviewGradient: {
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reviewText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  secondaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: spacing.borderRadius.medium,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.md,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
  },
});