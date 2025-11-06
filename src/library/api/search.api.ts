import type { SearchParams, SearchResponse } from '../interfaces/search.interface';
import { libraryApi } from './libraryApi.api';

/**
 * Busca libros, autores y categorías en la biblioteca
 * @param params - Parámetros de búsqueda (term, limit)
 * @returns Promise con los resultados de búsqueda
 */
export const searchLibrary = async (params: SearchParams): Promise<SearchResponse> => {
  const { term, limit = 10 } = params;

  const { data } = await libraryApi.get<SearchResponse>('/search', {
    params: {
      term,
      limit,
    },
  });

  return data;
};
