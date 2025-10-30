import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { getBookById } from '@/library/api/books.api';
import type { Book } from '@/library/interfaces/book.interface';
import { useParams } from 'react-router';
import { useState, useRef, useEffect, useCallback } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import { Spinner } from '@/components/ui/spinner';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import HTMLFlipBook from 'react-pageflip';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

// Tipos para búsqueda
interface SearchResult {
    pageNumber: number;
    textContent: string;
    matchIndex: number;
}

type FontSize = 'small' | 'medium' | 'large';
type FontFamily = 'serif' | 'sans-serif' | 'monospace' | 'georgia' | 'palatino';

export const ReaderPage = () => {
    const { bookId } = useParams<{ bookId: string }>();
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
    const flipBookRef = useRef<typeof HTMLFlipBook.prototype | null>(null);
    const [bookSize, setBookSize] = useState({ width: 550, height: 733 });

    // Estados para configuración de lectura
    const [fontSize, setFontSize] = useState<FontSize>('medium');
    const [fontFamily, setFontFamily] = useState<FontFamily>('serif');
    const [scale, setScale] = useState<number>(1.0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const readerContainerRef = useRef<HTMLDivElement>(null);

    // Tamaños responsivos para diferentes breakpoints
    useEffect(() => {
        const updateBookSize = () => {
            const width = window.innerWidth;
            if (width < 640) {
                // sm
                setBookSize({ width: 300, height: 450 });
            } else if (width < 768) {
                // md
                setBookSize({ width: 400, height: 600 });
            } else if (width < 1024) {
                // lg
                setBookSize({ width: 450, height: 675 });
            } else if (width < 1280) {
                // xl
                setBookSize({ width: 500, height: 750 });
            } else {
                // 2xl
                setBookSize({ width: 550, height: 825 });
            }
        };

        updateBookSize();
        window.addEventListener('resize', updateBookSize);
        return () => window.removeEventListener('resize', updateBookSize);
    }, []);

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

    // Función para cuando el documento PDF se carga exitosamente
    const onDocumentLoadSuccess = useCallback(
        ({ numPages }: { numPages: number }) => {
            setNumPages(numPages);
        },
        []
    );

    // Funciones de navegación con flipbook (optimizadas)
    const nextPage = useCallback(() => {
        if (flipBookRef.current && currentPage < numPages - 1) {
            requestAnimationFrame(() => {
                flipBookRef.current?.pageFlip().flipNext();
            });
        }
    }, [currentPage, numPages]);

    const prevPage = useCallback(() => {
        if (flipBookRef.current && currentPage > 1) {
            requestAnimationFrame(() => {
                flipBookRef.current?.pageFlip().flipPrev();
            });
        }
    }, [currentPage]);

    // Auto-focus cuando se abre el popover de búsqueda
    useEffect(() => {
        if (searchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [searchOpen]);

    // Actualizar escala según tamaño de letra y mantener la página
    useEffect(() => {
        const newScale =
            fontSize === 'small' ? 0.8 : fontSize === 'large' ? 1.3 : 1.0;

        // Si la escala es diferente, actualizar
        if (newScale !== scale) {
            setScale(newScale);

            // Actualizar el flipbook después del cambio
            if (flipBookRef.current && currentPage > 0) {
                // Usar un pequeño delay para asegurar que React termine de renderizar
                setTimeout(() => {
                    if (flipBookRef.current) {
                        try {
                            // Actualizar tamaño del flipbook
                            flipBookRef.current.pageFlip().updateState();
                        } catch (error) {
                            console.warn(
                                'No se pudo actualizar el estado del flipbook:',
                                error
                            );
                        }
                    }
                }, 50);
            }
        }
    }, [fontSize, scale, currentPage]);

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
                            if (abortController.signal.aborted) {
                                resolve(null);
                                return;
                            }

                            const page = await pdfDocumentRef.current!.getPage(
                                pageNum
                            );
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
        if (result && flipBookRef.current) {
            setCurrentPage(result.pageNumber);
            setSliderValue(result.pageNumber);
            flipBookRef.current.pageFlip().turnToPage(result.pageNumber - 1);
        }
    }, [searchResults, currentSearchIndex]);

    // Navegar al resultado anterior de búsqueda
    const prevSearchResult = useCallback(() => {
        if (searchResults.length === 0) return;
        const prevIndex =
            currentSearchIndex - 1 < 0
                ? searchResults.length - 1
                : currentSearchIndex - 1;
        setCurrentSearchIndex(prevIndex);
        const result = searchResults[prevIndex];
        if (result && flipBookRef.current) {
            setCurrentPage(result.pageNumber);
            setSliderValue(result.pageNumber);
            flipBookRef.current.pageFlip().turnToPage(result.pageNumber - 1);
        }
    }, [searchResults, currentSearchIndex]);

    // Manejar el submit de búsqueda
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchInPDF(searchTerm);
    };

    // Obtener clase de fuente
    const getFontFamilyClass = () => {
        const fontMap = {
            serif: 'font-serif',
            'sans-serif': 'font-sans',
            monospace: 'font-mono',
            georgia: 'font-georgia',
            palatino: 'font-palatino',
        };
        return fontMap[fontFamily];
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

    // No scroll/transition helpers — keep behavior simple

    // Función para cuando el flipbook cambia de página (onFlip event)
    const handleFlipPageChange = useCallback((page: number) => {
        setCurrentPage(page);
        setSliderValue(page);
    }, []);

    // Función para cambiar de página programáticamente (búsqueda, clics) - optimizada
    const goToPage = useCallback(
        (page: number) => {
            if (flipBookRef.current && page >= 1 && page <= numPages) {
                // Usar requestAnimationFrame para evitar bloqueos
                requestAnimationFrame(() => {
                    flipBookRef.current?.pageFlip().turnToPage(page - 1);
                });
            }
        },
        [numPages]
    );

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
        return <div>PDF no encontrado para este libro</div>;
    }

    return (
        <div ref={readerContainerRef} className={`flex flex-col min-h-screen `}>
            <div
                className={`flex flex-none justify-between items-center p-3 sm:p-4 md:p-6 lg:p-8 border-b-1  border-foreground/20`}
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
                        className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-none `}
                    >
                        {book.title}
                    </h2>
                    <span
                        className={
                            'hidden sm:block font-thin text-sm sm:text-base md:text-lg'
                        }
                    >
                        {book.author.person.firstName}
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
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button>
                                <span className="material-symbols-outlined">
                                    custom_typography
                                </span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-8 m-3 z-10 rounded-2xl border-blue-400/30 w-full sm:w-80">
                            <div className="space-y-6">
                                {/* Tamaño de letra */}
                                <div>
                                    <h3 className="font-bold mb-3">
                                        Tamaño de letra
                                    </h3>
                                    <div className="flex justify-between gap-2">
                                        <Button
                                            className={`flex-1 transition-all ${
                                                fontSize === 'small'
                                                    ? 'bg-blue-400 text-white hover:bg-blue-500'
                                                    : 'bg-blue-50 text-blue-400 hover:bg-blue-100'
                                            }`}
                                            onClick={() => setFontSize('small')}
                                        >
                                            S
                                        </Button>
                                        <Button
                                            className={`flex-1 transition-all ${
                                                fontSize === 'medium'
                                                    ? 'bg-blue-400 text-white hover:bg-blue-500'
                                                    : 'bg-blue-50 text-blue-400 hover:bg-blue-100'
                                            }`}
                                            onClick={() =>
                                                setFontSize('medium')
                                            }
                                        >
                                            M
                                        </Button>
                                        <Button
                                            className={`flex-1 transition-all ${
                                                fontSize === 'large'
                                                    ? 'bg-blue-400 text-white hover:bg-blue-500'
                                                    : 'bg-blue-50 text-blue-400 hover:bg-blue-100'
                                            }`}
                                            onClick={() => setFontSize('large')}
                                        >
                                            L
                                        </Button>
                                    </div>
                                </div>

                                <Separator />

                                {/* Familia de fuente */}
                                <div>
                                    <h3 className="font-bold mb-3">
                                        Familia de fuente
                                    </h3>
                                    <Select
                                        value={fontFamily}
                                        onValueChange={(value) =>
                                            setFontFamily(value as FontFamily)
                                        }
                                    >
                                        <SelectTrigger className="w-full border-blue-400/30">
                                            <SelectValue placeholder="Selecciona una fuente" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>
                                                    Fuentes
                                                </SelectLabel>
                                                <SelectItem
                                                    value="serif"
                                                    className="font-serif"
                                                >
                                                    Serif (Times)
                                                </SelectItem>
                                                <SelectItem
                                                    value="sans-serif"
                                                    className="font-sans"
                                                >
                                                    Sans Serif (Arial)
                                                </SelectItem>
                                                <SelectItem
                                                    value="monospace"
                                                    className="font-mono"
                                                >
                                                    Monospace (Courier)
                                                </SelectItem>
                                                <SelectItem
                                                    value="georgia"
                                                    style={{
                                                        fontFamily: 'Georgia',
                                                    }}
                                                >
                                                    Georgia
                                                </SelectItem>
                                                <SelectItem
                                                    value="palatino"
                                                    style={{
                                                        fontFamily: 'Palatino',
                                                    }}
                                                >
                                                    Palatino
                                                </SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
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
                className={`relative flex-1 overflow-hidden ${getFontFamilyClass()} `}
            >
                <>
                    <style>{`.react-pdf__Page__canvas{width:100% !important;height:100% !important;display:block}.react-pdf__Page__svg{width:100% !important;height:100% !important;display:block}`}</style>
                    <Document
                        file={pdfUrl}
                        loading={
                            <div className="flex justify-center items-center">
                                <Spinner />
                            </div>
                        }
                        onLoadSuccess={(pdf) => {
                            onDocumentLoadSuccess(pdf);
                            pdfDocumentRef.current = pdf;
                        }}
                    >
                        <div
                            className={`flex justify-center items-center max-w-screen-2xl mx-auto p-2 sm:p-4 md:p-6 lg:p-8 `}
                        >
                            <HTMLFlipBook
                                ref={flipBookRef}
                                width={bookSize.width * scale}
                                height={bookSize.height * scale}
                                size="stretch"
                                minWidth={280}
                                minHeight={0}
                                maxWidth={1200}
                                maxHeight={1600}
                                maxShadowOpacity={0.2}
                                showCover={true}
                                mobileScrollSupport={true}
                                onFlip={(e: { data: number }) => {
                                    handleFlipPageChange(e.data);
                                }}
                                className=""
                                style={{}}
                                startPage={0}
                                drawShadow={false}
                                flippingTime={600}
                                usePortrait={true}
                                startZIndex={0}
                                autoSize={true}
                                clickEventForward={true}
                                useMouseEvents={true}
                                swipeDistance={0}
                                showPageCorners={true}
                                disableFlipByClick={false}
                            >
                                {Array.from(
                                    { length: numPages },
                                    (_, i) => i + 1
                                ).map((pageNum) => (
                                    <div key={pageNum} className="bg-blue-400">
                                        <Page
                                            pageNumber={pageNum}
                                            renderAnnotationLayer={false}
                                            renderTextLayer={true}
                                            renderMode="canvas"
                                            className={'w-full h-full'}
                                            loading={
                                                <div className="flex justify-center items-center w-full h-full">
                                                    <Spinner />
                                                </div>
                                            }
                                        />
                                    </div>
                                ))}
                            </HTMLFlipBook>
                        </div>
                    </Document>
                </>

                {/* Botón Anterior - Costado Izquierdo */}
                <Button
                    className={`fixed left-1 sm:left-2 md:left-4 lg:left-6 xl:left-8 top-1/2 -translate-y-1/2 rounded-full shadow-lg w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 z-50 disabled:opacity-50 `}
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
                    className={`fixed right-1 sm:right-2 md:right-4 lg:right-6 xl:right-8 top-1/2 -translate-y-1/2 rounded-full shadow-lg w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 z-50 disabled:opacity-50`}
                    onClick={nextPage}
                    disabled={currentPage + 2 > numPages}
                    title="Página siguiente (Flecha derecha)"
                >
                    <span className="material-symbols-outlined text-2xl sm:text-3xl">
                        chevron_right
                    </span>
                </Button>
            </div>
            <div className={`flex-none p-3 sm:p-4 md:p-6 lg:p-8 `}>
                <div className="mb-2 sm:mb-3 flex justify-center">
                    <span
                        className={`text-sm sm:text-base md:text-lg font-normal `}
                    >
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
                        setSliderValue(page);
                        setCurrentPage(page);
                        // Navegar el flipbook a la página correspondiente
                        if (flipBookRef.current) {
                            requestAnimationFrame(() => {
                                flipBookRef.current
                                    ?.pageFlip()
                                    .turnToPage(page - 1);
                            });
                        }
                    }}
                />
            </div>
        </div>
    );
};
