import { panelApi } from './panelApi.api';
import type { Book, CreateBookDto, UpdateBookDto } from '@/library/interfaces/book.interface';

export const getBooks = async (): Promise<Book[]> => {
    try {
        const { data } = await panelApi.get<Book[]>('/books');
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
