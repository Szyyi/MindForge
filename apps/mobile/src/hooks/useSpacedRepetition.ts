// src/hooks/useSpacedRepetition.ts
import { useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { storageService } from '../services/storage/asyncStorage';

// Types for Spaced Repetition
export interface Card {
  id: string;
  contentId: string;
  question: string;
  answer: string;
  category: string;
  difficulty: number; // 1-5 scale
  easeFactor: number; // EF in SM-2 algorithm (starts at 2.5)
  interval: number; // Days until next review
  repetitions: number; // Number of successful reviews
  lastReviewedAt: Date | null;
  nextReviewAt: Date;
  createdAt: Date;
  stats: CardStats;
  tags: string[];
}

export interface CardStats {
  totalReviews: number;
  correctReviews: number;
  incorrectReviews: number;
  averageResponseTime: number; // in seconds
  lastResponseTime: number;
  streak: number;
  lapses: number; // Times card was forgotten
}

export interface ReviewSession {
  id: string;
  startedAt: Date;
  completedAt?: Date;
  cards: Card[];
  currentCardIndex: number;
  reviewedCards: ReviewedCard[];
  sessionStats: SessionStats;
}

export interface ReviewedCard {
  cardId: string;
  quality: number; // 0-5 rating
  responseTime: number;
  reviewedAt: Date;
}

export interface SessionStats {
  totalCards: number;
  reviewedCards: number;
  correctCards: number;
  incorrectCards: number;
  averageQuality: number;
  averageResponseTime: number;
  estimatedTimeRemaining: number;
}

// SM-2 Algorithm Quality Ratings
export enum Quality {
  COMPLETE_BLACKOUT = 0, // Complete failure to recall
  INCORRECT_HARD = 1,    // Incorrect response, but remembered upon seeing answer
  INCORRECT_EASY = 2,    // Incorrect response, but answer seemed easy
  CORRECT_HARD = 3,      // Correct response, but with serious difficulty
  CORRECT_MEDIUM = 4,    // Correct response, after hesitation
  CORRECT_EASY = 5,      // Perfect response
}

// Hook Implementation
export const useSpacedRepetition = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [currentSession, setCurrentSession] = useState<ReviewSession | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);

  // SM-2 Algorithm Implementation
  const calculateNextReview = useCallback((
    card: Card,
    quality: Quality
  ): Partial<Card> => {
    let { easeFactor, interval, repetitions } = card;
    
    // Quality should be 0-5
    if (quality < 0 || quality > 5) {
      throw new Error('Quality must be between 0 and 5');
    }

    // If quality < 3, reset the card
    if (quality < 3) {
      repetitions = 0;
      interval = 1;
    } else {
      // Successful review
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    }

    // Update ease factor
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    easeFactor = Math.max(
      1.3,
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    // Calculate next review date
    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + interval);

    // Update stats
    const stats = { ...card.stats };
    stats.totalReviews += 1;
    
    if (quality >= 3) {
      stats.correctReviews += 1;
      stats.streak += 1;
    } else {
      stats.incorrectReviews += 1;
      stats.streak = 0;
      stats.lapses += 1;
    }

    return {
      easeFactor,
      interval,
      repetitions,
      lastReviewedAt: new Date(),
      nextReviewAt,
      stats,
    };
  }, []);

  // Get cards due for review
  const getDueCards = useCallback(async (
    category?: string,
    limit?: number
  ): Promise<Card[]> => {
    try {
      // In production, this would fetch from your backend/database
      // For now, using local storage as placeholder
      const allCards = await storageService.get<Card[]>('cards') || [];
      
      const now = new Date();
      let dueCards = allCards.filter(card => {
        const isDue = new Date(card.nextReviewAt) <= now;
        const matchesCategory = !category || card.category === category;
        return isDue && matchesCategory;
      });

      // Sort by priority (overdue cards first, then by ease factor)
      dueCards.sort((a, b) => {
        const aDaysOverdue = Math.floor(
          (now.getTime() - new Date(a.nextReviewAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        const bDaysOverdue = Math.floor(
          (now.getTime() - new Date(b.nextReviewAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (aDaysOverdue !== bDaysOverdue) {
          return bDaysOverdue - aDaysOverdue; // More overdue first
        }
        
        return a.easeFactor - b.easeFactor; // Harder cards first
      });

      return limit ? dueCards.slice(0, limit) : dueCards;
    } catch (error) {
      console.error('Error fetching due cards:', error);
      return [];
    }
  }, []);

  // Start a review session
  const startSession = useCallback(async (
    categories?: string[],
    cardLimit: number = 20
  ): Promise<ReviewSession> => {
    try {
      let dueCards: Card[] = [];
      
      if (categories && categories.length > 0) {
        // Get cards from selected categories
        for (const category of categories) {
          const categoryCards = await getDueCards(category);
          dueCards.push(...categoryCards);
        }
      } else {
        // Get all due cards
        dueCards = await getDueCards(undefined, cardLimit);
      }

      // Limit total cards
      dueCards = dueCards.slice(0, cardLimit);

      const session: ReviewSession = {
        id: Date.now().toString(),
        startedAt: new Date(),
        cards: dueCards,
        currentCardIndex: 0,
        reviewedCards: [],
        sessionStats: {
          totalCards: dueCards.length,
          reviewedCards: 0,
          correctCards: 0,
          incorrectCards: 0,
          averageQuality: 0,
          averageResponseTime: 0,
          estimatedTimeRemaining: dueCards.length * 30, // 30 seconds per card estimate
        },
      };

      setCurrentSession(session);
      setIsSessionActive(true);
      
      // Save session to storage
      await storageService.set('currentSession', session);
      
      return session;
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  }, [getDueCards]);

  // Review a card
  const reviewCard = useCallback(async (
    cardId: string,
    quality: Quality,
    responseTime: number
  ): Promise<Card> => {
    if (!currentSession) {
      throw new Error('No active session');
    }

    try {
      // Find the card
      const cardIndex = currentSession.cards.findIndex(c => c.id === cardId);
      if (cardIndex === -1) {
        throw new Error('Card not found in session');
      }

      const card = currentSession.cards[cardIndex];
      
      // Calculate next review using SM-2
      const updates = calculateNextReview(card, quality);
      
      // Update card
      const updatedCard: Card = {
        ...card,
        ...updates,
        stats: {
          ...card.stats,
          ...updates.stats,
          lastResponseTime: responseTime,
          averageResponseTime: 
            (card.stats.averageResponseTime * card.stats.totalReviews + responseTime) / 
            (card.stats.totalReviews + 1),
        },
      };

      // Update session
      const reviewedCard: ReviewedCard = {
        cardId,
        quality,
        responseTime,
        reviewedAt: new Date(),
      };

      const updatedSession: ReviewSession = {
        ...currentSession,
        currentCardIndex: currentSession.currentCardIndex + 1,
        reviewedCards: [...currentSession.reviewedCards, reviewedCard],
        sessionStats: {
          ...currentSession.sessionStats,
          reviewedCards: currentSession.reviewedCards.length + 1,
          correctCards: quality >= 3 
            ? currentSession.sessionStats.correctCards + 1 
            : currentSession.sessionStats.correctCards,
          incorrectCards: quality < 3 
            ? currentSession.sessionStats.incorrectCards + 1 
            : currentSession.sessionStats.incorrectCards,
          averageQuality: 
            (currentSession.sessionStats.averageQuality * currentSession.reviewedCards.length + quality) / 
            (currentSession.reviewedCards.length + 1),
          averageResponseTime:
            (currentSession.sessionStats.averageResponseTime * currentSession.reviewedCards.length + responseTime) / 
            (currentSession.reviewedCards.length + 1),
          estimatedTimeRemaining: 
            (currentSession.cards.length - currentSession.reviewedCards.length - 1) * 30,
        },
      };

      setCurrentSession(updatedSession);
      
      // Save to storage
      await storageService.set('currentSession', updatedSession);
      
      // In production, also sync with backend
      // await api.put(`/cards/${cardId}`, updatedCard);
      
      return updatedCard;
    } catch (error) {
      console.error('Error reviewing card:', error);
      throw error;
    }
  }, [currentSession, calculateNextReview]);

  // End session
  const endSession = useCallback(async (): Promise<SessionStats> => {
    if (!currentSession) {
      throw new Error('No active session');
    }

    try {
      const completedSession: ReviewSession = {
        ...currentSession,
        completedAt: new Date(),
      };

      // Save completed session
      const sessions = await storageService.get<ReviewSession[]>('completedSessions') || [];
      sessions.push(completedSession);
      await storageService.set('completedSessions', sessions);
      
      // Clear current session
      await storageService.remove('currentSession');
      
      // Update user stats
      // In production, sync with backend
      // await api.post('/sessions/complete', completedSession);
      
      setCurrentSession(null);
      setIsSessionActive(false);
      
      return completedSession.sessionStats;
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }, [currentSession]);

  // Get current card
  const getCurrentCard = useCallback((): Card | null => {
    if (!currentSession || currentSession.currentCardIndex >= currentSession.cards.length) {
      return null;
    }
    return currentSession.cards[currentSession.currentCardIndex];
  }, [currentSession]);

  // Skip card (postpone review)
  const skipCard = useCallback(async (cardId: string): Promise<void> => {
    if (!currentSession) return;

    try {
      const card = currentSession.cards.find(c => c.id === cardId);
      if (!card) return;

      // Move to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const updatedCard: Card = {
        ...card,
        nextReviewAt: tomorrow,
      };

      // Update session (remove card from current session)
      const updatedSession: ReviewSession = {
        ...currentSession,
        cards: currentSession.cards.filter(c => c.id !== cardId),
        currentCardIndex: Math.min(
          currentSession.currentCardIndex,
          currentSession.cards.length - 2
        ),
      };

      setCurrentSession(updatedSession);
      await storageService.set('currentSession', updatedSession);
      
      // In production, sync with backend
      // await api.put(`/cards/${cardId}/skip`, { nextReviewAt: tomorrow });
    } catch (error) {
      console.error('Error skipping card:', error);
    }
  }, [currentSession]);

  // Get learning statistics
  const getLearningStats = useCallback(async (
    timeRange?: 'day' | 'week' | 'month' | 'all'
  ) => {
    try {
      const sessions = await storageService.get<ReviewSession[]>('completedSessions') || [];
      
      let filteredSessions = sessions;
      if (timeRange && timeRange !== 'all') {
        const cutoffDate = new Date();
        switch (timeRange) {
          case 'day':
            cutoffDate.setDate(cutoffDate.getDate() - 1);
            break;
          case 'week':
            cutoffDate.setDate(cutoffDate.getDate() - 7);
            break;
          case 'month':
            cutoffDate.setMonth(cutoffDate.getMonth() - 1);
            break;
        }
        
        filteredSessions = sessions.filter(
          s => new Date(s.startedAt) >= cutoffDate
        );
      }

      // Calculate aggregate stats
      const stats = {
        totalSessions: filteredSessions.length,
        totalCardsReviewed: filteredSessions.reduce(
          (sum, s) => sum + s.sessionStats.reviewedCards, 0
        ),
        averageAccuracy: filteredSessions.reduce(
          (sum, s) => sum + (s.sessionStats.correctCards / s.sessionStats.reviewedCards), 0
        ) / filteredSessions.length * 100,
        averageSessionTime: filteredSessions.reduce(
          (sum, s) => {
            if (s.completedAt) {
              return sum + (new Date(s.completedAt).getTime() - new Date(s.startedAt).getTime());
            }
            return sum;
          }, 0
        ) / filteredSessions.length / 1000 / 60, // in minutes
        streak: await calculateStreak(),
      };

      return stats;
    } catch (error) {
      console.error('Error getting stats:', error);
      return null;
    }
  }, []);

  // Calculate current streak
  const calculateStreak = async (): Promise<number> => {
    try {
      const sessions = await storageService.get<ReviewSession[]>('completedSessions') || [];
      
      if (sessions.length === 0) return 0;
      
      // Sort sessions by date
      sessions.sort((a, b) => 
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      );

      let streak = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      for (const session of sessions) {
        const sessionDate = new Date(session.startedAt);
        sessionDate.setHours(0, 0, 0, 0);

        const dayDiff = Math.floor(
          (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (dayDiff === streak) {
          streak++;
        } else if (dayDiff > streak) {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  };

  return {
    // Session management
    currentSession,
    isSessionActive,
    startSession,
    endSession,
    
    // Card operations
    getCurrentCard,
    reviewCard,
    skipCard,
    getDueCards,
    
    // Statistics
    getLearningStats,
    calculateStreak,
    
    // Algorithm
    calculateNextReview,
  };
};