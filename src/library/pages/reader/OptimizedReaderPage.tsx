import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { getBookById } from '@/library/api/books.api';
import type { Book } from '@/library/interfaces/book.interface';
import { useParams, useNavigate } from 'react-router';
import { useState, useRef, useEffect, useCallback } from 'react';
import { pdfjs, Document } from 'react-pdf';
import { Spinner } from '@/components/ui/spinner';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { BookOpen, ArrowLeft, FileX } from 'lucide-react';
import { SimplePdfPageWithText } from '@/library/components/SimplePdfPageWithText';
import 'react-pdf/dist/Page/TextLayer.css';

// Usar CDN para el worker en producción (evita problemas de MIME type)
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const pdfOptions = {
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
    disableFontFace: false,
    disableAutoFetch: false,
};

export const OptimizedReaderPage = () => {
    const { bookId } = useParams<{ bookId: string }>();
    const navigate = useNavigate();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [sliderValue, setSliderValue] = useState<number>(1);
    const [numPages, setNumPages] = useState<number>(100);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const readerContainerRef = useRef<HTMLDivElement>(null);
    const pdfDocumentRef = useRef<PDFDocumentProxy | null>(null);

    // Tamaño de página calculado
    const [pageWidth, setPageWidth] = useState(600);
    const [pageHeight, setPageHeight] = useState(848);

    // Ya no usamos el hook de caché por ahora, usaremos renderizado directo

    // Calcular tamaño óptimo de páginas
    useEffect(() => {
        const calculatePageSize = () => {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const availableHeight = viewportHeight - 250;
            const availableWidthPerPage = (viewportWidth - 200) / 2;
            const A4_RATIO = 1.414;

            let width = availableWidthPerPage;
            let height = width * A4_RATIO;

            if (height > availableHeight) {
                height = availableHeight;
                width = height / A4_RATIO;
            }

            width = Math.max(300, Math.min(width, 600));
            height = width * A4_RATIO;

            setPageWidth(width);
            setPageHeight(height);
        };

        calculatePageSize();
        window.addEventListener('resize', calculatePageSize);
        return () => window.removeEventListener('resize', calculatePageSize);
    }, [isFullscreen]);

    // Cargar información del libro
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

    // Manejar carga del documento PDF
    const onDocumentLoadSuccess = useCallback(
        ({ numPages }: { numPages: number }) => {
            setNumPages(numPages);
        },
        []
    );

    // Navegación de páginas
    const nextPage = useCallback(() => {
        if (currentPage + 2 <= numPages) {
            setCurrentPage((prev) => prev + 2);
            setSliderValue((prev) => prev + 2);
        } else if (currentPage + 1 <= numPages) {
            setCurrentPage((prev) => prev + 1);
            setSliderValue((prev) => prev + 1);
        }
    }, [currentPage, numPages]);

    const prevPage = useCallback(() => {
        if (currentPage > 2) {
            setCurrentPage((prev) => prev - 2);
            setSliderValue((prev) => prev - 2);
        } else if (currentPage > 1) {
            setCurrentPage(1);
            setSliderValue(1);
        }
    }, [currentPage]);

    const goToPage = useCallback(
        (page: number) => {
            if (page >= 1 && page <= numPages) {
                setCurrentPage(page);
                setSliderValue(page);
            }
        },
        [numPages]
    );

    // Navegación con teclado
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
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
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [nextPage, prevPage]);

    // Pantalla completa
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

    // Estados de carga
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner />
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-destructive">{error || 'Libro no encontrado'}</p>
            </div>
        );
    }

    const pdfUrl = book.fileName
        ? `${import.meta.env.VITE_API_URL}/files/book/${book.fileName}`
        : null;

    if (!pdfUrl) {
        return (
            <div className="flex flex-col min-h-screen bg-background">
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
                                {book.author.person.lastName} • {book.publicationYear}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="max-w-md w-full text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-muted flex items-center justify-center">
                                <FileX className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                                PDF no disponible
                            </h2>
                            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                Este libro no tiene un archivo PDF asociado. Por favor, contacta al
                                administrador.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                            <Button
                                variant="default"
                                size="lg"
                                onClick={() => navigate(`/libros/detalle/${book._id}`)}
                                className="gap-2"
                            >
                                <BookOpen className="h-4 w-4" />
                                Ver detalles
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

    // Renderizado directo sin caché por ahora

    return (
        <div
            ref={readerContainerRef}
            className="flex flex-col min-h-screen bg-background text-foreground"
        >
            {/* Header */}
            <div
                className={`flex-none justify-between items-center ${
                    isFullscreen ? 'p-2 sm:p-3' : 'p-3 sm:p-4 md:p-6 lg:p-8'
                } border-b border-foreground/20 flex`}
            >
                <div className="hidden sm:flex gap-3">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button>
                                <span className="material-symbols-outlined">bookmarks</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-8 m-3 z-10 rounded-2xl border-blue-400/30 w-full sm:w-auto">
                            <p className="text-sm text-muted-foreground">Marcadores próximamente</p>
                        </PopoverContent>
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
                            isFullscreen ? 'text-xs sm:text-sm' : 'text-sm sm:text-base md:text-lg'
                        } text-muted-foreground`}
                    >
                        {book.author.person.firstName} {book.author.person.lastName} -{' '}
                        {book.publicationYear}
                    </span>
                </div>

                <div className="space-x-3">
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
                            isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'
                        }
                    >
                        <span className="material-symbols-outlined">
                            {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                        </span>
                    </Button>
                </div>
            </div>

            {/* Contenido principal con páginas */}
            <div
                className={`relative flex-1 ${
                    isFullscreen ? 'overflow-y-auto overflow-x-hidden' : 'overflow-hidden'
                } bg-background`}
            >
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
                                No se pudo cargar el documento. Por favor, intenta nuevamente.
                            </p>
                            <Button onClick={() => window.location.reload()}>
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
                        className={`flex justify-center items-start gap-4 ${
                            isFullscreen ? 'pt-4' : ''
                        } mx-auto p-2 sm:p-4 md:p-6 lg:p-8 bg-background min-h-full`}
                    >
                        {/* Página izquierda */}
                        <SimplePdfPageWithText
                            pageNumber={currentPage}
                            width={pageWidth}
                            height={pageHeight}
                            className="flex-shrink-0"
                        />

                        {/* Página derecha (si existe) */}
                        {currentPage + 1 <= numPages && (
                            <SimplePdfPageWithText
                                pageNumber={currentPage + 1}
                                width={pageWidth}
                                height={pageHeight}
                                className="flex-shrink-0"
                            />
                        )}
                    </div>
                </Document>

                {/* Botones de navegación */}
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

            {/* Footer con slider */}
            <div
                className={`flex-none ${
                    isFullscreen ? 'p-2 sm:p-3' : 'p-3 sm:p-4 md:p-6 lg:p-8'
                } bg-background border-t border-foreground/20`}
            >
                <div className="mb-2 sm:mb-3 flex justify-center">
                    <span className="text-sm sm:text-base md:text-lg font-normal text-foreground">
                        Página{' '}
                        <span className="font-bold text-blue-400">{sliderValue}</span> de{' '}
                        <span className="font-bold text-blue-400">{numPages}</span>
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
