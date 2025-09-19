// ============================================
// src/types/review.types.ts
// ============================================
export enum ReviewRating {
  AGAIN = 0,
  HARD = 1,
  GOOD = 2,
  EASY = 3,
}

export interface ReviewSession {
  id: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  cardsReviewed: number;
  cardsCorrect: number;
  accuracy: number;
  xpEarned: number;
  streakMaintained: boolean;
}

export interface ReviewHistory {
  cardId: string;
  rating: ReviewRating;
  reviewedAt: Date;
  timeSpent: number;
  correct: boolean;
}

export interface SpacedRepetitionParams {
  interval: number;
  repetitions: number;
  easeFactor: number;
}
