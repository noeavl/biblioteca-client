import { panelApi } from './panelApi.api';
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

export const getCategories = async (
    params?: GetCategoriesParams
): Promise<GetCategoriesResponse> => {
    try {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.skip) queryParams.append('skip', params.skip.toString());

        const url = `/categories${
            queryParams.toString() ? `?${queryParams.toString()}` : ''
        }`;
        const { data } = await panelApi.get<GetCategoriesResponse>(url);
        return data;
    } catch (error) {
        console.error('Error al obtener las categorías:', error);
        throw error;
    }
};

export interface DeleteCategoryResponse {
    message: string;
}

export const deleteCategory = async (
    categoryId: string
): Promise<DeleteCategoryResponse> => {
    try {
        const { data } = await panelApi.delete<DeleteCategoryResponse>(
            `/categories/${categoryId}`
        );
        return data;
    } catch (error) {
        console.error('Error al eliminar la categoría:', error);
        throw error;
    }
};

export interface CreateCategoryDto {
    name: string;
}

export interface CreateCategoryResponse {
    message: string;
    category: BookCategory;
}

export const createCategory = async (
    categoryData: CreateCategoryDto
): Promise<CreateCategoryResponse> => {
    try {
        const { data } = await panelApi.post<CreateCategoryResponse>(
            '/categories',
            categoryData
        );
        return data;
    } catch (error) {
        console.error('Error al crear la categoría:', error);
        throw error;
    }
};

export const getCategoryById = async (
    categoryId: string
): Promise<BookCategory> => {
    try {
        const { data } = await panelApi.get<BookCategory>(
            `/categories/${categoryId}`
        );
        return data;
    } catch (error) {
        console.error('Error al obtener la categoría:', error);
        throw error;
    }
};

export interface UpdateCategoryDto {
    name?: string;
}

export interface UpdateCategoryResponse {
    message: string;
}

export const updateCategory = async (
    categoryId: string,
    categoryData: UpdateCategoryDto
): Promise<UpdateCategoryResponse> => {
    try {
        const { data } = await panelApi.patch<UpdateCategoryResponse>(
            `/categories/${categoryId}`,
            categoryData
        );
        return data;
    } catch (error) {
        console.error('Error al actualizar la categoría:', error);
        throw error;
    }
};
