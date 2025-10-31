import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../interfaces/auth.interface';
import { AuthContext } from './authContextInstance';
import { getMe } from '../api/auth.api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Cargar token y validar con el backend al iniciar la aplicación
    useEffect(() => {
        const validateToken = async () => {
            const savedToken = localStorage.getItem('token');

            if (savedToken) {
                setToken(savedToken);

                try {
                    // Validar token y obtener datos actualizados del usuario
                    const userData = await getMe();
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                } catch (error) {
                    console.error('Token inválido o expirado:', error);
                    // Si el token no es válido, limpiar el localStorage
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setToken(null);
                    setUser(null);
                    // Redirigir al login
                    window.location.href = '/login';
                }
            }

            setIsLoading(false);
        };

        validateToken();
    }, []);

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    // Mostrar un loader mientras se valida el token
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
