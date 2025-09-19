// ============================================
// src/store/slices/cardSlice.ts
// ============================================
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Card, Category, Deck } from '../../types/card_types';
import contentService from '../../services/api/content';
import { sqliteDb } from '../../services/storage/sqliteDb';
import { offlineQueue } from '../../services/storage/offlineQueue';

interface CardsState {
  cards: Card[];
  categories: Category[];
  decks: Deck[];
  currentCard: Card | null;
  selectedCategory: Category | null;
  selectedDeck: Deck | null;
  dueCards: Card[];
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  filters: {
    categoryId: string | null;
    deckId: string | null;
    searchQuery: string;
    showDueOnly: boolean;
  };
  stats: {
    totalCards: number;
    dueCards: number;
    newCards: number;
    reviewedToday: number;
  };
}

const initialState: CardsState = {
  cards: [],
  categories: [],
  decks: [],
  currentCard: null,
  selectedCategory: null,
  selectedDeck: null,
  dueCards: [],
  isLoading: false,
  isSyncing: false,
  error: null,
  filters: {
    categoryId: null,
    deckId: null,
    searchQuery: '',
    showDueOnly: false,
  },
  stats: {
    totalCards: 0,
    dueCards: 0,
    newCards: 0,
    reviewedToday: 0,
  },
};

// Async Thunks

// Fetch all cards
export const fetchCardsAsync = createAsyncThunk(
  'cards/fetchCards',
  async ({ categoryId, deckId }: { categoryId?: string; deckId?: string } = {}) => {
    const response = await contentService.fetchCards(deckId, categoryId);
    return response.cards;
  }
);

// Fetch due cards
export const fetchDueCardsAsync = createAsyncThunk(
  'cards/fetchDueCards',
  async (limit: number = 20) => {
    const cards = await sqliteDb.getDueCards(limit);
    return cards;
  }
);

// Create a new card
export const createCardAsync = createAsyncThunk(
  'cards/createCard',
  async (cardData: Omit<Card, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const card = await contentService.createCard(cardData);
    return card;
  }
);

// Update a card
export const updateCardAsync = createAsyncThunk(
  'cards/updateCard',
  async ({ id, updates }: { id: string; updates: Partial<Card> }) => {
    const card = await contentService.updateCard(id, updates);
    return card;
  }
);

// Delete a card
export const deleteCardAsync = createAsyncThunk(
  'cards/deleteCard',
  async (cardId: string) => {
    await contentService.deleteCard(cardId);
    return cardId;
  }
);

// Fetch categories
export const fetchCategoriesAsync = createAsyncThunk(
  'cards/fetchCategories',
  async () => {
    const categories = await contentService.fetchCategories();
    return categories;
  }
);

// Create category
export const createCategoryAsync = createAsyncThunk(
  'cards/createCategory',
  async (category: Omit<Category, 'id'>) => {
    const newCategory = await contentService.createCategory(category);
    return newCategory;
  }
);

// Fetch decks
export const fetchDecksAsync = createAsyncThunk(
  'cards/fetchDecks',
  async ({ page = 1, limit = 20, categoryId }: { page?: number; limit?: number; categoryId?: string } = {}) => {
    const response = await contentService.fetchDecks(page, limit, categoryId);
    return response.decks;
  }
);

// Create deck
export const createDeckAsync = createAsyncThunk(
  'cards/createDeck',
  async (deck: Omit<Deck, 'id' | 'createdBy'>) => {
    const newDeck = await contentService.createDeck(deck);
    return newDeck;
  }
);

// Update deck
export const updateDeckAsync = createAsyncThunk(
  'cards/updateDeck',
  async ({ id, updates }: { id: string; updates: Partial<Deck> }) => {
    const deck = await contentService.updateDeck(id, updates);
    return deck;
  }
);

// Delete deck
export const deleteDeckAsync = createAsyncThunk(
  'cards/deleteDeck',
  async (deckId: string) => {
    await contentService.deleteDeck(deckId);
    return deckId;
  }
);

