/**
 * Servicio de caché para páginas de PDF usando IndexedDB
 * Inspirado en el sistema de caché de Google Books y Kindle
 */

interface CachedPage {
  bookId: string;
  pageNumber: number;
  imageData: Blob;
  timestamp: number;
  width: number;
  height: number;
}

class PdfCacheService {
  private dbName = 'pdf-reader-cache';
  private storeName = 'pages';
  private version = 1;
  private db: IDBDatabase | null = null;

  // Límite de caché: 50 páginas (~100MB con páginas de 2MB)
  private maxCacheSize = 50;

  // TTL: 7 días
  private cacheTTL = 7 * 24 * 60 * 60 * 1000;

  /**
   * Inicializar la base de datos IndexedDB
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Crear object store si no existe
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: ['bookId', 'pageNumber']
          });

          // Índices para queries eficientes
          store.createIndex('bookId', 'bookId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Genera una clave única para la página
   */
  private getKey(bookId: string, pageNumber: number): [string, number] {
    return [bookId, pageNumber];
  }

  /**
   * Guarda una página en el caché
   */
  async savePage(
    bookId: string,
    pageNumber: number,
    imageBlob: Blob,
    width: number,
    height: number
  ): Promise<void> {
    if (!this.db) await this.init();

    const cachedPage: CachedPage = {
      bookId,
      pageNumber,
      imageData: imageBlob,
      timestamp: Date.now(),
      width,
      height,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(cachedPage);

      request.onsuccess = () => {
        this.cleanupOldPages(); // Limpiar caché en segundo plano
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obtiene una página del caché
   */
  async getPage(bookId: string, pageNumber: number): Promise<CachedPage | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(this.getKey(bookId, pageNumber));

      request.onsuccess = () => {
        const result = request.result as CachedPage | undefined;

        // Verificar si la página existe y no ha expirado
        if (result && (Date.now() - result.timestamp) < this.cacheTTL) {
          resolve(result);
        } else {
          // Eliminar si expiró
          if (result) {
            this.deletePage(bookId, pageNumber);
          }
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Verifica si una página está en caché
   */
  async hasPage(bookId: string, pageNumber: number): Promise<boolean> {
    const page = await this.getPage(bookId, pageNumber);
    return page !== null;
  }

  /**
   * Elimina una página específica del caché
   */
  async deletePage(bookId: string, pageNumber: number): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(this.getKey(bookId, pageNumber));

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Elimina todas las páginas de un libro
   */
  async deleteBook(bookId: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('bookId');
      const request = index.openCursor(IDBKeyRange.only(bookId));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Limpia páginas antiguas cuando el caché está lleno
   */
  private async cleanupOldPages(): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const countRequest = store.count();

      countRequest.onsuccess = () => {
        const count = countRequest.result;

        if (count > this.maxCacheSize) {
          // Eliminar las páginas más antiguas
          const index = store.index('timestamp');
          const request = index.openCursor();
          let deleted = 0;
          const toDelete = count - this.maxCacheSize;

          request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor && deleted < toDelete) {
              cursor.delete();
              deleted++;
              cursor.continue();
            }
          };
        }
      };
    } catch (error) {
      console.warn('Error cleaning up cache:', error);
    }
  }

  /**
   * Obtiene el tamaño total del caché (número de páginas)
   */
  async getCacheSize(): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Limpia todo el caché
   */
  async clearAll(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Convierte un Canvas a Blob comprimido
   */
  async canvasToBlob(canvas: HTMLCanvasElement, quality = 0.85): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        },
        'image/webp', // WebP para mejor compresión
        quality
      );
    });
  }

  /**
   * Convierte un Blob a URL de datos para renderizado
   */
  blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

// Exportar instancia singleton
export const pdfCache = new PdfCacheService();
