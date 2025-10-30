import { libraryApi } from './libraryApi.api';
import type { Book } from '@/library/interfaces/book.interface';
import type { SortType } from '@/mocks/filters.mock';

export interface GetBooksParams {
    limit?: number;
    skip?: number;
    authors?: string[]; // Array de IDs de autores
    categories?: string[]; // Array de IDs de categorías
    sort?: SortType; // Tipo de ordenamiento
    status?: string;
}

export interface GetBooksResponse {
    books: Book[];
    total: number;
    page: number;
    totalPages: number;
}

export const getBooks = async (
    params?: GetBooksParams
): Promise<GetBooksResponse> => {
    try {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.skip) queryParams.append('skip', params.skip.toString());

        // Agregar filtros de autores (comma-separated IDs)
        if (params?.authors && params.authors.length > 0)
            queryParams.append('authors', params.authors.join(','));

        // Agregar filtros de categorías (comma-separated IDs)
        if (params?.categories && params.categories.length > 0)
            queryParams.append('categories', params.categories.join(','));

        // Agregar ordenamiento
        if (params?.sort) queryParams.append('sort', params.sort);

        if (params?.status != null) queryParams.append('status', params.status);

        const url = `/books${
            queryParams.toString() ? `?${queryParams.toString()}` : ''
        }`;
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
