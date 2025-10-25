import { panelApi } from './panelApi.api';
import type { Book, CreateBookDto, UpdateBookDto } from '@/library/interfaces/book.interface';

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
        const { data } = await panelApi.get<GetBooksResponse>(url);
        return data;
    } catch (error) {
        console.error('Error al obtener los libros:', error);
        throw error;
    }
};

export const getBookById = async (bookId: string): Promise<Book> => {
    try {
        const { data } = await panelApi.get<Book>(`/books/${bookId}`);
        return data;
    } catch (error) {
        console.error('Error al obtener el libro:', error);
        throw error;
    }
};

export interface CreateBookResponse {
    message: string;
    book: {
        _id: string;
        title: string;
        publicationYear: number;
    };
}

export const createBook = async (bookData: CreateBookDto): Promise<CreateBookResponse> => {
    try {
        const payload = {
            authorId: bookData.authorId,
            title: bookData.title,
            publicationYear: bookData.publicationYear,
            categoryId: bookData.categoryId,
        };

        const { data } = await panelApi.post<CreateBookResponse>('/books', payload);
        return data;
    } catch (error) {
        console.error('Error al crear el libro:', error);
        throw error;
    }
};

export const updateBook = async (bookId: string, bookData: UpdateBookDto): Promise<Book> => {
    try {
        const { data } = await panelApi.patch<Book>(`/books/${bookId}`, bookData);
        return data;
    } catch (error) {
        console.error('Error al actualizar el libro:', error);
        throw error;
    }
};
