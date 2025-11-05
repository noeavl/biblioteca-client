import { panelApi } from './panelApi.api';

export interface CreateReaderDto {
    user: string;
    suscription: boolean;
}

export interface CreateReaderResponse {
    message: string;
}

export const createReader = async (
    readerData: CreateReaderDto
): Promise<CreateReaderResponse> => {
    try {
        const { data } = await panelApi.post<CreateReaderResponse>(
            '/readers',
            readerData
        );
        return data;
    } catch (error) {
        console.error('Error al crear el lector:', error);
        throw error;
    }
};

export interface UpdateReaderDto {
    suscription?: boolean;
}

export interface UpdateReaderResponse {
    message: string;
}

export interface Reader {
    _id: string;
    user: {
        _id: string;
        role: string;
        name: string;
        email: string;
        status: boolean;
        createdAt: string;
        updatedAt: string;
        __v: number;
    };
    suscription: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export const getReaderByUserId = async (userId: string): Promise<Reader> => {
    try {
        const { data } = await panelApi.get<Reader>(
            `/readers/by-user/${userId}`
        );
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
        const { data } = await panelApi.patch<UpdateReaderResponse>(
            `/readers/${readerId}`,
            readerData
        );
        return data;
    } catch (error) {
        console.error('Error al actualizar el lector:', error);
        throw error;
    }
};
