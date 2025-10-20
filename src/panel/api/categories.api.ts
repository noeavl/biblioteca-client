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
