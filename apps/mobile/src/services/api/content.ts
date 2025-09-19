// ============================================
// src/services/api/content.ts
// ============================================
import api from './client';
import { Card, Deck, Category } from '../../types/card_types';
import { sqliteDb } from '../storage/sqliteDb';
import { offlineQueue } from '../storage/offlineQueue'
import { storageService } from '../storage/asyncStorage';
import NetInfo from '@react-native-community/netinfo';

// Response types
interface FetchDecksResponse {
  decks: Deck[];
  total: number;
  page: number;
  limit: number;
}

interface FetchCardsResponse {
  cards: Card[];
  total: number;
  page: number;
  limit: number;
}

interface ProcessContentResponse {
  cards: Card[];
  summary: string;
  processedAt: Date;
}

interface ContentAnalysis {
  title: string;
  summary: string;
  keyPoints: string[];
  suggestedCards: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Content Service Class
class ContentService {
  /**
   * Fetch all decks for the user
   */
  async fetchDecks(
    page: number = 1, 
    limit: number = 20,
    categoryId?: string
  ): Promise<FetchDecksResponse> {
    try {
      // Check if online
      const netInfo = await NetInfo.fetch();
      
      if (!netInfo.isConnected) {
        // Return from local cache
        const cachedDecks = await storageService.getCachedCards();
        const decksArray = Array.isArray(cachedDecks) ? cachedDecks : [];
        return {
          decks: decksArray,
          total: decksArray.length,
          page: 1,
          limit: decksArray.length,
        };
      }

      const params: any = { page, limit };
      if (categoryId) {
        params.categoryId = categoryId;
      }

      const response = await api.get<FetchDecksResponse>('/decks', { params });
      
      // Cache the results
      if (response.decks) {
        await storageService.setCachedCards(response.decks);
      }

      return response;
    } catch (error: any) {
      console.error('Fetch decks error:', error);
      
      // Fallback to cached data
      const cachedDecks = await storageService.getCachedCards();
      if (cachedDecks) {
        const decksArray = Array.isArray(cachedDecks) ? cachedDecks : [];
        return {
          decks: decksArray,
          total: decksArray.length,
          page: 1,
          limit: decksArray.length,
        };
      }
      
      throw error;
    }
  }

  /**
   * Create a new deck
   */
  async createDeck(deck: Omit<Deck, 'id' | 'createdBy'>): Promise<Deck> {
    try {
      const netInfo = await NetInfo.fetch();
      
      if (!netInfo.isConnected) {
        // Queue for later sync
        const tempDeck: Deck = {
          ...deck,
          id: `temp_${Date.now()}`,
          createdBy: 'current_user', // Will be updated on sync
        };
        
        await offlineQueue.addToQueue({
          type: 'CREATE',
          entity: 'deck',
          data: tempDeck,
        });
        
        return tempDeck;
      }

      const response = await api.post<Deck>('/decks', deck);
      return response;
    } catch (error: any) {
      console.error('Create deck error:', error);
      throw error;
    }
  }

  /**
   * Update an existing deck
   */
  async updateDeck(id: string, updates: Partial<Deck>): Promise<Deck> {
    try {
      const netInfo = await NetInfo.fetch();
      
      if (!netInfo.isConnected) {
        // Queue for later sync
        await offlineQueue.addToQueue({
          type: 'UPDATE',
          entity: 'deck',
          data: { id, ...updates },
        });
        
        // Return optimistic update
        return { id, ...updates } as Deck;
      }

      const response = await api.put<Deck>(`/decks/${id}`, updates);
      return response;
    } catch (error: any) {
      console.error('Update deck error:', error);
      throw error;
    }
  }

  /**
   * Delete a deck
   */
  async deleteDeck(id: string): Promise<{ success: boolean }> {
    try {
      const netInfo = await NetInfo.fetch();
      
      if (!netInfo.isConnected) {
        // Queue for later sync
        await offlineQueue.addToQueue({
          type: 'DELETE',
          entity: 'deck',
          data: { id },
        });
        
        return { success: true };
      }

      const response = await api.delete<{ success: boolean }>(`/decks/${id}`);
      return response;
    } catch (error: any) {
      console.error('Delete deck error:', error);
      throw error;
    }
  }

