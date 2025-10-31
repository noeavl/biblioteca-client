import { panelApi } from '@/panel/api/panelApi.api';
import type { User } from '../interfaces/auth.interface';

export interface MeResponse {
    _id: string;
    role: {
        _id: string;
        name: string;
        __v: number;
        createdAt: string;
        updatedAt: string;
    };
    name: string;
    email: string;
    status: boolean;
    __v: number;
    createdAt: string;
    updatedAt: string;
}

export const getMe = async (): Promise<User> => {
    try {
        const { data } = await panelApi.get<MeResponse>('/auth/me');

        // Transformar la respuesta al formato User
        return {
            _id: data._id,
            name: data.name,
            email: data.email,
            role: {
                _id: data.role._id,
                name: data.role.name,
            },
            status: data.status,
        };
    } catch (error) {
        console.error('Error al obtener información del usuario:', error);
        throw error;
    }
};
