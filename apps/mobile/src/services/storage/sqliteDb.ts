// ============================================
// src/services/storage/sqliteDb.ts
// ============================================
import * as SQLite from 'expo-sqlite';
import { Card, Category, Deck } from '../../types/card_types';
import { ReviewHistory } from '../../types/review_types';

class SQLiteService {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized: boolean = false;

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Open or create the database
      this.db = await SQLite.openDatabaseAsync('mindforge.db');
      
      // Enable foreign keys
      await this.db.execAsync('PRAGMA foreign_keys = ON;');
      
      // Create tables
      await this.createTables();
      
      this.isInitialized = true;
      console.log('SQLite database initialized successfully');
    } catch (error) {
      console.error('Error initializing SQLite:', error);
      throw error;
    }
  }

  private async createTables() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      await this.db.execAsync(`
        -- Cards table
        CREATE TABLE IF NOT EXISTS cards (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          categoryId TEXT NOT NULL,
          front TEXT NOT NULL,
          back TEXT NOT NULL,
          mediaUrl TEXT,
          difficulty REAL DEFAULT 2.5,
          interval INTEGER DEFAULT 0,
          repetitions INTEGER DEFAULT 0,
          easeFactor REAL DEFAULT 2.5,
          nextReview INTEGER,
          lastReview INTEGER,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL,
          tags TEXT DEFAULT '[]',
          syncStatus TEXT DEFAULT 'pending'
        );

        -- Categories table
        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          icon TEXT NOT NULL,
          color TEXT NOT NULL,
          cardCount INTEGER DEFAULT 0,
          description TEXT,
          isActive INTEGER DEFAULT 1,
          syncStatus TEXT DEFAULT 'pending'
        );

        -- Reviews table
        CREATE TABLE IF NOT EXISTS reviews (
          id TEXT PRIMARY KEY,
          cardId TEXT NOT NULL,
          rating INTEGER NOT NULL,
          reviewedAt INTEGER NOT NULL,
          timeSpent INTEGER DEFAULT 0,
          correct INTEGER DEFAULT 0,
          syncStatus TEXT DEFAULT 'pending',
          FOREIGN KEY (cardId) REFERENCES cards (id) ON DELETE CASCADE
        );

        -- Decks table
        CREATE TABLE IF NOT EXISTS decks (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          categoryId TEXT NOT NULL,
          isPublic INTEGER DEFAULT 0,
          createdBy TEXT NOT NULL,
          thumbnail TEXT,
          cardCount INTEGER DEFAULT 0,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL,
          syncStatus TEXT DEFAULT 'pending'
        );

        -- Sync metadata table
        CREATE TABLE IF NOT EXISTS sync_metadata (
          id TEXT PRIMARY KEY,
          entityType TEXT NOT NULL,
          entityId TEXT NOT NULL,
          lastSyncedAt INTEGER NOT NULL,
          version INTEGER DEFAULT 1
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_cards_category ON cards(categoryId);
        CREATE INDEX IF NOT EXISTS idx_cards_next_review ON cards(nextReview);
        CREATE INDEX IF NOT EXISTS idx_cards_sync_status ON cards(syncStatus);
        CREATE INDEX IF NOT EXISTS idx_reviews_card ON reviews(cardId);
        CREATE INDEX IF NOT EXISTS idx_reviews_date ON reviews(reviewedAt);
      `);

      console.log('Database tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  private async ensureInitialized() {
    if (!this.isInitialized || !this.db) {
      await this.initialize();
    }
  }

  // Card operations
  async saveCard(card: Card): Promise<void> {
    await this.ensureInitialized();
    
    const query = `
      INSERT OR REPLACE INTO cards 
      (id, userId, categoryId, front, back, mediaUrl, difficulty, interval, 
       repetitions, easeFactor, nextReview, lastReview, createdAt, updatedAt, tags, syncStatus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `;
    
    const params = [
      card.id,
      card.userId,
      card.categoryId,
      card.front,
      card.back,
      card.mediaUrl || null,
      card.difficulty,
      card.interval,
      card.repetitions,
      card.easeFactor,
      card.nextReview ? new Date(card.nextReview).getTime() : Date.now(),
      card.lastReview ? new Date(card.lastReview).getTime() : null,
      new Date(card.createdAt).getTime(),
      new Date(card.updatedAt).getTime(),
      JSON.stringify(card.tags || []),
    ];
    
    try {
      await this.db!.runAsync(query, params);
    } catch (error) {
      console.error('Error saving card:', error);
      throw error;
    }
  }

  async getCards(categoryId?: string, limit: number = 100): Promise<Card[]> {
    await this.ensureInitialized();
    
    let query = 'SELECT * FROM cards';
    const params: any[] = [];
    
    if (categoryId) {
      query += ' WHERE categoryId = ?';
      params.push(categoryId);
    }
    
    query += ' ORDER BY nextReview ASC LIMIT ?';
    params.push(limit);
    
    try {
      const result = await this.db!.getAllAsync(query, params);
      return result.map(this.parseCard);
    } catch (error) {
      console.error('Error getting cards:', error);
      return [];
    }
  }

  async getCard(cardId: string): Promise<Card | null> {
    await this.ensureInitialized();
    
    const query = 'SELECT * FROM cards WHERE id = ?';
    
    try {
      const result = await this.db!.getFirstAsync(query, [cardId]);
      return result ? this.parseCard(result) : null;
    } catch (error) {
      console.error('Error getting card:', error);
      return null;
    }
  }

  async getDueCards(limit: number = 20): Promise<Card[]> {
    await this.ensureInitialized();
    
    const now = Date.now();
    const query = `
      SELECT * FROM cards 
      WHERE nextReview <= ? 
      ORDER BY nextReview ASC 
      LIMIT ?
    `;
    
    try {
      const result = await this.db!.getAllAsync(query, [now, limit]);
      return result.map(this.parseCard);
    } catch (error) {
      console.error('Error getting due cards:', error);
      return [];
    }
  }

  async deleteCard(cardId: string): Promise<void> {
    await this.ensureInitialized();
    
    const query = 'DELETE FROM cards WHERE id = ?';
    
    try {
      await this.db!.runAsync(query, [cardId]);
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  }

  private parseCard(row: any): Card {
    return {
      id: row.id,
      userId: row.userId,
      categoryId: row.categoryId,
      front: row.front,
      back: row.back,
      mediaUrl: row.mediaUrl,
      difficulty: row.difficulty,
      interval: row.interval,
      repetitions: row.repetitions,
      easeFactor: row.easeFactor,
      tags: JSON.parse(row.tags || '[]'),
      nextReview: row.nextReview ? new Date(row.nextReview) : new Date(),
      lastReview: row.lastReview ? new Date(row.lastReview) : undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  // Category operations
  async saveCategory(category: Category): Promise<void> {
    await this.ensureInitialized();
    
    const query = `
      INSERT OR REPLACE INTO categories 
      (id, name, icon, color, cardCount, description, isActive, syncStatus)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `;
    
    const params = [
      category.id,
      category.name,
      category.icon,
      category.color,
      category.cardCount || 0,
      category.description || '',
      category.isActive ? 1 : 0,
    ];
    
    try {
      await this.db!.runAsync(query, params);
    } catch (error) {
      console.error('Error saving category:', error);
      throw error;
    }
  }

  async getCategories(): Promise<Category[]> {
    await this.ensureInitialized();
    
    const query = 'SELECT * FROM categories WHERE isActive = 1 ORDER BY name ASC';
    
    try {
      const result = await this.db!.getAllAsync(query);
      return result.map((row: any) => ({
        id: row.id,
        name: row.name,
        icon: row.icon,
        color: row.color,
        cardCount: row.cardCount,
        description: row.description,
        isActive: row.isActive === 1,
      }));
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  async getCategory(categoryId: string): Promise<Category | null> {
    await this.ensureInitialized();
    
    const query = 'SELECT * FROM categories WHERE id = ?';
    
    try {
      const result = await this.db!.getFirstAsync(query, [categoryId]) as any;
      if (result) {
        return {
          id: result.id,
          name: result.name,
          icon: result.icon,
          color: result.color,
          cardCount: result.cardCount,
          description: result.description,
          isActive: result.isActive === 1,
        } as Category;
      }
      return null;
    } catch (error) {
      console.error('Error getting category:', error);
      return null;
    }
  }

  async deleteCategory(categoryId: string): Promise<void> {
    await this.ensureInitialized();
    
    // Soft delete - just mark as inactive
    const query = 'UPDATE categories SET isActive = 0 WHERE id = ?';
    
    try {
      await this.db!.runAsync(query, [categoryId]);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // Deck operations
  async saveDeck(deck: Deck): Promise<void> {
    await this.ensureInitialized();
    
    const query = `
      INSERT OR REPLACE INTO decks 
      (id, name, description, categoryId, isPublic, createdBy, thumbnail, cardCount, createdAt, updatedAt, syncStatus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `;
    
    const params = [
      deck.id,
      deck.name,
      deck.description,
      deck.categoryId,
      deck.isPublic ? 1 : 0,
      deck.createdBy,
      deck.thumbnail || null,
      deck.cards?.length || 0,
      Date.now(),
      Date.now(),
    ];
    
    try {
      await this.db!.runAsync(query, params);
    } catch (error) {
      console.error('Error saving deck:', error);
      throw error;
    }
  }

  async getDecks(): Promise<Deck[]> {
    await this.ensureInitialized();
    
    const query = 'SELECT * FROM decks ORDER BY updatedAt DESC';
    
    try {
      const result = await this.db!.getAllAsync(query);
      return result.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        categoryId: row.categoryId,
        cards: [], // Cards need to be loaded separately
        isPublic: row.isPublic === 1,
        createdBy: row.createdBy,
        thumbnail: row.thumbnail,
      }));
    } catch (error) {
      console.error('Error getting decks:', error);
      return [];
    }
  }

  // Review operations
  async saveReview(review: ReviewHistory): Promise<void> {
    await this.ensureInitialized();
    
    const query = `
      INSERT INTO reviews 
      (id, cardId, rating, reviewedAt, timeSpent, correct, syncStatus)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `;
    
    const params = [
      `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      review.cardId,
      review.rating,
      review.reviewedAt ? new Date(review.reviewedAt).getTime() : Date.now(),
      review.timeSpent || 0,
      review.correct ? 1 : 0,
    ];
    
    try {
      await this.db!.runAsync(query, params);
    } catch (error) {
      console.error('Error saving review:', error);
      throw error;
    }
  }

  async getReviews(cardId?: string, limit: number = 100): Promise<ReviewHistory[]> {
    await this.ensureInitialized();
    
    let query = 'SELECT * FROM reviews';
    const params: any[] = [];
    
    if (cardId) {
      query += ' WHERE cardId = ?';
      params.push(cardId);
    }
    
    query += ' ORDER BY reviewedAt DESC LIMIT ?';
    params.push(limit);
    
    try {
      const result = await this.db!.getAllAsync(query, params);
      return result.map((row: any) => ({
        cardId: row.cardId,
        rating: row.rating,
        reviewedAt: new Date(row.reviewedAt),
        timeSpent: row.timeSpent,
        correct: row.correct === 1,
      }));
    } catch (error) {
      console.error('Error getting reviews:', error);
      return [];
    }
  }

  // Sync operations
  async getUnsyncedData(): Promise<{
    cards: Card[];
    categories: Category[];
    reviews: ReviewHistory[];
    decks: Deck[];
  }> {
    await this.ensureInitialized();
    
    try {
      const cards = await this.db!.getAllAsync(
        "SELECT * FROM cards WHERE syncStatus = 'pending'"
      );
      
      const categories = await this.db!.getAllAsync(
        "SELECT * FROM categories WHERE syncStatus = 'pending'"
      );
      
      const reviews = await this.db!.getAllAsync(
        "SELECT * FROM reviews WHERE syncStatus = 'pending'"
      );
      
      const decks = await this.db!.getAllAsync(
        "SELECT * FROM decks WHERE syncStatus = 'pending'"
      );
      
      return {
        cards: cards.map(this.parseCard),
        categories: categories.map((row: any) => ({
          id: row.id,
          name: row.name,
          icon: row.icon,
          color: row.color,
          cardCount: row.cardCount,
          description: row.description,
          isActive: row.isActive === 1,
        })),
        reviews: reviews.map((row: any) => ({
          cardId: row.cardId,
          rating: row.rating,
          reviewedAt: new Date(row.reviewedAt),
          timeSpent: row.timeSpent,
          correct: row.correct === 1,
        })),
        decks: decks.map((row: any) => ({
          id: row.id,
          name: row.name,
          description: row.description,
          categoryId: row.categoryId,
          cards: [],
          isPublic: row.isPublic === 1,
          createdBy: row.createdBy,
          thumbnail: row.thumbnail,
        })),
      };
    } catch (error) {
      console.error('Error getting unsynced data:', error);
      return {
        cards: [],
        categories: [],
        reviews: [],
        decks: [],
      };
    }
  }

  async markAsSynced(table: string, ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    
    await this.ensureInitialized();
    
    const placeholders = ids.map(() => '?').join(',');
    const query = `
      UPDATE ${table} 
      SET syncStatus = 'synced' 
      WHERE id IN (${placeholders})
    `;
    
    try {
      await this.db!.runAsync(query, ids);
    } catch (error) {
      console.error('Error marking as synced:', error);
      throw error;
    }
  }

  async updateSyncStatus(table: string, id: string, status: 'pending' | 'synced' | 'error'): Promise<void> {
    await this.ensureInitialized();
    
    const query = `UPDATE ${table} SET syncStatus = ? WHERE id = ?`;
    
    try {
      await this.db!.runAsync(query, [status, id]);
    } catch (error) {
      console.error('Error updating sync status:', error);
      throw error;
    }
  }

  // Statistics
  async getCardStatsByCategory(): Promise<{ categoryId: string; total: number; due: number }[]> {
    await this.ensureInitialized();
    
    const query = `
      SELECT 
        categoryId,
        COUNT(*) as total,
        SUM(CASE WHEN nextReview <= ? THEN 1 ELSE 0 END) as due
      FROM cards
      GROUP BY categoryId
    `;
    
    try {
      const result = await this.db!.getAllAsync(query, [Date.now()]);
      return result.map((row: any) => ({
        categoryId: row.categoryId,
        total: row.total,
        due: row.due,
      }));
    } catch (error) {
      console.error('Error getting card stats:', error);
      return [];
    }
  }

  // Utility operations
  async clearAllData(): Promise<void> {
    await this.ensureInitialized();
    
    const tables = ['reviews', 'cards', 'categories', 'decks', 'sync_metadata'];
    
    try {
      for (const table of tables) {
        await this.db!.runAsync(`DELETE FROM ${table}`);
      }
      console.log('All data cleared from SQLite database');
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  async vacuum(): Promise<void> {
    await this.ensureInitialized();
    
    try {
      await this.db!.execAsync('VACUUM');
      console.log('Database optimized');
    } catch (error) {
      console.error('Error optimizing database:', error);
    }
  }

  async getDatabaseSize(): Promise<number> {
    await this.ensureInitialized();
    
    try {
      const result = await this.db!.getFirstAsync(
        "SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()"
      );
      return (result as any)?.size || 0;
    } catch (error) {
      console.error('Error getting database size:', error);
      return 0;
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.isInitialized = false;
      console.log('SQLite database closed');
    }
  }

  // Transaction support
  async runInTransaction<T>(callback: () => Promise<T>): Promise<T> {
    await this.ensureInitialized();
    
    try {
      await this.db!.execAsync('BEGIN TRANSACTION');
      const result = await callback();
      await this.db!.execAsync('COMMIT');
      return result;
    } catch (error) {
      await this.db!.execAsync('ROLLBACK');
      throw error;
    }
  }
}

// Create and export singleton instance
export const sqliteDb = new SQLiteService();

// Also export the class for testing purposes
export { SQLiteService };