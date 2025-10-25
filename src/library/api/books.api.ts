import { libraryApi } from './libraryApi.api';
import type { Book } from '@/library/interfaces/book.interface';

export interface GetBooksParams {
    limit?: number;
    skip?: number;
}

export interface GetBooksResponse {
    books: Book[];
    total: number;
    page: number;
    totalPages: number;
}

export const getBooks = async (params?: GetBooksParams): Promise<GetBooksResponse> => {
    try {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.skip) queryParams.append('skip', params.skip.toString());

        const url = `/books${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const { data } = await libraryApi.get<GetBooksResponse>(url);
        return data;
    } catch (error) {
        console.error('Error al obtener los libros:', error);
        throw error;
    }
};

export const getBookById = async (bookId: string): Promise<Book> => {
    try {
        const { data } = await libraryApi.get<Book>(`/books/${bookId}`);
        return data;
    } catch (error) {
        console.error('Error al obtener el libro:', error);
        throw error;
    }
};
