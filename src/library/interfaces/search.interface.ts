import type { Book } from './book.interface';

export interface SearchCategory {
  _id: string;
  name: string;
}

export interface SearchBook extends Book {
  coverImage?: string;
}

export interface SearchAuthor {
  _id: string;
  person: {
    _id: string;
    firstName: string;
    lastName: string;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
  };
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface SearchResponse {
  books: SearchBook[];
  authors: SearchAuthor[];
  categories: SearchCategory[];
  total: number;
}

export interface SearchParams {
  term: string;
  limit?: number;
}
