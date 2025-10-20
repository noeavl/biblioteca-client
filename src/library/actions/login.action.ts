import { libraryApi } from '../api/libraryApi.api';
import type { AuthResponse } from '../responses/auth.response';

export const loginAction = async (
    email: string,
    password: string
): Promise<AuthResponse> => {
    try {
        const startTime = performance.now();
        const { data } = await libraryApi.post<AuthResponse>('/auth/login', {
            email,
            password,
        });
        const endTime = performance.now();
        console.log(`Login request took ${(endTime - startTime).toFixed(2)}ms`);

        return data;
    } catch (error: unknown) {
        console.error('Error en loginAction:', error);
        throw error;
    }
};
