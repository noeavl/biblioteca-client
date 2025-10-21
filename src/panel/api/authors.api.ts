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

export interface CreateAuthorDto {
    firstName: string;
    lastName: string;
}

export interface CreateAuthorResponse {
    message: string;
    author: Author;
}

export const createAuthor = async (authorData: CreateAuthorDto): Promise<CreateAuthorResponse> => {
    try {
        const { data } = await panelApi.post<CreateAuthorResponse>('/authors', authorData);
        return data;
    } catch (error) {
        console.error('Error al crear el autor:', error);
        throw error;
    }
};

export const uploadAuthorImage = async (authorId: string, file: File): Promise<void> => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        await panelApi.post(`/files/author/${authorId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    } catch (error) {
        console.error('Error al subir la imagen del autor:', error);
        throw error;
    }
};

export interface DeleteAuthorResponse {
    message: string;
}

export const deleteAuthor = async (authorId: string): Promise<DeleteAuthorResponse> => {
    try {
        const { data } = await panelApi.delete<DeleteAuthorResponse>(`/authors/${authorId}`);
        return data;
    } catch (error) {
        console.error('Error al eliminar el autor:', error);
        throw error;
    }
};

export const getAuthorById = async (authorId: string): Promise<Author> => {
    try {
        const { data } = await panelApi.get<Author>(`/authors/${authorId}`);
        return data;
    } catch (error) {
        console.error('Error al obtener el autor:', error);
        throw error;
    }
};

export interface UpdateAuthorDto {
    firstName?: string;
    lastName?: string;
}

export interface UpdateAuthorResponse {
    message: string;
}

export const updateAuthor = async (authorId: string, authorData: UpdateAuthorDto): Promise<UpdateAuthorResponse> => {
    try {
        const { data } = await panelApi.patch<UpdateAuthorResponse>(`/authors/${authorId}`, authorData);
        return data;
    } catch (error) {
        console.error('Error al actualizar el autor:', error);
        throw error;
    }
};
