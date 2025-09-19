// ============================================
// src/services/api/learning.ts
// ============================================
import api from './client';
import { Card } from '../../types/card_types';
import { ReviewSession, ReviewHistory, ReviewRating, SpacedRepetitionParams } from '../../types/review_types';
import { UserStats } from '../../types/user_types';
import { sqliteDb } from '../storage/sqliteDb';
import { offlineQueue } from '../storage/offlineQueue';
import { storageService } from '../storage/asyncStorage';
import NetInfo from '@react-native-community/netinfo';
import contentService from './content';

// Response types
interface StudySessionResponse {
  session: ReviewSession;
  cards: Card[];
  totalDue: number;
  newCards: number;
  reviewCards: number;
}

interface ProgressResponse {
  dailyProgress: number;
  weeklyProgress: number;
  monthlyProgress: number;
  retentionRate: number;
  averageEaseFactor: number;
  studyStreak: number;
  totalReviews: number;
  totalCards: number;
  masteredCards: number;
}

interface StatsResponse {
  stats: UserStats;
  recentActivity: ReviewHistory[];
  categoryBreakdown: {
    category: string;
    totalCards: number;
    dueCards: number;
    masteredCards: number;
    averageRetention: number;
  }[];
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  streak: number;
  xp: number;
  level: number;
  rank: number;
}

// Spaced Repetition Algorithm (SM-2 variant)
class SpacedRepetitionAlgorithm {
  /**
   * Calculate next review parameters based on SM-2 algorithm
   */
  calculateNextReview(
    card: Card,
    rating: ReviewRating,
    timeSpent: number
  ): SpacedRepetitionParams {
    let { easeFactor = 2.5, interval = 0, repetitions = 0 } = card;

    // Adjust ease factor based on rating
    if (rating === ReviewRating.AGAIN) {
      repetitions = 0;
      interval = 0;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    } else if (rating === ReviewRating.HARD) {
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 3;
      } else {
        interval = Math.round(interval * 1.2);
      }
      repetitions += 1;
    } else if (rating === ReviewRating.GOOD) {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    } else if (rating === ReviewRating.EASY) {
      easeFactor = Math.min(2.8, easeFactor + 0.15);
      if (repetitions === 0) {
        interval = 4;
      } else if (repetitions === 1) {
        interval = 10;
      } else {
        interval = Math.round(interval * easeFactor * 1.3);
      }
      repetitions += 1;
    }

    // Adjust based on time spent (quick answers might indicate memorization)
    if (timeSpent < 3000 && rating >= ReviewRating.GOOD) {
      // Very quick correct answer
      easeFactor = Math.min(2.8, easeFactor + 0.05);
    } else if (timeSpent > 30000 && rating <= ReviewRating.HARD) {
      // Struggled with the card
      easeFactor = Math.max(1.3, easeFactor - 0.05);
    }

    return {
      interval,
      repetitions,
      easeFactor,
    };
  }

  /**
   * Calculate the next review date
   */
  getNextReviewDate(interval: number): Date {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);
    nextDate.setHours(4, 0, 0, 0); // Set to 4 AM to avoid timezone issues
    return nextDate;
  }
}

// Learning Service Class
class LearningService {
  private algorithm: SpacedRepetitionAlgorithm;

  constructor() {
    this.algorithm = new SpacedRepetitionAlgorithm();
  }

  /**
   * Get the next review session
   */
  async getNextReview(limit: number = 20): Promise<StudySessionResponse> {
    try {
      const netInfo = await NetInfo.fetch();
      
      if (!netInfo.isConnected) {
        // Get from local database
        const dueCards = await sqliteDb.getDueCards(limit);
        
        const session: ReviewSession = {
          id: `offline_${Date.now()}`,
          userId: 'current_user',
          startedAt: new Date(),
          cardsReviewed: 0,
          cardsCorrect: 0,
          accuracy: 0,
          xpEarned: 0,
          streakMaintained: false,
        };

        return {
          session,
          cards: dueCards,
          totalDue: dueCards.length,
          newCards: dueCards.filter((c: { repetitions: number; }) => c.repetitions === 0).length,
          reviewCards: dueCards.filter((c: { repetitions: number; }) => c.repetitions > 0).length,
        };
      }

      const response = await api.get<StudySessionResponse>('/learning/next-review', {
        params: { limit },
      });

      // Save cards locally
      for (const card of response.cards) {
        await sqliteDb.saveCard(card);
      }

      // Store session data
      await storageService.setSessionData(response.session);

      return response;
    } catch (error: any) {
      console.error('Get next review error:', error);
      
      // Fallback to local cards
      const dueCards = await sqliteDb.getDueCards(limit);
      if (dueCards.length > 0) {
        const session: ReviewSession = {
          id: `offline_${Date.now()}`,
          userId: 'current_user',
          startedAt: new Date(),
          cardsReviewed: 0,
          cardsCorrect: 0,
          accuracy: 0,
          xpEarned: 0,
          streakMaintained: false,
        };

        return {
          session,
          cards: dueCards,
          totalDue: dueCards.length,
          newCards: dueCards.filter((c: { repetitions: number; }) => c.repetitions === 0).length,
          reviewCards: dueCards.filter((c: { repetitions: number; }) => c.repetitions > 0).length,
        };
      }
      
      throw error;
    }
  }

