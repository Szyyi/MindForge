// ============================================
// src/store/slices/cardsSlice.ts
// ============================================
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Card, Category, Deck } from '../../types/card_types';

interface CardsState {
  cards: Card[];
  categories: Category[];
  decks: Deck[];
  currentCard: Card | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CardsState = {
  cards: [],
  categories: [],
  decks: [],
  currentCard: null,
  isLoading: false,
  error: null,
};

const cardsSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    setCards: (state, action: PayloadAction<Card[]>) => {
      state.cards = action.payload;
    },
    addCard: (state, action: PayloadAction<Card>) => {
      state.cards.push(action.payload);
    },
    updateCard: (state, action: PayloadAction<Card>) => {
      const index = state.cards.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.cards[index] = action.payload;
      }
    },
    deleteCard: (state, action: PayloadAction<string>) => {
      state.cards = state.cards.filter(c => c.id !== action.payload);
    },
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    setCurrentCard: (state, action: PayloadAction<Card | null>) => {
      state.currentCard = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCards,
  addCard,
  updateCard,
  deleteCard,
  setCategories,
  setCurrentCard,
  setLoading,
  setError,
} = cardsSlice.actions;
export default cardsSlice.reducer;