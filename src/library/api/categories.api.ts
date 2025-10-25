import { libraryApi } from './libraryApi.api';
import type { BookCategory } from '@/library/interfaces/book.interface';

export interface GetCategoriesParams {
    limit?: number;
    skip?: number;
}

export interface GetCategoriesResponse {
    categories: BookCategory[];
    total: number;
    page: number;
    totalPages: number;
}

export const getCategories = async (params?: GetCategoriesParams): Promise<GetCategoriesResponse> => {
    try {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.skip) queryParams.append('skip', params.skip.toString());

        const url = `/categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const { data } = await libraryApi.get<GetCategoriesResponse>(url);
        return data;
    } catch (error) {
        console.error('Error al obtener las categorías:', error);
        throw error;
    }
};
