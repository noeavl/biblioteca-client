
import { panelApi } from '@/panel/api/panelApi.api';
import type { User } from '@/auth/interfaces/auth.interface';

export interface UpdateProfileDto {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    status?: boolean;
}

export const updateProfile = async (
    userData: UpdateProfileDto
): Promise<User> => {
    try {
        const { data } = await panelApi.patch<User>('/auth/profile', userData);
        return data;
    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        throw error;
    }
};
