import { panelApi } from './panelApi.api';
import type { BookCategory } from '@/library/interfaces/book.interface';

export const getCategories = async (): Promise<BookCategory[]> => {
    try {
        const { data } = await panelApi.get<BookCategory[]>('/categories');
        return data;
    } catch (error) {
        console.error('Error al obtener las categorías:', error);
        throw error;
    }
};

export interface DeleteCategoryResponse {
    message: string;
}

export const deleteCategory = async (categoryId: string): Promise<DeleteCategoryResponse> => {
    try {
        const { data } = await panelApi.delete<DeleteCategoryResponse>(`/categories/${categoryId}`);
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

export const createCategory = async (categoryData: CreateCategoryDto): Promise<CreateCategoryResponse> => {
    try {
        const { data } = await panelApi.post<CreateCategoryResponse>('/categories', categoryData);
        return data;
    } catch (error) {
        console.error('Error al crear la categoría:', error);
        throw error;
    }
};

export const getCategoryById = async (categoryId: string): Promise<BookCategory> => {
    try {
        const { data } = await panelApi.get<BookCategory>(`/categories/${categoryId}`);
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

export const updateCategory = async (categoryId: string, categoryData: UpdateCategoryDto): Promise<UpdateCategoryResponse> => {
    try {
        const { data } = await panelApi.patch<UpdateCategoryResponse>(`/categories/${categoryId}`, categoryData);
        return data;
    } catch (error) {
        console.error('Error al actualizar la categoría:', error);
        throw error;
    }
};