  /**
   * Submit a card review
   */
  async submitReview(
    cardId: string,
    rating: ReviewRating,
    timeSpent: number = 0
  ): Promise<Card> {
    try {
      // Get the card
      const cards = await sqliteDb.getCards();
      const card = cards.find((c: { id: string; }) => c.id === cardId);
      
      if (!card) {
        throw new Error('Card not found');
      }

      // Calculate next review parameters
      const params = this.algorithm.calculateNextReview(card, rating, timeSpent);
      
      // Update card with new parameters
      const updatedCard: Card = {
        ...card,
        ...params,
        nextReview: this.algorithm.getNextReviewDate(params.interval),
        lastReview: new Date(),
        updatedAt: new Date(),
      };

      // Save review history
      const reviewHistory: ReviewHistory = {
        cardId,
        rating,
        reviewedAt: new Date(),
        timeSpent,
        correct: rating >= ReviewRating.GOOD,
      };
      
      await sqliteDb.saveReview(reviewHistory);
      await storageService.addToReviewHistory(reviewHistory);

      // Update card locally
      await sqliteDb.saveCard(updatedCard);

      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        // Queue for sync
        await offlineQueue.addToQueue({
          type: 'CREATE',
          entity: 'review',
          data: {
            cardId,
            rating,
            timeSpent,
            params,
          },
        });
        
        return updatedCard;
      }

      // Send to server
      const response = await api.post<Card>('/learning/review', {
        cardId,
        rating,
        timeSpent,
      });

      // Update local with server response
      await sqliteDb.saveCard(response);

      return response;
    } catch (error: any) {
      console.error('Submit review error:', error);
      throw error;
    }
  }

  /**
   * Get learning statistics
   */
  async getStats(period: 'day' | 'week' | 'month' | 'all' = 'week'): Promise<StatsResponse> {
    try {
      const netInfo = await NetInfo.fetch();
      
      if (!netInfo.isConnected) {
        // Return cached stats
        const cachedStats = await storageService.get('learningStats');
        if (cachedStats) {
          return cachedStats as StatsResponse;
        }
        
        throw new Error('No cached stats available');
      }

      const response = await api.get<StatsResponse>('/learning/stats', {
        params: { period },
      });

      // Cache stats
      await storageService.set('learningStats', response);

      return response;
    } catch (error: any) {
      console.error('Get stats error:', error);
      
      // Try to return cached stats
      const cachedStats = await storageService.get('learningStats');
      if (cachedStats) {
        return cachedStats as StatsResponse;
      }
      
      throw error;
    }
  }

  /**
   * Get learning progress
   */
  async getProgress(): Promise<ProgressResponse> {
    try {
      const netInfo = await NetInfo.fetch();
      
      if (!netInfo.isConnected) {
        // Calculate from local data
        const reviews = await storageService.getReviewHistory();
        const streak = await storageService.getStudyStreak();
        
        return {
          dailyProgress: 0,
          weeklyProgress: 0,
          monthlyProgress: 0,
          retentionRate: 0,
          averageEaseFactor: 2.5,
          studyStreak: streak,
          totalReviews: reviews?.length || 0,
          totalCards: 0,
          masteredCards: 0,
        };
      }

      const response = await api.get<ProgressResponse>('/learning/progress');

      // Update local streak
      await storageService.updateStudyStreak(response.studyStreak);

      return response;
    } catch (error: any) {
      console.error('Get progress error:', error);
      
      // Return basic progress from local data
      const streak = await storageService.getStudyStreak();
      const reviews = await storageService.getReviewHistory();
      
      return {
        dailyProgress: 0,
        weeklyProgress: 0,
        monthlyProgress: 0,
        retentionRate: 0,
        averageEaseFactor: 2.5,
        studyStreak: streak,
        totalReviews: reviews?.length || 0,
        totalCards: 0,
        masteredCards: 0,
      };
    }
  }

  /**
   * Start a study session
   */
  async startStudySession(categoryId?: string): Promise<ReviewSession> {
    try {
      const session: ReviewSession = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: 'current_user',
        startedAt: new Date(),
        cardsReviewed: 0,
        cardsCorrect: 0,
        accuracy: 0,
        xpEarned: 0,
        streakMaintained: false,
      };

      // Store session locally
      await storageService.setSessionData(session);

      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        try {
          const response = await api.post<ReviewSession>('/learning/session/start', {
            categoryId,
          });
          
          await storageService.setSessionData(response);
          return response;
        } catch (error) {
          console.error('Error starting server session:', error);
        }
      }

      return session;
    } catch (error: any) {
      console.error('Start study session error:', error);
      throw error;
    }
  }

  /**
   * End a study session
   */
  async endStudySession(
    sessionId: string,
    stats: {
      cardsReviewed: number;
      cardsCorrect: number;
      timeSpent: number;
    }
  ): Promise<ReviewSession> {
    try {
      const session = await storageService.getSessionData() as ReviewSession;
      
      if (!session) {
        throw new Error('No active session');
      }

      const updatedSession: ReviewSession = {
        ...session,
        completedAt: new Date(),
        cardsReviewed: stats.cardsReviewed,
        cardsCorrect: stats.cardsCorrect,
        accuracy: stats.cardsReviewed > 0 ? (stats.cardsCorrect / stats.cardsReviewed) * 100 : 0,
        xpEarned: Math.round(stats.cardsCorrect * 10 + stats.cardsReviewed * 5),
        streakMaintained: true,
      };

      // Clear session data
      await storageService.clearSessionData();

      // Update streak
      const currentStreak = await storageService.getStudyStreak();
      await storageService.updateStudyStreak(currentStreak + 1);

      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        try {
          const response = await api.post<ReviewSession>('/learning/session/end', {
            sessionId,
            ...stats,
          });
          
          return response;
        } catch (error) {
          console.error('Error ending server session:', error);
        }
      }

      return updatedSession;
    } catch (error: any) {
      console.error('End study session error:', error);
      throw error;
    }
  }

  /**
   * Get recommended study time
   */
  async getRecommendedStudyTime(): Promise<{ minutes: number; reason: string }> {
    try {
      const response = await api.get<{ minutes: number; reason: string }>('/learning/recommended-time');
      return response;
    } catch (error: any) {
      console.error('Get recommended study time error:', error);
      
      // Default recommendation
      return {
        minutes: 15,
        reason: 'Daily practice helps maintain your knowledge',
      };
    }
  }

  /**
   * Reset card progress
   */
  async resetCard(cardId: string): Promise<Card> {
    try {
      const card = {
        id: cardId,
        interval: 0,
        repetitions: 0,
        easeFactor: 2.5,
        nextReview: new Date(),
        lastReview: null,
      };

      // Update locally
      await sqliteDb.saveCard(card as any);

      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        await offlineQueue.addToQueue({
          type: 'UPDATE',
          entity: 'card',
          data: card,
        });
        
        return card as unknown as Card;
      }

      const response = await api.post<Card>(`/learning/reset/${cardId}`);
      
      // Update local with server response
      await sqliteDb.saveCard(response);
      
      return response;
    } catch (error: any) {
      console.error('Reset card error:', error);
      throw error;
    }
  }

  /**
   * Get learning calendar (heat map data)
   */
  async getLearningCalendar(year?: number): Promise<{ date: string; count: number }[]> {
    try {
      const response = await api.get<{ date: string; count: number }[]>('/learning/calendar', {
        params: { year: year || new Date().getFullYear() },
      });

      return response;
    } catch (error: any) {
      console.error('Get learning calendar error:', error);
      return [];
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(
    type: 'streak' | 'xp' | 'reviews' = 'xp',
    period: 'week' | 'month' | 'all' = 'week'
  ): Promise<LeaderboardEntry[]> {
    try {
      const response = await api.get<LeaderboardEntry[]>('/learning/leaderboard', {
        params: { type, period },
      });

      return response;
    } catch (error: any) {
      console.error('Get leaderboard error:', error);
      return [];
    }
  }

  /**
   * Predict retention for a card
   */
  async predictRetention(cardId: string, days: number = 30): Promise<number> {
    try {
      const cards = await sqliteDb.getCards();
      const card = cards.find((c: { id: string; }) => c.id === cardId);

      if (!card) {
        return 0;
      }

      // Simple retention prediction based on ease factor and interval
      const baseRetention = 0.9; // 90% retention after one interval
      const decayRate = 0.05; // 5% decay per interval
      const intervalsAhead = days / (card.interval || 1);
      
      const predictedRetention = Math.max(
        0,
        baseRetention - (decayRate * intervalsAhead * (3 - card.easeFactor))
      );

      return Math.round(predictedRetention * 100);
    } catch (error: any) {
      console.error('Predict retention error:', error);
      return 0;
    }
  }

  /**
   * Update spaced repetition parameters manually
   */
  async updateSpacedRepetition(
    card: Card,
    rating: ReviewRating
  ): Promise<SpacedRepetitionParams> {
    return this.algorithm.calculateNextReview(card, rating, 0);
  }

  /**
   * Get due cards count
   */
  async getDueCardsCount(): Promise<{ total: number; new: number; review: number }> {
    try {
      const dueCards = await sqliteDb.getDueCards(1000);
      
      return {
        total: dueCards.length,
        new: dueCards.filter((c: { repetitions: number; }) => c.repetitions === 0).length,
        review: dueCards.filter((c: { repetitions: number; }) => c.repetitions > 0).length,
      };
    } catch (error: any) {
      console.error('Get due cards count error:', error);
      return { total: 0, new: 0, review: 0 };
    }
  }
}

// Create singleton instance
const learningService = new LearningService();

// Export singleton
export default learningService;

// Export for backward compatibility
export const submitReview = (cardId: string, rating: ReviewRating) => 
  learningService.submitReview(cardId, rating);