import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { addFavorite, removeFavorite } from '@/library/api/favorites.api';
import { addReadingHistory, removeReadingHistory } from '@/library/api/reading-history.api';
import { getReaderIdFromToken } from '@/auth/utils/jwt.utils';

interface UseBookActionsReturn {
    favoriteBookIds: Set<string>;
    readBookIds: Set<string>;
    toggleFavorite: (bookId: string) => Promise<void>;
    toggleRead: (bookId: string) => Promise<void>;
    setFavoriteBookIds: React.Dispatch<React.SetStateAction<Set<string>>>;
    setReadBookIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}

/**
 * Hook personalizado para manejar acciones de libros (favoritos y leídos)
 * Implementa optimistic updates y debouncing para mejor UX
 */
export const useBookActions = (): UseBookActionsReturn => {
    const [favoriteBookIds, setFavoriteBookIds] = useState<Set<string>>(new Set());
    const [readBookIds, setReadBookIds] = useState<Set<string>>(new Set());

    // Refs para tracking de requests en progreso (evitar duplicados)
    const favoriteRequestsInProgress = useRef<Set<string>>(new Set());
    const readRequestsInProgress = useRef<Set<string>>(new Set());

    /**
     * Toggle favorito con optimistic update
     * Actualiza la UI inmediatamente y revierte si falla
     */
    const toggleFavorite = useCallback(async (bookId: string): Promise<void> => {
        // Evitar requests duplicados
        if (favoriteRequestsInProgress.current.has(bookId)) {
            return;
        }

        const readerId = getReaderIdFromToken();
        if (!readerId) {
            toast.error('No se pudo obtener el ID del lector');
            return;
        }

        // Marcar request en progreso
        favoriteRequestsInProgress.current.add(bookId);

        const wasFavorite = favoriteBookIds.has(bookId);

        // Optimistic update - actualizar UI inmediatamente
        setFavoriteBookIds((prev) => {
            const newSet = new Set(prev);
            if (wasFavorite) {
                newSet.delete(bookId);
            } else {
                newSet.add(bookId);
            }
            return newSet;
        });

        try {
            // Ejecutar la acción en el servidor
            if (wasFavorite) {
                await removeFavorite({ book: bookId, reader: readerId });
                toast.success('Libro removido de favoritos');
            } else {
                await addFavorite({ book: bookId, reader: readerId });
                toast.success('Libro agregado a favoritos');
            }
        } catch (error: unknown) {
            console.error('Error al gestionar favoritos:', error);

            // Revertir optimistic update si falla
            setFavoriteBookIds((prev) => {
                const newSet = new Set(prev);
                if (wasFavorite) {
                    newSet.add(bookId);
                } else {
                    newSet.delete(bookId);
                }
                return newSet;
            });

            // Mostrar error específico
            if (error && typeof error === 'object' && 'response' in error) {
                const apiError = error as { response?: { data?: { message?: string } } };
                if (apiError.response?.data?.message) {
                    toast.error(apiError.response.data.message);
                } else {
                    toast.error('Error al gestionar favoritos');
                }
            } else {
                toast.error('Error al gestionar favoritos');
            }
        } finally {
            // Remover request de la lista en progreso
            favoriteRequestsInProgress.current.delete(bookId);
        }
    }, [favoriteBookIds]);

    /**
     * Toggle leído con optimistic update
     * Actualiza la UI inmediatamente y revierte si falla
     */
    const toggleRead = useCallback(async (bookId: string): Promise<void> => {
        // Evitar requests duplicados
        if (readRequestsInProgress.current.has(bookId)) {
            return;
        }

        const readerId = getReaderIdFromToken();
        if (!readerId) {
            toast.error('No se pudo obtener el ID del lector');
            return;
        }

        // Marcar request en progreso
        readRequestsInProgress.current.add(bookId);

        const wasRead = readBookIds.has(bookId);

        // Optimistic update - actualizar UI inmediatamente
        setReadBookIds((prev) => {
            const newSet = new Set(prev);
            if (wasRead) {
                newSet.delete(bookId);
            } else {
                newSet.add(bookId);
            }
            return newSet;
        });

        try {
            // Ejecutar la acción en el servidor
            if (wasRead) {
                await removeReadingHistory({ bookId, readerId });
                toast.success('Libro marcado como no leído');
            } else {
                await addReadingHistory({ book: bookId, reader: readerId });
                toast.success('Libro marcado como leído');
            }
        } catch (error: unknown) {
            console.error('Error al gestionar estado de leído:', error);

            // Revertir optimistic update si falla
            setReadBookIds((prev) => {
                const newSet = new Set(prev);
                if (wasRead) {
                    newSet.add(bookId);
                } else {
                    newSet.delete(bookId);
                }
                return newSet;
            });

            // Mostrar error específico
            if (error && typeof error === 'object' && 'response' in error) {
                const apiError = error as { response?: { data?: { message?: string } } };
                if (apiError.response?.data?.message) {
                    toast.error(apiError.response.data.message);
                } else {
                    toast.error('Error al gestionar estado de leído');
                }
            } else {
                toast.error('Error al gestionar estado de leído');
            }
        } finally {
            // Remover request de la lista en progreso
            readRequestsInProgress.current.delete(bookId);
        }
    }, [readBookIds]);

    return {
        favoriteBookIds,
        readBookIds,
        toggleFavorite,
        toggleRead,
        setFavoriteBookIds,
        setReadBookIds,
    };
};
