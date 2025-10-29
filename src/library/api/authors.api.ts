import { libraryApi } from './libraryApi.api';
import type { Author } from '../interfaces/author.interface';
import type { SortType } from '@/mocks/filters.mock';

export interface GetAuthorsParams {
    limit?: number;
    skip?: number;
    categories?: string[];
    sort?: SortType;
    hasBooks?: boolean;
}

export interface GetAuthorsResponse {
    authors: Author[];
    total: number;
    page: number;
    totalPages: number;
}

export const getAuthors = async (
    params?: GetAuthorsParams
): Promise<GetAuthorsResponse> => {
    try {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.skip) queryParams.append('skip', params.skip.toString());
        if (params?.categories && params.categories.length > 0) {
            queryParams.append('categories', params.categories.join(','));
        }
        if (params?.sort) {
            queryParams.append('sort', params.sort);
        }
        if (params?.hasBooks !== undefined) {
            queryParams.append('hasBooks', params.hasBooks.toString());
        }

        const url = `/authors${
            queryParams.toString() ? `?${queryParams.toString()}` : ''
        }`;
        const { data } = await libraryApi.get<GetAuthorsResponse>(url);
        return data;
    } catch (error) {
        console.error('Error al obtener los autores:', error);
        throw error;
    }
};

export const getAuthorById = async (authorId: string): Promise<Author> => {
    try {
        const { data } = await libraryApi.get<Author>(`/authors/${authorId}`);
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
