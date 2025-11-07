// Interfaces para estadísticas del panel

export interface UserStats {
  totalReaders: number;
  totalLibrarians: number;
}

export interface BookStats {
  totalBooks: number;
}

export interface CategoryStats {
  totalCategories: number;
}

export interface AuthorStats {
  totalAuthors: number;
}

// Interfaces para rankings

export interface BookRankingItem {
  _id: string;
  title: string;
  author: string;
  category: string;
  coverImage?: string;
  count: number; // número de favoritos o leídos
}

export interface CategoryRankingItem {
  _id: string;
  name: string;
  totalBooks: number;
  count: number; // número de favoritos o leídos
}

export interface AuthorRankingItem {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  totalBooks: number;
  count: number; // número de favoritos o leídos
}

export interface BookRanking {
  mostRead: BookRankingItem[];
  mostFavorited: BookRankingItem[];
}

export interface CategoryRanking {
  mostRead: CategoryRankingItem[];
  mostFavorited: CategoryRankingItem[];
}

export interface AuthorRanking {
  mostRead: AuthorRankingItem[];
  mostFavorited: AuthorRankingItem[];
}

export interface FavoritesStats {
  total: number;
}

export interface ReadingHistoryStats {
  total: number;
}

export interface DashboardStats {
  users: UserStats;
  books: BookStats;
  categories: CategoryStats;
  authors: AuthorStats;
  bookRankings: BookRanking;
  categoryRankings: CategoryRanking;
  authorRankings: AuthorRanking;
  favorites?: FavoritesStats;
  readingHistory?: ReadingHistoryStats;
}
