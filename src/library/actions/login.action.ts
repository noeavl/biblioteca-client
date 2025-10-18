import { libraryApi } from '../api/libraryApi.api';
import type { AuthResponse } from '../responses/auth.response';

export const loginAction = async (
    email: string,
    password: string
): Promise<AuthResponse> => {
    try {
        const { data } = await libraryApi.post<AuthResponse>('/auth/login', {
            email,
            password,
        });

        localStorage.setItem('token', data.access_token);

        return data;
    } catch (error: unknown) {
        console.error('Error en loginAction:', error);
        throw error;
    }
};