// Bulk import cards
export const bulkImportCardsAsync = createAsyncThunk(
  'cards/bulkImport',
  async (cards: Partial<Card>[]) => {
    const result = await contentService.bulkImportCards(cards);
    // Fetch updated cards after import
    const response = await contentService.fetchCards();
    return { importResult: result, cards: response.cards };
  }
);

// Export cards
export const exportCardsAsync = createAsyncThunk(
  'cards/export',
  async ({ format, cardIds }: { format: 'json' | 'csv' | 'anki'; cardIds?: string[] }) => {
    const result = await contentService.exportCards(format, cardIds);
    return result;
  }
);

// Load cards from local database
export const loadLocalCardsAsync = createAsyncThunk(
  'cards/loadLocal',
  async (categoryId?: string) => {
    const cards = await sqliteDb.getCards(categoryId);
    const categories = await sqliteDb.getCategories();
    const decks = await sqliteDb.getDecks();
    return { cards, categories, decks };
  }
);

// Calculate stats
export const calculateStatsAsync = createAsyncThunk(
  'cards/calculateStats',
  async () => {
    const stats = await sqliteDb.getCardStatsByCategory();
    const dueCards = await sqliteDb.getDueCards(1000);
    
    return {
      totalCards: stats.reduce((sum, s) => sum + s.total, 0),
      dueCards: dueCards.length,
      newCards: dueCards.filter(c => c.repetitions === 0).length,
      reviewedToday: 0, // This would come from review history
    };
  }
);

