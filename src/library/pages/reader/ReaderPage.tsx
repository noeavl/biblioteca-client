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
import type { Book } from '@/mocks/books.mock';
import { useLoaderData } from 'react-router';
import { useState, useRef, useEffect, useCallback } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import { Spinner } from '@/components/ui/spinner';
import type { PDFDocumentProxy } from 'pdfjs-dist';
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

// Tipos para configuración de lectura
type FontSize = 'small' | 'medium' | 'large';
type FontFamily = 'serif' | 'sans-serif' | 'monospace' | 'georgia' | 'palatino';

export const ReaderPage = () => {
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

    // Estados para configuración de lectura
    const [fontSize, setFontSize] = useState<FontSize>('medium');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [fontFamily, setFontFamily] = useState<FontFamily>('serif');
    const [scale, setScale] = useState<number>(1.0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const readerContainerRef = useRef<HTMLDivElement>(null);

    const book = useLoaderData<Book>();

    // Función para cuando el documento PDF se carga exitosamente
    const onDocumentLoadSuccess = useCallback(
        ({ numPages }: { numPages: number }) => {
            setNumPages(numPages);
        },
        []
    );

    // Funciones de navegación
    const nextPage = useCallback(() => {
        if (currentPage + 2 > numPages) return;
        const newPage = Math.min(currentPage + 2, numPages - 1);
        setCurrentPage(newPage);
        setSliderValue(newPage);
    }, [currentPage, numPages]);

    const prevPage = useCallback(() => {
        if (currentPage === 1) return;
        const newPage = currentPage - 2;
        setCurrentPage(newPage);
        setSliderValue(newPage);
    }, [currentPage]);

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

            console.log('Resultados encontrados:', results.length);

            setSearchResults(results);
            setCurrentSearchIndex(results.length > 0 ? 0 : -1);

            // Navegar al primer resultado
            if (results.length > 0) {
                setCurrentPage(results[0].pageNumber);
                setSliderValue(results[0].pageNumber);
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
        setCurrentPage(result.pageNumber);
        setSliderValue(result.pageNumber);
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
        setCurrentPage(result.pageNumber);
        setSliderValue(result.pageNumber);
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

    // Validación del libro después de todos los hooks
    if (!book) {
        return <div>Libro no encontrado</div>;
    }

    return (
        <div ref={readerContainerRef} className="flex flex-col h-screen">
            <div
                className={`flex flex-none justify-between items-center p-8 border-b-1 ${
                    isDarkMode ? 'bg-gray-900 border-gray-800' : ''
                }`}
            >
                <div className="flex gap-3">
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
                        <PopoverContent className="p-8 m-3 z-10 rounded-2xl border-blue-400/30"></PopoverContent>
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
                        <PopoverContent className="p-8 m-3 z-10 rounded-2xl border-blue-400/30"></PopoverContent>
                    </Popover>
                </div>
                <div className="text-center space-y-2">
                    <h2
                        className={`text-3xl font-bold ${
                            isDarkMode ? 'text-gray-100' : ''
                        }`}
                    >
                        {book.title}
                    </h2>
                    <span
                        className={`font-thin text-lg ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}
                    >
                        {book.author} - {book.publicationYear}
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
                        <PopoverContent className="p-4 m-3 z-10 rounded-2xl border-blue-400/30 w-96">
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
                        <PopoverContent className="p-8 m-3 z-10 rounded-2xl border-blue-400/30 w-80">
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
                className={`relative flex-1 overflow-y-auto ${getFontFamilyClass()} ${
                    isDarkMode ? 'pdf-dark-mode bg-black' : 'pdf-light-mode'
                }`}
            >
                <style>{`
                    .react-pdf__Page__canvas {
                        display: none !important;
                    }
                    .react-pdf__Page__textContent {
                        position: relative !important;
                    }
                    .react-pdf__Page__textContent span {
                        text-shadow: none !important;
                        font-family: ${
                            fontFamily === 'serif'
                                ? 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif'
                                : fontFamily === 'sans-serif'
                                ? 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                                : fontFamily === 'monospace'
                                ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                                : fontFamily === 'georgia'
                                ? 'Georgia, serif'
                                : fontFamily === 'palatino'
                                ? 'Palatino, "Palatino Linotype", "Book Antiqua", serif'
                                : 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif'
                        } !important;
                    }
                    .pdf-dark-mode .react-pdf__Page {
                        background-color: #1a1a1a !important;
                    }
                    .pdf-dark-mode .react-pdf__Page__textContent {
                        background-color: #1a1a1a !important;
                    }
                    .pdf-dark-mode .react-pdf__Page__textContent span {
                        color: #ffffff !important;
                    }
                    .pdf-light-mode .react-pdf__Page {
                        background-color: #ffffff !important;
                    }
                    .pdf-light-mode .react-pdf__Page__textContent {
                        background-color: #ffffff !important;
                    }
                    .pdf-light-mode .react-pdf__Page__textContent span {
                        color: #000000 !important;
                    }
                `}</style>
                <Document
                    className="py-8"
                    file={book.pdf}
                    loading={
                        <div className="flex justify-center items-center min-h-[800px]">
                            <Spinner />
                        </div>
                    }
                    onLoadSuccess={(pdf) => {
                        onDocumentLoadSuccess(pdf);
                        pdfDocumentRef.current = pdf;
                    }}
                >
                    <div className="flex justify-center items-center gap-4">
                        <Page
                            pageNumber={currentPage}
                            renderAnnotationLayer={false}
                            renderTextLayer={true}
                            scale={scale}
                            loading={
                                <div className="flex justify-center items-center min-h-[800px]">
                                    <Spinner />
                                </div>
                            }
                        />
                        {currentPage + 1 <= numPages && (
                            <Page
                                pageNumber={currentPage + 1}
                                renderTextLayer={true}
                                renderAnnotationLayer={false}
                                scale={scale}
                                loading={
                                    <div className="flex justify-center items-center min-h-[800px]">
                                        <Spinner />
                                    </div>
                                }
                            />
                        )}
                    </div>
                </Document>

                {/* Botón Anterior - Costado Izquierdo */}
                <Button
                    className={`fixed left-4 top-1/2 -translate-y-1/2 rounded-full shadow-lg w-14 h-14 z-50 disabled:opacity-50 ${
                        isDarkMode
                            ? 'bg-gray-800 text-blue-400 hover:bg-gray-700'
                            : 'bg-blue-400 text-white hover:bg-blue-500'
                    }`}
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    title="Página anterior (Flecha izquierda)"
                >
                    <span className="material-symbols-outlined text-3xl">
                        chevron_left
                    </span>
                </Button>

                {/* Botón Siguiente - Costado Derecho */}
                <Button
                    className={`fixed right-4 top-1/2 -translate-y-1/2 rounded-full shadow-lg w-14 h-14 z-50 disabled:opacity-50 ${
                        isDarkMode
                            ? 'bg-gray-800 text-blue-400 hover:bg-gray-700'
                            : 'bg-blue-400 text-white hover:bg-blue-500'
                    }`}
                    onClick={nextPage}
                    disabled={currentPage + 2 > numPages}
                    title="Página siguiente (Flecha derecha)"
                >
                    <span className="material-symbols-outlined text-3xl">
                        chevron_right
                    </span>
                </Button>
            </div>
            <div className={`flex-none p-8 ${isDarkMode ? 'bg-gray-900' : ''}`}>
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
                    onValueCommit={(value) => setCurrentPage(value[0])}
                />
            </div>
        </div>
    );
};
