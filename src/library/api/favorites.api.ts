import { libraryApi } from './libraryApi.api';
import { getReaderIdFromToken } from '@/auth/utils/jwt.utils';

export interface AddFavoriteParams {
    book: string;
    reader: string;
}

export interface RemoveFavoriteParams {
    book: string;
    reader: string;
}

export interface FavoriteBook {
    _id: string;
    book: {
        _id: string;
        author: {
            _id: string;
            person: {
                _id: string;
                firstName: string;
                lastName: string;
                createdAt: string;
                updatedAt: string;
                __v: number;
            };
            createdAt: string;
            updatedAt: string;
            __v: number;
        };
        title: string;
        synopsis: string;
        publicationYear: number;
        category: {
            _id: string;
            name: string;
            createdAt: string;
            updatedAt: string;
            __v: number;
        };
        status: boolean;
        createdAt: string;
        updatedAt: string;
        __v: number;
        coverImage?: string;
        fileName?: string;
    };
    reader: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface GetFavoritesResponse {
    favorites: FavoriteBook[];
    total: number;
    totalPages: number;
    page: number;
}

export const addFavorite = async (params: AddFavoriteParams): Promise<void> => {
    try {
        await libraryApi.post('/favorites', params);
    } catch (error) {
        console.error('Error al agregar a favoritos:', error);
        throw error;
    }
};

export const removeFavorite = async (params: RemoveFavoriteParams): Promise<void> => {
    try {
        await libraryApi.delete(`/favorites/${params.reader}/${params.book}`);
    } catch (error) {
        console.error('Error al remover de favoritos:', error);
        throw error;
    }
};

export interface GetFavoritesParams {
    limit?: number;
    skip?: number;
}

export const getFavorites = async (params?: GetFavoritesParams): Promise<GetFavoritesResponse> => {
    try {
        const readerId = getReaderIdFromToken();
        if (!readerId) {
            throw new Error('No se pudo obtener el ID del lector del token');
        }

        const { data } = await libraryApi.get<GetFavoritesResponse>(`/favorites/${readerId}`, {
            params: {
                limit: params?.limit,
                skip: params?.skip,
            },
        });
        return data;
    } catch (error) {
        console.error('Error al obtener favoritos:', error);
        throw error;
    }
};

export const checkIsFavorite = async (bookId: string): Promise<boolean> => {
    try {
        const { favorites } = await getFavorites();
        return favorites.some((fav: FavoriteBook) => fav.book._id === bookId);
    } catch (error) {
        console.error('Error al verificar si el libro está en favoritos:', error);
        return false;
    }
};
