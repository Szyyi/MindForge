// ============================================
// src/types/navigation.types.ts
// ============================================
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Review: undefined;
  Library: undefined;
  Stats: undefined;
  Profile: undefined;
};

export type LibraryStackParamList = {
  LibraryList: undefined;
  CategoryDetail: { categoryId: string };
  AddCard: { categoryId?: string };
  CardDetail: { cardId: string };
  ImportContent: undefined;
};