import { libraryApi } from './libraryApi.api';
import { getReaderIdFromToken } from '@/auth/utils/jwt.utils';
import type { SortType } from '@/mocks/filters.mock';
import type { Book } from '../interfaces/book.interface';

export interface ReadingHistory {
    _id: string;
    reader: string;
    book: Book;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface GetReadingHistoryResponse {
    readingHistory: ReadingHistory[];
    total: number;
    totalPages: number;
    page: number;
}

export interface GetReadingHistoryParams {
    limit?: number;
    skip?: number;
    sort?: SortType;
}

export interface AddReadingHistoryParams {
    book: string;
    reader: string;
}

export const addReadingHistory = async (params: AddReadingHistoryParams): Promise<void> => {
    try {
        await libraryApi.post('/reading-history', params);
    } catch (error) {
        console.error('Error al agregar al historial de lectura:', error);
        throw error;
    }
};

export interface RemoveReadingHistoryParams {
    bookId: string;
    readerId: string;
}

export const removeReadingHistory = async (params: RemoveReadingHistoryParams): Promise<void> => {
    try {
        await libraryApi.delete(`/reading-history/${params.readerId}/${params.bookId}`);
    } catch (error) {
        console.error('Error al remover del historial de lectura:', error);
        throw error;
    }
};

export const getReadingHistory = async (
    params?: GetReadingHistoryParams
): Promise<GetReadingHistoryResponse> => {
    try {
        const readerId = getReaderIdFromToken();
        if (!readerId) {
            throw new Error('No se pudo obtener el ID del lector del token');
        }

        const { data } = await libraryApi.get<GetReadingHistoryResponse>(
            `/reading-history/${readerId}`,
            {
                params: {
                    limit: params?.limit,
                    skip: params?.skip,
                    sort: params?.sort,
                },
            }
        );
        return data;
    } catch (error) {
        console.error('Error al obtener el historial de lectura:', error);
        throw error;
    }
};
