import { useEffect } from 'react';
import { libraryApi } from '../api/libraryApi.api';

/**
 * Hook que hace un ping al backend cuando la app carga
 * para "despertar" el servidor de Render si está dormido
 */
export const useWakeUpBackend = () => {
    useEffect(() => {
        const wakeUp = async () => {
            try {
                // Intentar un endpoint simple de health check o cualquier GET
                await libraryApi.get('/health', { timeout: 15000 });
            } catch (error) {
                // Ignorar errores, es solo para despertar el servidor
            }
        };

        wakeUp();
    }, []);
};
