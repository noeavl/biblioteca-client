// Analytics API Response Interfaces

export interface BookAnalytics {
    _id: string;
    title: string;
    publicationYear: number;
    coverImage?: string;
    author: {
        _id: string;
        person: {
            _id: string;
            lastName: string;
        };
    };
    category: {
        _id: string;
        name: string;
    };
}

export interface TopFavoriteBook extends BookAnalytics {
    favoriteCount: number;
}

export interface TopReadBook extends BookAnalytics {
    readCount: number;
}

export interface BooksAnalytics {
    total: number;
    topFavoriteBooks: TopFavoriteBook[];
    topReadBooks: TopReadBook[];
}

export interface AuthorAnalytics {
    _id: string;
    person: {
        _id: string;
        firstName: string;
        lastName: string;
    };
}

export interface TopFavoriteAuthor extends AuthorAnalytics {
    favoriteCount: number;
}

export interface TopReadAuthor extends AuthorAnalytics {
    readCount: number;
}

export interface AuthorsAnalytics {
    total: number;
    topFavoriteAuthors: TopFavoriteAuthor[];
    topReadAuthors: TopReadAuthor[];
}

export interface CategoryAnalytics {
    _id: string;
    name: string;
}

export interface TopFavoriteCategory extends CategoryAnalytics {
    favoriteCount: number;
}

export interface TopReadCategory extends CategoryAnalytics {
    readCount: number;
}

export interface CategoriesAnalytics {
    total: number;
    topFavoriteCategories: TopFavoriteCategory[];
    topReadCategories: TopReadCategory[];
}

export interface FavoritesAnalytics {
    total: number;
}

export interface ReadingHistoryAnalytics {
    total: number;
}

export interface DashboardAnalytics {
    books: BooksAnalytics;
    authors: AuthorsAnalytics;
    categories: CategoriesAnalytics;
    favorites: FavoritesAnalytics;
    readingHistory: ReadingHistoryAnalytics;
}
