import { panelApi } from './panelApi.api';
import type { User, UserRole } from '@/library/interfaces/user.interface';

export const getUsers = async (): Promise<User[]> => {
    try {
        const { data } = await panelApi.get<User[]>('/users');
        return data;
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        throw error;
    }
};

export interface DeleteUserResponse {
    message: string;
}

export const deleteUser = async (userId: string): Promise<DeleteUserResponse> => {
    try {
        const { data } = await panelApi.delete<DeleteUserResponse>(`/users/${userId}`);
        return data;
    } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        throw error;
    }
};

export interface CreateUserDto {
    role: string;
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    status: boolean;
}

export interface CreateUserResponse {
    message: string;
    user: User;
}

export const createUser = async (userData: CreateUserDto): Promise<CreateUserResponse> => {
    try {
        const { confirmPassword, ...payload } = userData;
        const { data } = await panelApi.post<CreateUserResponse>('/users', payload);
        return data;
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        throw error;
    }
};

export const getRoles = async (): Promise<UserRole[]> => {
    try {
        const { data } = await panelApi.get<UserRole[]>('/roles');
        return data;
    } catch (error) {
        console.error('Error al obtener los roles:', error);
        throw error;
    }
};

export interface UpdateUserDto {
    role?: string;
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    status?: boolean;
}

export interface UpdateUserResponse {
    message: string;
}

export const getUserById = async (userId: string): Promise<User> => {
    try {
        const { data } = await panelApi.get<User>(`/users/${userId}`);
        return data;
    } catch (error) {
        console.error('Error al obtener el usuario:', error);
        throw error;
    }
};

export const updateUser = async (userId: string, userData: UpdateUserDto): Promise<UpdateUserResponse> => {
    try {
        const { confirmPassword, ...payload } = userData;
        // Solo enviar campos que no estén vacíos
        const filteredPayload = Object.fromEntries(
            Object.entries(payload).filter(([_, value]) => value !== '' && value !== undefined)
        );
        const { data } = await panelApi.patch<UpdateUserResponse>(`/users/${userId}`, filteredPayload);
        return data;
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        throw error;
    }
};
