// ============================================
// src/types/card.types.ts
// ============================================
export interface Card {
  id: string;
  userId: string;
  categoryId: string;
  front: string;
  back: string;
  mediaUrl?: string;
  difficulty: number;
  interval: number;
  repetitions: number;
  easeFactor: number;
  nextReview: Date;
  lastReview?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  cardCount: number;
  description?: string;
  isActive: boolean;
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  cards: Card[];
  isPublic: boolean;
  createdBy: string;
  thumbnail?: string;
}