// Cards Slice
const cardsSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    // Synchronous actions
    setCards: (state, action: PayloadAction<Card[]>) => {
      state.cards = action.payload;
      state.error = null;
    },
    
    addCard: (state, action: PayloadAction<Card>) => {
      state.cards.push(action.payload);
      state.stats.totalCards += 1;
    },
    
    updateCard: (state, action: PayloadAction<Card>) => {
      const index = state.cards.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.cards[index] = action.payload;
      }
      if (state.currentCard?.id === action.payload.id) {
        state.currentCard = action.payload;
      }
    },
    
    deleteCard: (state, action: PayloadAction<string>) => {
      state.cards = state.cards.filter(c => c.id !== action.payload);
      if (state.currentCard?.id === action.payload) {
        state.currentCard = null;
      }
      state.stats.totalCards = Math.max(0, state.stats.totalCards - 1);
    },
    
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    
    addCategory: (state, action: PayloadAction<Category>) => {
      state.categories.push(action.payload);
    },
    
    updateCategory: (state, action: PayloadAction<Category>) => {
      const index = state.categories.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },
    
    deleteCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(c => c.id !== action.payload);
      if (state.selectedCategory?.id === action.payload) {
        state.selectedCategory = null;
      }
    },
    
    setDecks: (state, action: PayloadAction<Deck[]>) => {
      state.decks = action.payload;
    },
    
    addDeck: (state, action: PayloadAction<Deck>) => {
      state.decks.push(action.payload);
    },
    
    updateDeck: (state, action: PayloadAction<Deck>) => {
      const index = state.decks.findIndex(d => d.id === action.payload.id);
      if (index !== -1) {
        state.decks[index] = action.payload;
      }
    },
    
    deleteDeck: (state, action: PayloadAction<string>) => {
      state.decks = state.decks.filter(d => d.id !== action.payload);
      if (state.selectedDeck?.id === action.payload) {
        state.selectedDeck = null;
      }
    },
    
    setCurrentCard: (state, action: PayloadAction<Card | null>) => {
      state.currentCard = action.payload;
    },
    
    setSelectedCategory: (state, action: PayloadAction<Category | null>) => {
      state.selectedCategory = action.payload;
      if (action.payload) {
        state.filters.categoryId = action.payload.id;
      }
    },
    
    setSelectedDeck: (state, action: PayloadAction<Deck | null>) => {
      state.selectedDeck = action.payload;
      if (action.payload) {
        state.filters.deckId = action.payload.id;
      }
    },
    
    setDueCards: (state, action: PayloadAction<Card[]>) => {
      state.dueCards = action.payload;
      state.stats.dueCards = action.payload.length;
    },
    
    setFilters: (state, action: PayloadAction<Partial<CardsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    setStats: (state, action: PayloadAction<Partial<CardsState['stats']>>) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setSyncing: (state, action: PayloadAction<boolean>) => {
      state.isSyncing = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    resetState: () => initialState,
  },
  
  extraReducers: (builder) => {
    // Fetch cards
    builder
      .addCase(fetchCardsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCardsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cards = action.payload;
        state.stats.totalCards = action.payload.length;
      })
      .addCase(fetchCardsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch cards';
      });
    
    // Fetch due cards
    builder
      .addCase(fetchDueCardsAsync.fulfilled, (state, action) => {
        state.dueCards = action.payload;
        state.stats.dueCards = action.payload.length;
        state.stats.newCards = action.payload.filter(c => c.repetitions === 0).length;
      });
    
    // Create card
    builder
      .addCase(createCardAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCardAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cards.push(action.payload);
        state.stats.totalCards += 1;
      })
      .addCase(createCardAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create card';
      });
    
    // Update card
    builder
      .addCase(updateCardAsync.fulfilled, (state, action) => {
        const index = state.cards.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.cards[index] = action.payload;
        }
        if (state.currentCard?.id === action.payload.id) {
          state.currentCard = action.payload;
        }
      });
    
    // Delete card
    builder
      .addCase(deleteCardAsync.fulfilled, (state, action) => {
        state.cards = state.cards.filter(c => c.id !== action.payload);
        if (state.currentCard?.id === action.payload) {
          state.currentCard = null;
        }
        state.stats.totalCards = Math.max(0, state.stats.totalCards - 1);
      });
    
    // Fetch categories
    builder
      .addCase(fetchCategoriesAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCategoriesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategoriesAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      });
    
    // Create category
    builder
      .addCase(createCategoryAsync.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      });
    
    // Fetch decks
    builder
      .addCase(fetchDecksAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDecksAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.decks = action.payload;
      })
      .addCase(fetchDecksAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch decks';
      });
    
    // Create deck
    builder
      .addCase(createDeckAsync.fulfilled, (state, action) => {
        state.decks.push(action.payload);
      });
    
    // Update deck
    builder
      .addCase(updateDeckAsync.fulfilled, (state, action) => {
        const index = state.decks.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.decks[index] = action.payload;
        }
      });
    
    // Delete deck
    builder
      .addCase(deleteDeckAsync.fulfilled, (state, action) => {
        state.decks = state.decks.filter(d => d.id !== action.payload);
        if (state.selectedDeck?.id === action.payload) {
          state.selectedDeck = null;
        }
      });
    
    // Bulk import
    builder
      .addCase(bulkImportCardsAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(bulkImportCardsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cards = action.payload.cards;
        state.stats.totalCards = action.payload.cards.length;
      })
      .addCase(bulkImportCardsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to import cards';
      });
    
    // Load local cards
    builder
      .addCase(loadLocalCardsAsync.fulfilled, (state, action) => {
        state.cards = action.payload.cards;
        state.categories = action.payload.categories;
        state.decks = action.payload.decks;
        state.stats.totalCards = action.payload.cards.length;
      });
    
    // Calculate stats
    builder
      .addCase(calculateStatsAsync.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

// Export actions
export const {
  setCards,
  addCard,
  updateCard,
  deleteCard,
  setCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  setDecks,
  addDeck,
  updateDeck,
  deleteDeck,
  setCurrentCard,
  setSelectedCategory,
  setSelectedDeck,
  setDueCards,
  setFilters,
  clearFilters,
  setStats,
  setLoading,
  setSyncing,
  setError,
  clearError,
  resetState,
} = cardsSlice.actions;

// Export reducer
export default cardsSlice.reducer;