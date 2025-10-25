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
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { getBookById } from '@/library/api/books.api';
import type { Book } from '@/library/interfaces/book.interface';
import { useParams } from 'react-router';
import { useState, useRef, useEffect, useCallback } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import type { RenderMode } from 'react-pdf';
import { Spinner } from '@/components/ui/spinner';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import HTMLFlipBook from 'react-pageflip';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { useIsMobile } from '@/hooks/use-mobile';

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
    const pdfDocumentRef = useRef<PDFDocumentProxy | null>(null);
    const flipBookRef = useRef<typeof HTMLFlipBook.prototype | null>(null);
    const isMobile = useIsMobile();
    const [bookSize, setBookSize] = useState({ width: 550, height: 733 });

    // Estados para configuración de lectura
    const [fontSize, setFontSize] = useState<FontSize>('medium');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [fontFamily, setFontFamily] = useState<FontFamily>('serif');
    const [scale, setScale] = useState<number>(1.0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const readerContainerRef = useRef<HTMLDivElement>(null);

    // Keep a fixed base book size; remove dynamic sizing/scroll logic for simplicity
    useEffect(() => {
        if (isMobile) setBookSize({ width: 300, height: 450 });
        else setBookSize({ width: 550, height: 733 });
    }, [isMobile]);

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

    // Funciones de navegación con flipbook
    const nextPage = useCallback(() => {
        if (flipBookRef.current) {
            flipBookRef.current.pageFlip().flipNext();
        }
    }, []);

    const prevPage = useCallback(() => {
        if (flipBookRef.current) {
            flipBookRef.current.pageFlip().flipPrev();
        }
    }, []);

    // Auto-focus cuando se abre el popover de búsqueda
    useEffect(() => {
        if (searchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [searchOpen]);

    // Actualizar escala según tamaño de letra
    useEffect(() => {
        switch (fontSize) {
            case 'small':
                setScale(0.8);
                break;
            case 'medium':
                setScale(1.0);
                break;
            case 'large':
                setScale(1.3);
                break;
        }
    }, [fontSize]);

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

    // Función para buscar en el PDF
    const searchInPDF = async (query: string) => {
        if (!pdfDocumentRef.current || !query.trim()) {
            setSearchResults([]);
            setCurrentSearchIndex(-1);
            return;
        }

        setIsSearching(true);
        const results: SearchResult[] = [];
        const normalizedQuery = query.toLowerCase().trim();

        console.log('Iniciando búsqueda de:', normalizedQuery);
        console.log('Número de páginas:', numPages);

        try {
            for (let i = 1; i <= numPages; i++) {
                const page = await pdfDocumentRef.current.getPage(i);
                const textContent = await page.getTextContent();

                // Obtener el texto de la página
                const pageText = textContent.items
                    .map((item) => {
                        if ('str' in item) {
                            return item.str;
                        }
                        return '';
                    })
                    .join(' ')
                    .toLowerCase();

                // Debug: mostrar las primeras páginas
                if (i <= 3) {
                    console.log(
                        `Página ${i} - Primeros 100 caracteres:`,
                        pageText.substring(0, 100)
                    );
                }

                // Buscar todas las ocurrencias en la página
                let startIndex = 0;
                let matchIndex = 0;
                while (
                    (matchIndex = pageText.indexOf(
                        normalizedQuery,
                        startIndex
                    )) !== -1
                ) {
                    // Extraer contexto alrededor de la coincidencia
                    const contextStart = Math.max(0, matchIndex - 50);
                    const contextEnd = Math.min(
                        pageText.length,
                        matchIndex + normalizedQuery.length + 50
                    );
                    const context = pageText.substring(
                        contextStart,
                        contextEnd
                    );

                    results.push({
                        pageNumber: i,
                        textContent: context,
                        matchIndex: matchIndex,
                    });
                    startIndex = matchIndex + normalizedQuery.length;
                }
            }

            setSearchResults(results);
            setCurrentSearchIndex(results.length > 0 ? 0 : -1);

            // Navegar al primer resultado
            if (results.length > 0) {
                handlePageChange(results[0].pageNumber);
            }
        } catch (error) {
            console.error('Error al buscar en el PDF:', error);
        } finally {
            setIsSearching(false);
        }
    };

    // Navegar al siguiente resultado de búsqueda
    const nextSearchResult = () => {
        if (searchResults.length === 0) return;
        const nextIndex = (currentSearchIndex + 1) % searchResults.length;
        setCurrentSearchIndex(nextIndex);
        const result = searchResults[nextIndex];
        handlePageChange(result.pageNumber);
    };

    // Navegar al resultado anterior de búsqueda
    const prevSearchResult = () => {
        if (searchResults.length === 0) return;
        const prevIndex =
            currentSearchIndex - 1 < 0
                ? searchResults.length - 1
                : currentSearchIndex - 1;
        setCurrentSearchIndex(prevIndex);
        const result = searchResults[prevIndex];
        handlePageChange(result.pageNumber);
    };

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

    // Cambios de página simples
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setSliderValue(page);
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
        return <div>PDF no encontrado para este libro</div>;
    }

    return (
        <div ref={readerContainerRef} className="flex flex-col min-h-screen">
            <div
                className={`flex flex-none justify-between items-center p-4 sm:p-8 border-b-1 ${
                    isDarkMode ? 'bg-gray-900 border-gray-800' : ''
                }`}
            >
                <div className="hidden sm:flex gap-3">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                className={
                                    isDarkMode
                                        ? 'bg-gray-800 text-blue-400 hover:bg-gray-700'
                                        : 'bg-blue-50 text-blue-400 hover:bg-blue-50'
                                }
                            >
                                <span className="material-symbols-outlined">
                                    notes
                                </span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-8 m-3 z-10 rounded-2xl border-blue-400/30 w-full sm:w-auto"></PopoverContent>
                    </Popover>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                className={
                                    isDarkMode
                                        ? 'bg-gray-800 text-blue-400 hover:bg-gray-700'
                                        : 'bg-blue-50 text-blue-400 hover:bg-blue-50'
                                }
                            >
                                <span className="material-symbols-outlined">
                                    bookmarks
                                </span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-8 m-3 z-10 rounded-2xl border-blue-400/30 w-full sm:w-auto"></PopoverContent>
                    </Popover>
                </div>
                <div className="text-center space-y-2">
                    <h2
                        className={`text-2xl sm:text-3xl font-bold ${
                            isDarkMode ? 'text-gray-100' : ''
                        }`}
                    >
                        {book.title}
                    </h2>
                    <span
                        className={`hidden sm:block font-thin text-lg ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}
                    >
                        {book.author.person.firstName}
                        {book.author.person.lastName} - {book.publicationYear}
                    </span>
                </div>
                <div className="space-x-3">
                    <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                className={
                                    isDarkMode
                                        ? 'bg-gray-800 text-blue-400 hover:bg-gray-700'
                                        : 'bg-blue-50 text-blue-400 hover:bg-blue-50'
                                }
                            >
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
                                        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                                            Página{' '}
                                            {
                                                searchResults[
                                                    currentSearchIndex
                                                ]?.pageNumber
                                            }
                                        </div>
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
                            <Button
                                className={
                                    isDarkMode
                                        ? 'bg-gray-800 text-blue-400 hover:bg-gray-700'
                                        : 'bg-blue-50 text-blue-400 hover:bg-blue-50'
                                }
                            >
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

                                {/* Tema */}
                                <div>
                                    <h3 className="font-bold mb-3">Tema</h3>
                                    <div className="flex justify-between items-center">
                                        <span
                                            className={
                                                isDarkMode
                                                    ? 'text-gray-400'
                                                    : 'text-gray-900'
                                            }
                                        >
                                            Claro
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={isDarkMode}
                                                onCheckedChange={setIsDarkMode}
                                            />
                                            <span
                                                className={
                                                    isDarkMode
                                                        ? 'text-white font-semibold'
                                                        : 'text-gray-400'
                                                }
                                            >
                                                Oscuro
                                            </span>
                                        </div>
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

                    <Button
                        className={
                            isDarkMode
                                ? 'bg-gray-800 text-blue-400 hover:bg-gray-700'
                                : 'bg-blue-50 text-blue-400 hover:bg-blue-50'
                        }
                        onClick={() => setIsBookmarked(!isBookmarked)}
                    >
                        <span
                            className={`material-symbols-outlined ${
                                isBookmarked ? 'fill' : ''
                            }`}
                        >
                            bookmark
                        </span>
                    </Button>
                    <Button
                        className={
                            isDarkMode
                                ? 'bg-gray-800 text-blue-400 hover:bg-gray-700'
                                : 'bg-blue-50 text-blue-400 hover:bg-blue-50'
                        }
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
                className={`relative flex-1 overflow-hidden ${getFontFamilyClass()} ${
                    isDarkMode ? 'pdf-dark-mode bg-black' : 'pdf-light-mode'
                }`}
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
                        <div className="flex justify-center items-center  max-w-screen-lg mx-auto py-8 bg-amber-200">
                            <HTMLFlipBook
                                key={`flipbook-${scale}`}
                                ref={flipBookRef}
                                width={bookSize.width * scale}
                                height={bookSize.height * scale}
                                size="stretch"
                                minWidth={315}
                                minHeight={0}
                                maxWidth={1000}
                                maxHeight={1000}
                                maxShadowOpacity={0.5}
                                showCover={true}
                                mobileScrollSupport={false}
                                onFlip={(e: { data: number }) => {
                                    handlePageChange(e.data);
                                }}
                                className=""
                                style={{}}
                                startPage={0}
                                drawShadow={true}
                                flippingTime={1000}
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
                                    <div
                                        key={pageNum}
                                        className="bg-blue-400"
                                        style={{
                                            backgroundColor: isDarkMode
                                                ? '#1a1a1a'
                                                : '#ffffff',
                                        }}
                                    >
                                        <Page
                                            pageNumber={pageNum}
                                            renderAnnotationLayer={false}
                                            renderTextLayer={true}
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
                    className={`fixed left-2 sm:left-4 top-1/2 -translate-y-1/2 rounded-full shadow-lg w-10 h-10 sm:w-14 sm:h-14 z-50 disabled:opacity-50 ${
                        isDarkMode
                            ? 'bg-gray-800 text-blue-400 hover:bg-gray-700'
                            : 'bg-blue-400 text-white hover:bg-blue-500'
                    }`}
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    title="Página anterior (Flecha izquierda)"
                >
                    <span className="material-symbols-outlined text-2xl sm:text-3xl">
                        chevron_left
                    </span>
                </Button>

                {/* Botón Siguiente - Costado Derecho */}
                <Button
                    className={`fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 rounded-full shadow-lg w-10 h-10 sm:w-14 sm:h-14 z-50 disabled:opacity-50 ${
                        isDarkMode
                            ? 'bg-gray-800 text-blue-400 hover:bg-gray-700'
                            : 'bg-blue-400 text-white hover:bg-blue-500'
                    }`}
                    onClick={nextPage}
                    disabled={currentPage + 2 > numPages}
                    title="Página siguiente (Flecha derecha)"
                >
                    <span className="material-symbols-outlined text-2xl sm:text-3xl">
                        chevron_right
                    </span>
                </Button>
            </div>
            <div
                className={`flex-none p-4 sm:p-8 ${
                    isDarkMode ? 'bg-gray-900' : ''
                }`}
            >
                <div className="mb-3 flex justify-center">
                    <span
                        className={`font-normal ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}
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
                    className={
                        isDarkMode
                            ? '[&>span]:bg-gray-700 [&>span>span]:bg-blue-500'
                            : '[&>span]:bg-blue-100 [&>span>span]:bg-blue-400'
                    }
                    value={[sliderValue]}
                    min={1}
                    max={numPages - 1}
                    step={2}
                    onValueChange={(value) => setSliderValue(value[0])}
                    onValueCommit={(value) => handlePageChange(value[0])}
                />
            </div>
        </div>
    );
};
