import { panelApi } from './panelApi.api';
import type { Author } from '@/library/interfaces/author.interface';

export const getAuthors = async (): Promise<Author[]> => {
    try {
        const { data } = await panelApi.get<Author[]>('/authors');
        return data;
    } catch (error) {
        console.error('Error al obtener los autores:', error);
        throw error;
    }
};
