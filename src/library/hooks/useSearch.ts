import { useState, useCallback, useRef, useEffect } from 'react';
import type { SearchResponse } from '../interfaces/search.interface';
import { searchLibrary } from '../api/search.api';

interface UseSearchOptions {
  limit?: number;
  debounceDelay?: number;
}

interface UseSearchReturn {
  results: SearchResponse | null;
  isLoading: boolean;
  error: Error | null;
  search: (term: string) => Promise<void>;
  clearResults: () => void;
  hasSearched: boolean;
}

/**
 * Hook personalizado para manejar la búsqueda en la biblioteca
 * Incluye debouncing automático y manejo de estados
 */
export const useSearch = (options: UseSearchOptions = {}): UseSearchReturn => {
  const { limit = 10, debounceDelay = 300 } = options;

  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Limpia el timer de debounce y cancela requests pendientes
   */
  const cleanup = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Realiza la búsqueda con debouncing
   */
  const search = useCallback(
    async (term: string): Promise<void> => {
      // Limpia operaciones previas
      cleanup();

      // Si el término está vacío, limpia los resultados
      if (!term.trim()) {
        setResults(null);
        setError(null);
        setHasSearched(false);
        return;
      }

      // Inicia el debounce
      debounceTimerRef.current = setTimeout(async () => {
        setIsLoading(true);
        setError(null);
        setHasSearched(true);

        // Crea un nuevo AbortController para esta búsqueda
        abortControllerRef.current = new AbortController();

        try {
          const response = await searchLibrary({
            term: term.trim(),
            limit,
          });

          setResults(response);
          setError(null);
        } catch (err) {
          // Solo setea el error si no fue abortado
          if (err instanceof Error && err.name !== 'AbortError') {
            setError(err);
            setResults(null);
          }
        } finally {
          setIsLoading(false);
        }
      }, debounceDelay);
    },
    [cleanup, debounceDelay, limit]
  );

  /**
   * Limpia todos los resultados y estados
   */
  const clearResults = useCallback(() => {
    cleanup();
    setResults(null);
    setError(null);
    setIsLoading(false);
    setHasSearched(false);
  }, [cleanup]);

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    results,
    isLoading,
    error,
    search,
    clearResults,
    hasSearched,
  };
};
