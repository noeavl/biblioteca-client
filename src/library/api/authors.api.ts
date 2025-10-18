import { libraryApi } from './libraryApi.api';
import type { Author } from '../interfaces/author.interface';

export const getAuthors = async (): Promise<Author[]> => {
    try {
        const { data } = await libraryApi.get<Author[]>('/authors');
        return data;
    } catch (error) {
        console.error('Error al obtener los autores:', error);
        throw error;
    }
};
