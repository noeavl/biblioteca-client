import { panelApi } from './panelApi.api';
import type { Reader } from '@/library/interfaces/reader.interface';

export interface GetReadersParams {
    limit?: number;
    skip?: number;
    search?: string;
}

export interface GetReadersResponse {
    readers: Reader[];
    total: number;
    page: number;
    totalPages: number;
}

export const getReaders = async (
    params?: GetReadersParams
): Promise<GetReadersResponse> => {
    try {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.skip) queryParams.append('skip', params.skip.toString());

        if (params?.search && params.search.trim()) {
            queryParams.append('search', params.search.trim());
        }

        const url = `/readers${
            queryParams.toString() ? `?${queryParams.toString()}` : ''
        }`;
        const { data } = await panelApi.get<GetReadersResponse>(url);
        return data;
    } catch (error) {
        console.error('Error al obtener los lectores:', error);
        throw error;
    }
};

export interface DeleteReaderResponse {
    message: string;
}

export const deleteReader = async (
    readerId: string
): Promise<DeleteReaderResponse> => {
    try {
        const { data } = await panelApi.delete<DeleteReaderResponse>(
            `/readers/${readerId}`
        );
        return data;
    } catch (error) {
        console.error('Error al eliminar el lector:', error);
        throw error;
    }
};

export interface CreateReaderDto {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    status: boolean;
    suscription: boolean;
}

export interface CreateReaderResponse {
    message: string;
    reader: Reader;
}

export const createReader = async (
    readerData: CreateReaderDto
): Promise<CreateReaderResponse> => {
    try {
        const { data } = await panelApi.post<CreateReaderResponse>(
            '/readers/with-user',
            readerData
        );
        return data;
    } catch (error) {
        console.error('Error al crear el lector:', error);
        throw error;
    }
};

export interface UpdateReaderDto {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    status?: boolean;
    suscription?: boolean;
}

export interface UpdateReaderResponse {
    message: string;
}

export const getReaderById = async (readerId: string): Promise<Reader> => {
    try {
        const { data } = await panelApi.get<Reader>(`/readers/${readerId}`);
        return data;
    } catch (error) {
        console.error('Error al obtener el lector:', error);
        throw error;
    }
};

export const updateReader = async (
    readerId: string,
    readerData: UpdateReaderDto
): Promise<UpdateReaderResponse> => {
    try {
        const { confirmPassword, ...payload } = readerData;
        const filteredPayload = Object.fromEntries(
            Object.entries(payload).filter(
                ([_, value]) => value !== '' && value !== undefined
            )
        );
        const { data } = await panelApi.patch<UpdateReaderResponse>(
            `/readers/with-user/${readerId}`,
            filteredPayload
        );
        return data;
    } catch (error) {
        console.error('Error al actualizar el lector:', error);
        throw error;
    }
};
