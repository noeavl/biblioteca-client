import { libraryApi } from './libraryApi.api';
import type { Author } from '../interfaces/author.interface';

export interface GetAuthorsParams {
    limit?: number;
    skip?: number;
}

export interface GetAuthorsResponse {
    authors: Author[];
    total: number;
    page: number;
    totalPages: number;
}

export const getAuthors = async (params?: GetAuthorsParams): Promise<GetAuthorsResponse> => {
    try {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.skip) queryParams.append('skip', params.skip.toString());

        const url = `/authors${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const { data } = await libraryApi.get<GetAuthorsResponse>(url);
        return data;
    } catch (error) {
        console.error('Error al obtener los autores:', error);
        throw error;
    }
};