  /**
   * Fetch cards for a specific deck or category
   */
  async fetchCards(
    deckId?: string,
    categoryId?: string,
    page: number = 1,
    limit: number = 50
  ): Promise<FetchCardsResponse> {
    try {
      const netInfo = await NetInfo.fetch();
      
      if (!netInfo.isConnected) {
        // Get from local database
        const localCards = await sqliteDb.getCards(categoryId, limit);
        return {
          cards: localCards,
          total: localCards.length,
          page: 1,
          limit: localCards.length,
        };
      }

      const params: any = { page, limit };
      if (deckId) params.deckId = deckId;
      if (categoryId) params.categoryId = categoryId;

      const response = await api.get<FetchCardsResponse>('/cards', { params });
      
      // Save to local database
      for (const card of response.cards) {
        await sqliteDb.saveCard(card);
      }

      return response;
    } catch (error: any) {
      console.error('Fetch cards error:', error);
      
      // Fallback to local data
      const localCards = await sqliteDb.getCards(categoryId, limit);
      if (localCards.length > 0) {
        return {
          cards: localCards,
          total: localCards.length,
          page: 1,
          limit: localCards.length,
        };
      }
      
      throw error;
    }
  }

  /**
   * Create a new card
   */
  async createCard(card: Omit<Card, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Card> {
    try {
      const netInfo = await NetInfo.fetch();
      
      const newCard: Card = {
        ...card,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: 'current_user', // Will be set from auth state
        createdAt: new Date(),
        updatedAt: new Date(),
        nextReview: new Date(),
        difficulty: card.difficulty || 2.5,
        interval: card.interval || 0,
        repetitions: card.repetitions || 0,
        easeFactor: card.easeFactor || 2.5,
      };

      // Save to local database first
      await sqliteDb.saveCard(newCard);

      if (!netInfo.isConnected) {
        // Queue for later sync
        await offlineQueue.addToQueue({
          type: 'CREATE',
          entity: 'card',
          data: newCard,
        });
        
        return newCard;
      }

      // Send to server
      const response = await api.post<Card>('/cards', card);
      
      // Update local database with server response
      await sqliteDb.saveCard(response);
      
      return response;
    } catch (error: any) {
      console.error('Create card error:', error);
      throw error;
    }
  }

  /**
   * Update an existing card
   */
  async updateCard(id: string, updates: Partial<Card>): Promise<Card> {
    try {
      const netInfo = await NetInfo.fetch();
      
      // Get existing card to ensure all required fields are present
      const existingCards = await sqliteDb.getCards();
      const existingCard = existingCards.find(card => card.id === id);
      
      if (!existingCard) {
        throw new Error(`Card with id ${id} not found`);
      }
      
      const updatedCard: Card = {
        ...existingCard,
        ...updates,
        id,
        updatedAt: new Date(),
      };

      // Update local database first
      await sqliteDb.saveCard(updatedCard);

      if (!netInfo.isConnected) {
        // Queue for later sync
        await offlineQueue.addToQueue({
          type: 'UPDATE',
          entity: 'card',
          data: updatedCard,
        });
        
        return updatedCard as Card;
      }

      const response = await api.put<Card>(`/cards/${id}`, updates);
      
      // Update local database with server response
      await sqliteDb.saveCard(response);
      
      return response;
    } catch (error: any) {
      console.error('Update card error:', error);
      throw error;
    }
  }

  /**
   * Delete a card
   */
  async deleteCard(id: string): Promise<{ success: boolean }> {
    try {
      const netInfo = await NetInfo.fetch();
      
      if (!netInfo.isConnected) {
        // Queue for later sync
        await offlineQueue.addToQueue({
          type: 'DELETE',
          entity: 'card',
          data: { id },
        });
        
        return { success: true };
      }

      const response = await api.delete<{ success: boolean }>(`/cards/${id}`);
      return response;
    } catch (error: any) {
      console.error('Delete card error:', error);
      throw error;
    }
  }

  /**
   * Bulk import cards
   */
  async bulkImportCards(cards: Partial<Card>[]): Promise<{ imported: number; failed: number }> {
    try {
      const netInfo = await NetInfo.fetch();
      
      if (!netInfo.isConnected) {
        // Save locally and queue
        let imported = 0;
        for (const card of cards) {
          try {
            await this.createCard(card as any);
            imported++;
          } catch (error) {
            console.error('Failed to import card:', error);
          }
        }
        
        return { imported, failed: cards.length - imported };
      }

      const response = await api.post<{ imported: number; failed: number }>('/cards/bulk', { cards });
      
      // Save successfully imported cards locally
      if (response.imported > 0) {
        const importedCards = await this.fetchCards();
        for (const card of importedCards.cards) {
          await sqliteDb.saveCard(card);
        }
      }

      return response;
    } catch (error: any) {
      console.error('Bulk import error:', error);
      throw error;
    }
  }

  /**
   * Process web content from URL
   */
  async processWebContent(url: string, options?: {
    maxCards?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    category?: string;
  }): Promise<ProcessContentResponse> {
    try {
      const response = await api.post<ProcessContentResponse>('/content/process/web', {
        url,
        ...options,
      });

      // Save generated cards locally
      for (const card of response.cards) {
        await sqliteDb.saveCard(card);
      }

      return response;
    } catch (error: any) {
      console.error('Process web content error:', error);
      throw error;
    }
  }

  /**
   * Process text content
   */
  async processTextContent(
    text: string,
    options?: {
      title?: string;
      maxCards?: number;
      difficulty?: 'easy' | 'medium' | 'hard';
      category?: string;
    }
  ): Promise<ProcessContentResponse> {
    try {
      const response = await api.post<ProcessContentResponse>('/content/process/text', {
        text,
        ...options,
      });

      // Save generated cards locally
      for (const card of response.cards) {
        await sqliteDb.saveCard(card);
      }

      return response;
    } catch (error: any) {
      console.error('Process text content error:', error);
      throw error;
    }
  }

  /**
   * Process PDF content
   */
  async processPDFContent(
    base64Data: string,
    options?: {
      filename?: string;
      maxCards?: number;
      difficulty?: 'easy' | 'medium' | 'hard';
      category?: string;
    }
  ): Promise<ProcessContentResponse> {
    try {
      const response = await api.post<ProcessContentResponse>('/content/process/pdf', {
        data: base64Data,
        ...options,
      });

      // Save generated cards locally
      for (const card of response.cards) {
        await sqliteDb.saveCard(card);
      }

      return response;
    } catch (error: any) {
      console.error('Process PDF content error:', error);
      throw error;
    }
  }

  /**
   * Analyze content before processing
   */
  async analyzeContent(content: string | { url: string }): Promise<ContentAnalysis> {
    try {
      const response = await api.post<ContentAnalysis>('/content/analyze', content);
      return response;
    } catch (error: any) {
      console.error('Analyze content error:', error);
      throw error;
    }
  }

  /**
   * Generate cards from content using AI
   */
  async generateCards(
    content: string,
    count: number = 10,
    options?: {
      difficulty?: 'easy' | 'medium' | 'hard';
      category?: string;
      focusAreas?: string[];
    }
  ): Promise<Card[]> {
    try {
      const response = await api.post<{ cards: Card[] }>('/content/generate', {
        content,
        count,
        ...options,
      });

      // Save generated cards locally
      for (const card of response.cards) {
        await sqliteDb.saveCard(card);
      }

      return response.cards;
    } catch (error: any) {
      console.error('Generate cards error:', error);
      throw error;
    }
  }

  /**
   * Get all categories
   */
  async fetchCategories(): Promise<Category[]> {
    try {
      const netInfo = await NetInfo.fetch();
      
      if (!netInfo.isConnected) {
        // Get from local database
        return await sqliteDb.getCategories();
      }

      const response = await api.get<Category[]>('/categories');
      
      // Save to local database
      for (const category of response) {
        await sqliteDb.saveCategory(category);
      }

      return response;
    } catch (error: any) {
      console.error('Fetch categories error:', error);
      
      // Fallback to local data
      const localCategories = await sqliteDb.getCategories();
      if (localCategories.length > 0) {
        return localCategories;
      }
      
      throw error;
    }
  }

  /**
   * Create a new category
   */
  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    try {
      const newCategory: Category = {
        ...category,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      // Save locally first
      await sqliteDb.saveCategory(newCategory);

      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        // Queue for sync
        await offlineQueue.addToQueue({
          type: 'CREATE',
          entity: 'category' as any,
          data: newCategory,
        });
        
        return newCategory;
      }

      const response = await api.post<Category>('/categories', category);
      
      // Update local with server response
      await sqliteDb.saveCategory(response);
      
      return response;
    } catch (error: any) {
      console.error('Create category error:', error);
      throw error;
    }
  }

  /**
   * Export cards to various formats
   */
  async exportCards(
    format: 'json' | 'csv' | 'anki',
    cardIds?: string[]
  ): Promise<{ data: string; filename: string }> {
    try {
      const response = await api.post<{ data: string; filename: string }>('/cards/export', {
        format,
        cardIds,
      });

      return response;
    } catch (error: any) {
      console.error('Export cards error:', error);
      throw error;
    }
  }

  /**
   * Import cards from file
   */
  async importCards(
    data: string,
    format: 'json' | 'csv' | 'anki'
  ): Promise<{ imported: number; failed: number }> {
    try {
      const response = await api.post<{ imported: number; failed: number }>('/cards/import', {
        data,
        format,
      });

      // Refresh local cards
      await this.fetchCards();

      return response;
    } catch (error: any) {
      console.error('Import cards error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const contentService = new ContentService();

// Export singleton
export default contentService;

// Export individual functions for backward compatibility
export const createCard = (data: any) => contentService.createCard(data);
export const updateCard = (id: any, data: any) => contentService.updateCard(id, data);
export const deleteCard = (id: any) => contentService.deleteCard(id);