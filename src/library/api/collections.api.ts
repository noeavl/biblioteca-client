import { libraryApi } from './libraryApi.api';
import type { BookCategory } from '@/library/interfaces/book.interface';

// Person interface for author
export interface CollectionBookPerson {
    _id: string;
    firstName: string;
    lastName: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

// Author interface for collection books (with populated person field)
export interface CollectionBookAuthor {
    _id: string;
    person: CollectionBookPerson; // Populated with person data
    status: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

// Book interface specific to collection responses
export interface CollectionBook {
    _id: string;
    author: CollectionBookAuthor;
    title: string;
    synopsis: string;
    publicationYear: number;
    category: BookCategory;
    status: boolean;
    coverImage?: string;
    fileName?: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface Collection {
    _id: string;
    reader: string;
    name: string;
    visibility: 'private' | 'public';
    books: string[];
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface CollectionWithBooks extends Omit<Collection, 'books'> {
    books: CollectionBook[];
    pagination: {
        total: number;
        page: number;
        totalPages: number;
    };
}

export interface CreateCollectionDto {
    reader: string;
    name: string;
    visibility: 'private' | 'public';
}

export interface CreateCollectionResponse {
    message: string;
}

export interface GetCollectionParams {
    withBooks?: boolean;
    limit?: number;
    page?: number;
}

export const getCollectionsByReader = async (
    readerId: string
): Promise<Collection[]> => {
    try {
        const { data } = await libraryApi.get<Collection[]>(
            `/collections/reader/${readerId}`
        );
        return data;
    } catch (error) {
        console.error('Error al obtener colecciones:', error);
        throw error;
    }
};

export const getCollectionById = async (
    collectionId: string,
    params?: GetCollectionParams
): Promise<CollectionWithBooks> => {
    try {
        const queryParams = new URLSearchParams();
        if (params?.withBooks) {
            queryParams.append('withBooks', 'true');
        }
        if (params?.limit) {
            queryParams.append('limit', params.limit.toString());
        }
        if (params?.page) {
            queryParams.append('page', params.page.toString());
        }

        const url = `/collections/${collectionId}${
            queryParams.toString() ? `?${queryParams.toString()}` : ''
        }`;

        const { data } = await libraryApi.get<CollectionWithBooks>(url);
        return data;
    } catch (error) {
        console.error('Error al obtener colección:', error);
        throw error;
    }
};

export const createCollection = async (
    collectionData: CreateCollectionDto
): Promise<CreateCollectionResponse> => {
    try {
        const { data } = await libraryApi.post<CreateCollectionResponse>(
            '/collections',
            collectionData
        );
        return data;
    } catch (error) {
        console.error('Error al crear colección:', error);
        throw error;
    }
};

export const addBookToCollection = async (
    collectionId: string,
    bookId: string
): Promise<{ message: string }> => {
    try {
        const { data } = await libraryApi.post<{ message: string }>(
            `/collections/${collectionId}/books`,
            { bookId }
        );
        return data;
    } catch (error) {
        console.error('Error al agregar libro a colección:', error);
        throw error;
    }
};

export const addBookToCollectionDirect = async (
    bookId: string,
    collectionId: string
): Promise<{ message: string }> => {
    try {
        const { data } = await libraryApi.post<{ message: string }>(
            `/collections/books`,
            { book: bookId, collection: collectionId }
        );
        return data;
    } catch (error) {
        console.error('Error al agregar libro a colección:', error);
        throw error;
    }
};

export const removeBookFromCollection = async (
    collectionId: string,
    bookId: string
): Promise<{ message: string }> => {
    try {
        const { data } = await libraryApi.delete<{ message: string }>(
            `/collections/${collectionId}/books/${bookId}`
        );
        return data;
    } catch (error) {
        console.error('Error al remover libro de colección:', error);
        throw error;
    }
};
