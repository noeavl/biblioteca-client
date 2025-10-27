import { libraryApi } from './libraryApi.api';
import type { BookCategory } from '@/library/interfaces/book.interface';
import type { SortType } from '@/mocks/filters.mock';

export interface GetCategoriesParams {
    limit?: number;
    skip?: number;
    sort?: SortType; // Tipo de ordenamiento
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
        if (params?.sort) {
            queryParams.append('sort', params.sort);
        }

        const url = `/categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const { data } = await libraryApi.get<GetCategoriesResponse>(url);
        return data;
    } catch (error) {
        console.error('Error al obtener las categorías:', error);
        throw error;
    }
};
