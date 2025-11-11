import { useState, useEffect, useCallback, useRef } from 'react';
import { pdfCache } from '../services/pdf-cache.service';
import type { PDFDocumentProxy } from 'pdfjs-dist';

interface PageData {
  pageNumber: number;
  imageUrl: string | null;
  loading: boolean;
  error: string | null;
}

interface UsePdfPagesOptions {
  pdfDocument: PDFDocumentProxy | null;
  bookId: string;
  currentPage: number;
  preloadRange?: number; // Cuántas páginas precargar antes/después
  scale?: number;
}

/**
 * Hook para gestión inteligente de páginas del PDF
 * Implementa:
 * - Caché con IndexedDB
 * - Pre-carga inteligente
 * - Lazy loading
 * - Limpieza de memoria
 */
export const usePdfPages = ({
  pdfDocument,
  bookId,
  currentPage,
  preloadRange = 2,
  scale = 1.5,
}: UsePdfPagesOptions) => {
  const [pages, setPages] = useState<Map<number, PageData>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);

  // Referencias para evitar memory leaks
  const mountedRef = useRef(true);
  const loadingQueue = useRef<Set<number>>(new Set());
  const canvasCache = useRef<Map<number, HTMLCanvasElement>>(new Map());

  // Inicializar caché
  useEffect(() => {
    pdfCache.init().then(() => {
      if (mountedRef.current) {
        setIsInitialized(true);
      }
    });

    return () => {
      mountedRef.current = false;
      // Limpiar canvas cache al desmontar
      canvasCache.current.clear();
    };
  }, []);

  /**
   * Renderiza una página del PDF a canvas
   */
  const renderPageToCanvas = useCallback(
    async (pageNumber: number): Promise<string | null> => {
      if (!pdfDocument) return null;

      try {
        const page = await pdfDocument.getPage(pageNumber);
        const viewport = page.getViewport({ scale });

        // Crear canvas temporal
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', {
          alpha: false, // Mejor performance sin canal alpha
          willReadFrequently: false,
        });

        if (!context) {
          throw new Error('No se pudo obtener contexto 2D');
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Renderizar página
        await page.render({
          canvasContext: context,
          viewport,
          canvas,
        }).promise;

        // Guardar en caché
        const blob = await pdfCache.canvasToBlob(canvas, 0.85);
        await pdfCache.savePage(
          bookId,
          pageNumber,
          blob,
          viewport.width,
          viewport.height
        );

        // Convertir a data URL para mostrar
        const dataUrl = await pdfCache.blobToDataURL(blob);

        // Limpiar página para liberar memoria
        page.cleanup();

        return dataUrl;
      } catch (error) {
        console.error(`Error rendering page ${pageNumber}:`, error);
        return null;
      }
    },
    [pdfDocument, bookId, scale]
  );

  /**
   * Carga una página (desde caché o renderizando)
   */
  const loadPage = useCallback(
    async (pageNumber: number): Promise<void> => {
      // Evitar cargas duplicadas
      if (loadingQueue.current.has(pageNumber)) return;
      if (!isInitialized || !pdfDocument) return;

      loadingQueue.current.add(pageNumber);

      // Actualizar estado: página cargando
      setPages((prev) => {
        const newPages = new Map(prev);
        newPages.set(pageNumber, {
          pageNumber,
          imageUrl: null,
          loading: true,
          error: null,
        });
        return newPages;
      });

      try {
        // Intentar obtener desde caché primero
        const cachedPage = await pdfCache.getPage(bookId, pageNumber);

        let imageUrl: string;

        if (cachedPage) {
          // Usar página cacheada
          imageUrl = await pdfCache.blobToDataURL(cachedPage.imageData);
        } else {
          // Renderizar nueva página
          const rendered = await renderPageToCanvas(pageNumber);
          if (!rendered) {
            throw new Error('Failed to render page');
          }
          imageUrl = rendered;
        }

        // Actualizar estado solo si el componente sigue montado
        if (mountedRef.current) {
          setPages((prev) => {
            const newPages = new Map(prev);
            newPages.set(pageNumber, {
              pageNumber,
              imageUrl,
              loading: false,
              error: null,
            });
            return newPages;
          });
        }
      } catch (error) {
        console.error(`Error loading page ${pageNumber}:`, error);

        if (mountedRef.current) {
          setPages((prev) => {
            const newPages = new Map(prev);
            newPages.set(pageNumber, {
              pageNumber,
              imageUrl: null,
              loading: false,
              error: 'Error al cargar la página',
            });
            return newPages;
          });
        }
      } finally {
        loadingQueue.current.delete(pageNumber);
      }
    },
    [bookId, pdfDocument, isInitialized, renderPageToCanvas]
  );

  /**
   * Pre-carga inteligente de páginas cercanas
   */
  const preloadPages = useCallback(() => {
    if (!pdfDocument) return;

    const numPages = pdfDocument.numPages;
    const pagesToLoad: number[] = [];

    // Página actual (prioridad máxima)
    pagesToLoad.push(currentPage);

    // Páginas siguientes (usuario suele ir hacia adelante)
    for (let i = 1; i <= preloadRange; i++) {
      if (currentPage + i <= numPages) {
        pagesToLoad.push(currentPage + i);
      }
    }

    // Páginas anteriores (menor prioridad)
    for (let i = 1; i <= preloadRange; i++) {
      if (currentPage - i >= 1) {
        pagesToLoad.push(currentPage - i);
      }
    }

    // Cargar en orden de prioridad
    pagesToLoad.forEach((pageNum) => {
      // Solo cargar si no está ya cargada o cargando
      if (!pages.has(pageNum) && !loadingQueue.current.has(pageNum)) {
        loadPage(pageNum);
      }
    });
  }, [currentPage, pdfDocument, preloadRange, pages, loadPage]);

  /**
   * Limpia páginas lejanas de la memoria
   */
  const cleanupDistantPages = useCallback(() => {
    const cleanupThreshold = preloadRange + 5; // Mantener algunas páginas extra

    setPages((prev) => {
      const newPages = new Map(prev);

      Array.from(newPages.keys()).forEach((pageNum) => {
        if (Math.abs(pageNum - currentPage) > cleanupThreshold) {
          // Revocar URL para liberar memoria
          const pageData = newPages.get(pageNum);
          if (pageData?.imageUrl) {
            // Solo limpiar del estado, el caché en IndexedDB se mantiene
            newPages.delete(pageNum);
          }
        }
      });

      return newPages;
    });
  }, [currentPage, preloadRange]);

  // Efecto: Pre-cargar páginas cuando cambia la página actual
  useEffect(() => {
    if (isInitialized && pdfDocument) {
      preloadPages();

      // Limpiar páginas lejanas después de un delay
      const cleanupTimer = setTimeout(cleanupDistantPages, 2000);

      return () => clearTimeout(cleanupTimer);
    }
  }, [currentPage, isInitialized, pdfDocument, preloadPages, cleanupDistantPages]);

  /**
   * Obtiene los datos de una página específica
   */
  const getPage = useCallback(
    (pageNumber: number): PageData => {
      return pages.get(pageNumber) || {
        pageNumber,
        imageUrl: null,
        loading: false,
        error: null,
      };
    },
    [pages]
  );

  /**
   * Fuerza la recarga de una página
   */
  const reloadPage = useCallback(
    async (pageNumber: number) => {
      // Eliminar del caché
      await pdfCache.deletePage(bookId, pageNumber);

      // Eliminar del estado
      setPages((prev) => {
        const newPages = new Map(prev);
        newPages.delete(pageNumber);
        return newPages;
      });

      // Recargar
      await loadPage(pageNumber);
    },
    [bookId, loadPage]
  );

  return {
    getPage,
    loadPage,
    reloadPage,
    isInitialized,
  };
};
