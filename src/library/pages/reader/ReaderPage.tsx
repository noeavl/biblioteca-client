import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { getBookById } from '@/library/api/books.api';
import type { Book } from '@/library/interfaces/book.interface';
import { useParams, useNavigate } from 'react-router';
import { useState, useRef, useEffect, useCallback } from 'react';
import { pdfjs, Document } from 'react-pdf';
import { Spinner } from '@/components/ui/spinner';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { BookOpen, ArrowLeft, FileX } from 'lucide-react';
import { OptimizedPdfPage } from '@/library/components/OptimizedPdfPage';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

// Configuración de PDF options fuera del componente (best practice)
const pdfOptions = {
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    // Habilitar soporte para JPEG 2000 (imágenes JPX en PDFs escaneados)
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
    // Deshabilitar verificación estricta para PDFs escaneados problemáticos
    disableFontFace: false,
    disableAutoFetch: false,
};

// Tipos para búsqueda
interface SearchResult {
    pageNumber: number;
    textContent: string;
    matchIndex: number;
}

export const ReaderPage = () => {
    const { bookId } = useParams<{ bookId: string }>();
    const navigate = useNavigate();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [sliderValue, setSliderValue] = useState<number>(1);
    const [numPages, setNumPages] = useState<number>(100);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [currentSearchIndex, setCurrentSearchIndex] = useState<number>(-1);
    const [isSearching, setIsSearching] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchAbortControllerRef = useRef<AbortController | null>(null);
    const pdfDocumentRef = useRef<PDFDocumentProxy | null>(null);
    const pageContainerRef = useRef<HTMLDivElement>(null);

    // Estados para configuración de lectura
    const [isFullscreen, setIsFullscreen] = useState(false);
    const readerContainerRef = useRef<HTMLDivElement>(null);
    const isMountedRef = useRef<boolean>(true);

    // Tamaño estándar A4 en píxeles (210mm x 297mm a 72 DPI)
    const A4_WIDTH = 595; // puntos
    const A4_HEIGHT = 842; // puntos

    // Calcular escala dinámica basada en viewport
    const [pageWidth, setPageWidth] = useState(A4_WIDTH);
    const [pageHeight, setPageHeight] = useState(A4_HEIGHT);

    // Optimización: Render solo páginas visibles + buffer (2 antes y 2 después)
    const [visiblePages, setVisiblePages] = useState<Set<number>>(
        new Set([1, 2, 3])
    );

    // Suprimir warnings de AbortException en el text layer (es normal cuando se cambia de página rápido)
    useEffect(() => {
        const originalWarn = console.warn;
        const originalError = console.error;

        console.warn = (...args) => {
            const message = args[0]?.toString?.() || '';
            // Suprimir warnings de TextLayer task cancelled
            if (
                message.includes('AbortException') ||
                message.includes('TextLayer task cancelled')
            ) {
                return;
            }
            originalWarn(...args);
        };

        console.error = (...args) => {
            const message = args[0]?.toString?.() || '';
            // Suprimir errors de TextLayer task cancelled
            if (
                message.includes('AbortException') ||
                message.includes('TextLayer task cancelled')
            ) {
                return;
            }
            originalError(...args);
        };

        return () => {
            console.warn = originalWarn;
            console.error = originalError;
        };
    }, []);

    // Calcular tamaño óptimo de páginas según viewport
    useEffect(() => {
        const calculatePageSize = () => {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Espacio disponible (restando header ~80px, footer ~120px, padding)
            const availableHeight = viewportHeight - 250;

            // Para 2 páginas lado a lado, dividir ancho disponible entre 2 + gaps
            const availableWidthPerPage = (viewportWidth - 200) / 2;

            // Mantener proporción A4 (1:1.414)
            const A4_RATIO = A4_HEIGHT / A4_WIDTH;

            // Calcular tamaño óptimo manteniendo proporción
            let width = availableWidthPerPage;
            let height = width * A4_RATIO;

            // Si la altura excede el espacio disponible, ajustar por altura
            if (height > availableHeight) {
                height = availableHeight;
                width = height / A4_RATIO;
            }

            // Aplicar límites mínimos y máximos para legibilidad
            width = Math.max(300, Math.min(width, 600));
            height = width * A4_RATIO;

            setPageWidth(width);
            setPageHeight(height);
        };

        calculatePageSize();
        window.addEventListener('resize', calculatePageSize);
        return () => window.removeEventListener('resize', calculatePageSize);
    }, [A4_WIDTH, A4_HEIGHT, isFullscreen]);

    useEffect(() => {
        const fetchBook = async () => {
            if (!bookId) {
                setError('ID del libro no válido');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const bookData = await getBookById(bookId);
                setBook(bookData);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (err) {
                setError('Error al cargar el libro');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBook();
    }, [bookId]);

    // Cleanup: Marcar componente como desmontado y cancelar operaciones pendientes
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            // Cancelar búsquedas pendientes
            if (searchAbortControllerRef.current) {
                searchAbortControllerRef.current.abort();
            }
            // Limpiar referencia sin destruir (Document lo maneja internamente)
            pdfDocumentRef.current = null;
        };
    }, []);

    // Función para cuando el documento PDF se carga exitosamente
    const onDocumentLoadSuccess = useCallback(
        ({ numPages }: { numPages: number }) => {
            setNumPages(numPages);

            // Inicializar páginas visibles
            const initialVisiblePages = new Set<number>();
            for (let i = 1; i <= Math.min(3, numPages); i++) {
                initialVisiblePages.add(i);
            }
            setVisiblePages(initialVisiblePages);
        },
        []
    );

    // Actualizar páginas visibles cuando cambia la página actual
    // Pre-carga agresiva: 3 páginas antes y 5 después para navegación fluida
    useEffect(() => {
        const newVisiblePages = new Set<number>();

        // Página actual y siguiente (siempre visibles)
        newVisiblePages.add(currentPage);
        if (currentPage + 1 <= numPages) newVisiblePages.add(currentPage + 1);

        // 3 páginas antes
        for (let i = 1; i <= 3; i++) {
            const pageNum = currentPage - i;
            if (pageNum >= 1) newVisiblePages.add(pageNum);
        }

        // 5 páginas después (usuario suele avanzar más que retroceder)
        for (let i = 2; i <= 5; i++) {
            const pageNum = currentPage + i;
            if (pageNum <= numPages) newVisiblePages.add(pageNum);
        }

        setVisiblePages(newVisiblePages);
    }, [currentPage, numPages]);

    // Funciones de navegación simplificadas (avanza de 2 en 2)
    const nextPage = useCallback(() => {
        if (currentPage + 2 <= numPages) {
            setCurrentPage((prev) => prev + 2);
            setSliderValue((prev) => prev + 2);
        } else if (currentPage + 1 <= numPages) {
            // Si solo queda una página, avanzar solo 1
            setCurrentPage((prev) => prev + 1);
            setSliderValue((prev) => prev + 1);
        }
    }, [currentPage, numPages]);

    const prevPage = useCallback(() => {
        if (currentPage > 2) {
            setCurrentPage((prev) => prev - 2);
            setSliderValue((prev) => prev - 2);
        } else if (currentPage > 1) {
            // Si estamos en página 2, retroceder a la 1
            setCurrentPage(1);
            setSliderValue(1);
        }
    }, [currentPage]);

    // Auto-focus cuando se abre el popover de búsqueda
    useEffect(() => {
        if (searchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [searchOpen]);

    // Actualizar escala según tamaño de letra y mantener la página
    // Manejar cambios de pantalla completa
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener(
                'fullscreenchange',
                handleFullscreenChange
            );
        };
    }, []);

    // Navegación con flechas del teclado
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Evitar que las flechas funcionen si hay un input enfocado
            const activeElement = document.activeElement;
            if (
                activeElement?.tagName === 'INPUT' ||
                activeElement?.tagName === 'TEXTAREA'
            ) {
                return;
            }

            switch (event.key) {
                case 'ArrowLeft':
                    event.preventDefault();
                    prevPage();
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    nextPage();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [nextPage, prevPage]);

    // Función para cambiar de página programáticamente (búsqueda, slider)
    const goToPage = useCallback(
        (page: number) => {
            if (page >= 1 && page <= numPages) {
                setCurrentPage(page);
                setSliderValue(page);
            }
        },
        [numPages]
    );

    // Función para buscar en el PDF (optimizada con procesamiento asíncrono no bloqueante)
    const searchInPDF = async (query: string) => {
        // Cancelar búsqueda anterior si existe
        if (searchAbortControllerRef.current) {
            searchAbortControllerRef.current.abort();
        }

        if (!pdfDocumentRef.current || !query.trim()) {
            setSearchResults([]);
            setCurrentSearchIndex(-1);
            return;
        }

        // Crear nuevo controlador de cancelación
        const abortController = new AbortController();
        searchAbortControllerRef.current = abortController;

        setIsSearching(true);
        const results: SearchResult[] = [];
        const normalizedQuery = query.toLowerCase().trim();
        const MAX_RESULTS = 30; // Reducir aún más para mejor rendimiento
        const CHUNK_SIZE = 3; // Procesar 3 páginas a la vez

        try {
            const startPage = currentPage;
            const endPage = Math.min(startPage + 30, numPages); // Buscar solo en las próximas 30 páginas

            // Función auxiliar para procesar una página sin bloquear el UI
            const processPage = async (
                pageNum: number
            ): Promise<SearchResult | null> => {
                return new Promise((resolve) => {
                    // Usar setTimeout para permitir que el navegador respire entre páginas
                    setTimeout(async () => {
                        try {
                            // Verificar si el componente sigue montado y el documento existe
                            if (
                                abortController.signal.aborted ||
                                !isMountedRef.current ||
                                !pdfDocumentRef.current
                            ) {
                                resolve(null);
                                return;
                            }

                            const page = await pdfDocumentRef.current.getPage(
                                pageNum
                            );

                            // Verificar de nuevo después de la operación async
                            if (!isMountedRef.current) {
                                resolve(null);
                                return;
                            }

                            const textContent = await page.getTextContent();

                            // Optimización: Buscar directamente en los items sin crear string largo
                            let fullText = '';
                            for (const item of textContent.items) {
                                if ('str' in item) {
                                    fullText += item.str + ' ';
                                }
                            }

                            const lowerText = fullText.toLowerCase();
                            const matchIndex =
                                lowerText.indexOf(normalizedQuery);

                            if (matchIndex !== -1) {
                                resolve({
                                    pageNumber: pageNum,
                                    textContent: '',
                                    matchIndex: matchIndex,
                                });
                            } else {
                                resolve(null);
                            }
                        } catch (error) {
                            // Silenciar errores si el componente está desmontado
                            if (!isMountedRef.current) {
                                resolve(null);
                                return;
                            }
                            console.error(
                                `Error procesando página ${pageNum}:`,
                                error
                            );
                            resolve(null);
                        }
                    }, 0);
                });
            };

            // Procesar páginas en chunks para no bloquear el UI
            for (
                let i = startPage;
                i <= endPage && results.length < MAX_RESULTS;
                i += CHUNK_SIZE
            ) {
                if (abortController.signal.aborted) {
                    return;
                }

                // Procesar chunk de páginas en paralelo
                const chunkPromises = [];
                for (let j = 0; j < CHUNK_SIZE && i + j <= endPage; j++) {
                    chunkPromises.push(processPage(i + j));
                }

                const chunkResults = await Promise.all(chunkPromises);

                // Agregar resultados válidos
                for (const result of chunkResults) {
                    if (result !== null) {
                        results.push(result);

                        // Navegar al primer resultado inmediatamente
                        if (results.length === 1) {
                            setSearchResults([result]);
                            setCurrentSearchIndex(0);
                            goToPage(result.pageNumber);
                        }

                        if (results.length >= MAX_RESULTS) {
                            break;
                        }
                    }
                }
            }

            // Verificar si la búsqueda fue cancelada
            if (abortController.signal.aborted) {
                return;
            }

            setSearchResults(results);
            setCurrentSearchIndex(results.length > 0 ? 0 : -1);
        } catch (error: unknown) {
            // Ignorar errores de cancelación
            if (error instanceof Error && error.name === 'AbortError') {
                return;
            }
            console.error('Error al buscar en el PDF:', error);
        } finally {
            if (!abortController.signal.aborted) {
                setIsSearching(false);
            }
        }
    };

    // Navegar al siguiente resultado de búsqueda
    const nextSearchResult = useCallback(() => {
        if (searchResults.length === 0) return;
        const nextIndex = (currentSearchIndex + 1) % searchResults.length;
        setCurrentSearchIndex(nextIndex);
        const result = searchResults[nextIndex];
        if (result) {
            goToPage(result.pageNumber);
        }
    }, [searchResults, currentSearchIndex, goToPage]);

    // Navegar al resultado anterior de búsqueda
    const prevSearchResult = useCallback(() => {
        if (searchResults.length === 0) return;
        const prevIndex =
            currentSearchIndex - 1 < 0
                ? searchResults.length - 1
                : currentSearchIndex - 1;
        setCurrentSearchIndex(prevIndex);
        const result = searchResults[prevIndex];
        if (result) {
            goToPage(result.pageNumber);
        }
    }, [searchResults, currentSearchIndex, goToPage]);

    // Manejar el submit de búsqueda
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchInPDF(searchTerm);
    };

    // Alternar pantalla completa
    const toggleFullscreen = async () => {
        if (!readerContainerRef.current) return;

        try {
            if (!document.fullscreenElement) {
                await readerContainerRef.current.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.error('Error al alternar pantalla completa:', error);
        }
    };

    // Validación del libro después de todos los hooks
    if (loading) {
        return <div>Cargando libro...</div>;
    }

    if (error || !book) {
        return <div>{error || 'Libro no encontrado'}</div>;
    }

    const pdfUrl = book.fileName
        ? `${import.meta.env.VITE_API_URL}/files/book/${book.fileName}`
        : null;

    if (!pdfUrl) {
        return (
            <div className="flex flex-col min-h-screen bg-background">
                {/* Header con información del libro */}
                <div className="flex-none p-4 sm:p-6 md:p-8 border-b border-border">
                    <div className="max-w-2xl mx-auto">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(-1)}
                            className="mb-4"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                        <div className="text-center space-y-2">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                                {book.title}
                            </h1>
                            <p className="text-base sm:text-lg text-muted-foreground">
                                {book.author.person.firstName}{' '}
                                {book.author.person.lastName} •{' '}
                                {book.publicationYear}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contenido principal - Estado vacío */}
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="max-w-md w-full text-center space-y-6">
                        {/* Icono */}
                        <div className="flex justify-center">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-muted flex items-center justify-center">
                                <FileX className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground" />
                            </div>
                        </div>

                        {/* Mensaje */}
                        <div className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                                PDF no disponible
                            </h2>
                            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                Este libro no tiene un archivo PDF asociado en
                                este momento. Por favor, contacta al
                                administrador o intenta con otro libro.
                            </p>
                        </div>

                        {/* Acciones */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                            <Button
                                variant="default"
                                size="lg"
                                onClick={() =>
                                    navigate(`/libros/detalle/${book._id}`)
                                }
                                className="gap-2"
                            >
                                <BookOpen className="h-4 w-4" />
                                Ver detalles del libro
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => navigate('/libros')}
                            >
                                Explorar libros
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={readerContainerRef}
            className="flex flex-col min-h-screen bg-background text-foreground"
        >
            <div
                className={`flex flex-none justify-between items-center ${
                    isFullscreen ? 'p-2 sm:p-3' : 'p-3 sm:p-4 md:p-6 lg:p-8'
                } border-b border-foreground/20`}
            >
                <div className="hidden sm:flex gap-3">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button>
                                <span className="material-symbols-outlined">
                                    notes
                                </span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-8 m-3 z-10 rounded-2xl border-blue-400/30 w-full sm:w-auto"></PopoverContent>
                    </Popover>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button>
                                <span className="material-symbols-outlined">
                                    bookmarks
                                </span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-8 m-3 z-10 rounded-2xl border-blue-400/30 w-full sm:w-auto"></PopoverContent>
                    </Popover>
                </div>
                <div className="text-center space-y-1 sm:space-y-2">
                    <h2
                        className={`${
                            isFullscreen
                                ? 'text-base sm:text-lg'
                                : 'text-lg sm:text-xl md:text-2xl lg:text-3xl'
                        } font-bold truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-none text-foreground`}
                    >
                        {book.title}
                    </h2>
                    <span
                        className={`hidden sm:block font-thin ${
                            isFullscreen
                                ? 'text-xs sm:text-sm'
                                : 'text-sm sm:text-base md:text-lg'
                        } text-muted-foreground`}
                    >
                        {book.author.person.firstName}{' '}
                        {book.author.person.lastName} - {book.publicationYear}
                    </span>
                </div>
                <div className="space-x-3">
                    <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                        <PopoverTrigger asChild>
                            <Button>
                                <span className="material-symbols-outlined">
                                    search
                                </span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-4 m-3 z-10 rounded-2xl border-blue-400/30 w-full sm:w-96">
                            <div className="space-y-3">
                                <h3 className="font-bold text-lg">
                                    Buscar en el libro
                                </h3>
                                <form onSubmit={handleSearch}>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            search
                                        </span>
                                        <Input
                                            ref={searchInputRef}
                                            type="text"
                                            placeholder="Escribe para buscar..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            className="pl-10 border-blue-400/30 focus-visible:ring-blue-400"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full mt-2 bg-blue-400 text-white hover:bg-blue-500"
                                        disabled={
                                            isSearching || !searchTerm.trim()
                                        }
                                    >
                                        {isSearching ? 'Buscando...' : 'Buscar'}
                                    </Button>
                                </form>

                                {/* Resultados de búsqueda */}
                                {searchResults.length > 0 && (
                                    <div className="space-y-2 mt-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">
                                                Resultado{' '}
                                                {currentSearchIndex + 1} de{' '}
                                                {searchResults.length}
                                            </span>
                                            <div className="flex gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={prevSearchResult}
                                                    className="h-7 w-7 p-0"
                                                >
                                                    <span className="material-symbols-outlined text-sm">
                                                        chevron_left
                                                    </span>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={nextSearchResult}
                                                    className="h-7 w-7 p-0"
                                                >
                                                    <span className="material-symbols-outlined text-sm">
                                                        chevron_right
                                                    </span>
                                                </Button>
                                            </div>
                                        </div>
                                        <button
                                            className="text-xs text-gray-500 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors cursor-pointer w-full text-left"
                                            onClick={() => {
                                                const result =
                                                    searchResults[
                                                        currentSearchIndex
                                                    ];
                                                if (result) {
                                                    goToPage(result.pageNumber);
                                                }
                                            }}
                                        >
                                            Página{' '}
                                            {
                                                searchResults[
                                                    currentSearchIndex
                                                ]?.pageNumber
                                            }
                                        </button>
                                    </div>
                                )}

                                {searchTerm &&
                                    searchResults.length === 0 &&
                                    !isSearching && (
                                        <div className="text-sm text-gray-500 mt-2">
                                            No se encontraron resultados
                                        </div>
                                    )}
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Button onClick={() => setIsBookmarked(!isBookmarked)}>
                        <span
                            className={`material-symbols-outlined ${
                                isBookmarked ? 'fill' : ''
                            }`}
                        >
                            bookmark
                        </span>
                    </Button>
                    <Button
                        onClick={toggleFullscreen}
                        title={
                            isFullscreen
                                ? 'Salir de pantalla completa'
                                : 'Pantalla completa'
                        }
                    >
                        <span className="material-symbols-outlined">
                            {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                        </span>
                    </Button>
                </div>
            </div>
            <div
                className={`relative flex-1 ${
                    isFullscreen
                        ? 'overflow-y-auto overflow-x-hidden'
                        : 'overflow-hidden'
                } bg-background`}
            >
                <>
                    <style>{`
                        /* Estilos para el canvas del PDF */
                        .react-pdf__Page {
                            position: relative;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }

                        /* Canvas VISIBLE - muestra la imagen del PDF (z-index: 1) */
                        .react-pdf__Page__canvas {
                            display: block !important;
                            max-width: 100%;
                            height: auto;
                            position: relative;
                            z-index: 1;
                        }

                        .react-pdf__Page__svg {
                            width: 100% !important;
                            height: auto !important;
                            display: block;
                        }

                        /* Text layer INVISIBLE pero seleccionable - encima del canvas (z-index: 2) */
                        .react-pdf__Page__textContent {
                            position: absolute !important;
                            left: 0 !important;
                            top: 0 !important;
                            right: 0 !important;
                            bottom: 0 !important;
                            overflow: hidden !important;
                            opacity: 1 !important;
                            line-height: 1 !important;
                            z-index: 2 !important;
                            padding: 0 !important;
                            background: transparent !important;
                        }

                        .react-pdf__Page__textContent span {
                            color: transparent !important;
                            position: absolute !important;
                            white-space: pre !important;
                            cursor: text !important;
                            transform-origin: 0% 0% !important;
                            user-select: text !important;
                            -webkit-user-select: text !important;
                            pointer-events: auto !important;
                        }

                        /* NO agregar espacios - mantenemos posicionamiento absoluto */

                        /* Selección de texto VISIBLE con fondo azul sobre texto transparente */
                        .react-pdf__Page__textContent span::selection {
                            background: rgba(74, 144, 226, 0.5) !important;
                            color: transparent !important;
                        }

                        .react-pdf__Page__textContent span::-moz-selection {
                            background: rgba(74, 144, 226, 0.5) !important;
                            color: transparent !important;
                        }

                        /* Selección del contenedor completo */
                        .react-pdf__Page__textContent::selection {
                            background: rgba(74, 144, 226, 0.5) !important;
                        }

                        .react-pdf__Page__textContent::-moz-selection {
                            background: rgba(74, 144, 226, 0.5) !important;
                        }

                        /* También para el contenedor padre */
                        .react-pdf__Page::selection {
                            background: rgba(74, 144, 226, 0.5) !important;
                        }

                        .react-pdf__Page::-moz-selection {
                            background: rgba(74, 144, 226, 0.5) !important;
                        }

                        /* Annotation layer */
                        .react-pdf__Page__annotations {
                            position: absolute;
                            left: 0;
                            top: 0;
                            right: 0;
                            bottom: 0;
                        }

                        /* Smooth scrolling en fullscreen */
                        ${
                            isFullscreen
                                ? `
                            ::-webkit-scrollbar {
                                width: 10px;
                            }
                            ::-webkit-scrollbar-track {
                                background: transparent;
                            }
                            ::-webkit-scrollbar-thumb {
                                background: rgba(100, 100, 100, 0.3);
                                border-radius: 5px;
                            }
                            ::-webkit-scrollbar-thumb:hover {
                                background: rgba(100, 100, 100, 0.5);
                            }
                        `
                                : ''
                        }
                    `}</style>
                    <Document
                        key={pdfUrl}
                        file={pdfUrl}
                        loading={
                            <div className="flex justify-center items-center h-full">
                                <Spinner />
                            </div>
                        }
                        error={
                            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                                <FileX className="h-16 w-16 text-destructive mb-4" />
                                <h3 className="text-lg font-semibold mb-2">
                                    Error al cargar el PDF
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    No se pudo cargar el documento. Por favor,
                                    intenta nuevamente.
                                </p>
                                <Button
                                    onClick={() => window.location.reload()}
                                >
                                    Recargar página
                                </Button>
                            </div>
                        }
                        options={pdfOptions}
                        onLoadSuccess={(pdf) => {
                            onDocumentLoadSuccess(pdf);
                            pdfDocumentRef.current = pdf;
                        }}
                        onLoadError={(error) => {
                            console.error('Error loading PDF:', error);
                            setError('Error al cargar el documento PDF');
                        }}
                    >
                        <div
                            ref={pageContainerRef}
                            className={`flex justify-center items-start gap-4 mx-auto p-4 md:p-6 lg:p-8 bg-background min-h-full ${
                                isFullscreen ? 'pt-4' : ''
                            }`}
                        >
                            {/* Página izquierda */}
                            <OptimizedPdfPage
                                pageNumber={currentPage}
                                width={pageWidth}
                                height={pageHeight}
                                isVisible={visiblePages.has(currentPage)}
                            />

                            {/* Página derecha */}
                            {currentPage + 1 <= numPages && (
                                <OptimizedPdfPage
                                    pageNumber={currentPage + 1}
                                    width={pageWidth}
                                    height={pageHeight}
                                    isVisible={visiblePages.has(currentPage + 1)}
                                />
                            )}
                        </div>
                    </Document>
                </>

                {/* Botón Anterior - Costado Izquierdo */}
                <Button
                    className="fixed left-1 sm:left-2 md:left-4 lg:left-6 xl:left-8 top-1/2 -translate-y-1/2 rounded-full shadow-lg w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 z-50 disabled:opacity-50"
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    title="Página anterior (Flecha izquierda)"
                >
                    <span className="material-symbols-outlined text-xl sm:text-2xl md:text-3xl">
                        chevron_left
                    </span>
                </Button>

                {/* Botón Siguiente - Costado Derecho */}
                <Button
                    className="fixed right-1 sm:right-2 md:right-4 lg:right-6 xl:right-8 top-1/2 -translate-y-1/2 rounded-full shadow-lg w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 z-50 disabled:opacity-50"
                    onClick={nextPage}
                    disabled={currentPage + 1 > numPages}
                    title="Página siguiente (Flecha derecha)"
                >
                    <span className="material-symbols-outlined text-2xl sm:text-3xl">
                        chevron_right
                    </span>
                </Button>
            </div>
            <div
                className={`flex-none ${
                    isFullscreen ? 'p-2 sm:p-3' : 'p-3 sm:p-4 md:p-6 lg:p-8'
                } bg-background border-t border-foreground/20`}
            >
                <div className="mb-2 sm:mb-3 flex justify-center">
                    <span className="text-sm sm:text-base md:text-lg font-normal text-foreground">
                        Page{' '}
                        <span className="font-bold text-blue-400">
                            {sliderValue}
                        </span>{' '}
                        of{' '}
                        <span className="font-bold text-blue-400">
                            {numPages}
                        </span>
                    </span>
                </div>
                <Slider
                    value={[sliderValue]}
                    min={1}
                    max={numPages}
                    step={1}
                    onValueChange={(value) => {
                        const page = value[0];
                        goToPage(page);
                    }}
                />
            </div>
        </div>
    );
};
