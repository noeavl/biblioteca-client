import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    Pencil,
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { getBookById } from '@/panel/api/books.api';
import type { Book } from '@/library/interfaces/book.interface';
import { toast } from 'sonner';
import { pdfjs, Document, Page } from 'react-pdf';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// Usar CDN para el worker en producción (evita problemas de MIME type)
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const BookDetailPage = () => {
    const navigate = useNavigate();
    const { bookId } = useParams<{ bookId: string }>();
    const [loading, setLoading] = useState(true);
    const [book, setBook] = useState<Book | null>(null);

    // Estados para el visor de PDF
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);

    useEffect(() => {
        const fetchBook = async () => {
            if (!bookId) {
                toast.error('ID del libro no válido');
                navigate('/panel/libros');
                return;
            }

            try {
                setLoading(true);
                const bookData = await getBookById(bookId, true);
                setBook(bookData);
            } catch (error) {
                toast.error('Error al cargar el libro');
                console.error(error);
                navigate('/panel/libros');
            } finally {
                setLoading(false);
            }
        };

        fetchBook();
    }, [bookId, navigate]);

    const onDocumentLoadSuccess = useCallback(
        (pdf: PDFDocumentProxy) => {
            setNumPages(pdf.numPages);
        },
        []
    );

    const nextPage = () => {
        if (currentPage < numPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const zoomIn = () => {
        setScale((prev) => Math.min(prev + 0.2, 2.0));
    };

    const zoomOut = () => {
        setScale((prev) => Math.max(prev - 0.2, 0.5));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!book) {
        return null;
    }

    const coverUrl = book.coverImage
        ? `${import.meta.env.VITE_API_URL}/files/cover/${book.coverImage}`
        : null;

    const pdfUrl = book.fileName
        ? `${import.meta.env.VITE_API_URL}/files/book/${book.fileName}`
        : null;

    return (
        <div className="flex flex-col gap-6 p-6 w-full max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/panel/libros')}
                    >
                        <ArrowLeft />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Detalle del Libro
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Información completa y vista previa del libro
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => navigate(`/panel/libros/editar/${bookId}`)}
                >
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna izquierda - Información del libro */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Portada e información básica */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información General</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Portada */}
                            {coverUrl && (
                                <div className="flex justify-center">
                                    <img
                                        src={coverUrl}
                                        alt={book.title}
                                        className="w-48 h-64 object-cover rounded-lg border-2 shadow-md"
                                    />
                                </div>
                            )}

                            {/* Título y autor */}
                            <div>
                                <h2 className="text-2xl font-bold">
                                    {book.title}
                                </h2>
                                <p className="text-muted-foreground mt-1">
                                    {book.author.person.firstName}{' '}
                                    {book.author.person.lastName}
                                </p>
                            </div>

                            <Separator />

                            {/* Estado */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    Estado:
                                </span>
                                <Badge
                                    variant={
                                        book.status ? 'default' : 'secondary'
                                    }
                                >
                                    {book.status ? 'Activo' : 'Inactivo'}
                                </Badge>
                            </div>

                            {/* Año de publicación */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    Año de publicación:
                                </span>
                                <span className="text-sm">
                                    {book.publicationYear}
                                </span>
                            </div>

                            {/* Categoría */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    Categoría:
                                </span>
                                <Badge variant="outline" className="capitalize">
                                    {book.category.name}
                                </Badge>
                            </div>

                            {/* PDF disponible */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    PDF disponible:
                                </span>
                                <Badge
                                    variant={
                                        book.fileName ? 'default' : 'secondary'
                                    }
                                >
                                    {book.fileName ? 'Sí' : 'No'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sinopsis */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sinopsis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {book.synopsis}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Columna derecha - Visor de PDF */}
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Vista Previa del PDF</CardTitle>
                                    <CardDescription>
                                        {pdfUrl
                                            ? 'Visualiza el contenido del libro'
                                            : 'No hay PDF disponible para este libro'}
                                    </CardDescription>
                                </div>
                                {pdfUrl && (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={zoomOut}
                                            disabled={scale <= 0.5}
                                        >
                                            <ZoomOut className="h-4 w-4" />
                                        </Button>
                                        <span className="text-sm font-medium min-w-[4rem] text-center">
                                            {Math.round(scale * 100)}%
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={zoomIn}
                                            disabled={scale >= 2.0}
                                        >
                                            <ZoomIn className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {pdfUrl ? (
                                <div className="space-y-4">
                                    {/* Visor de PDF */}
                                    <div className="border rounded-lg overflow-hidden bg-gray-50">
                                        <div className="flex justify-center items-center p-4 min-h-[600px]">
                                            <Document
                                                file={pdfUrl}
                                                onLoadSuccess={
                                                    onDocumentLoadSuccess
                                                }
                                                loading={
                                                    <div className="flex items-center justify-center h-[600px]">
                                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                                    </div>
                                                }
                                                error={
                                                    <div className="flex items-center justify-center h-[600px] text-destructive">
                                                        Error al cargar el PDF
                                                    </div>
                                                }
                                            >
                                                <Page
                                                    pageNumber={currentPage}
                                                    scale={scale}
                                                    renderAnnotationLayer={true}
                                                    renderTextLayer={true}
                                                    loading={
                                                        <div className="flex items-center justify-center h-[600px]">
                                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                                        </div>
                                                    }
                                                />
                                            </Document>
                                        </div>
                                    </div>

                                    {/* Controles de navegación */}
                                    {numPages > 0 && (
                                        <div className="flex items-center justify-between">
                                            <Button
                                                variant="outline"
                                                onClick={prevPage}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4 mr-2" />
                                                Anterior
                                            </Button>
                                            <div className="text-sm font-medium">
                                                Página {currentPage} de{' '}
                                                {numPages}
                                            </div>
                                            <Button
                                                variant="outline"
                                                onClick={nextPage}
                                                disabled={
                                                    currentPage === numPages
                                                }
                                            >
                                                Siguiente
                                                <ChevronRight className="h-4 w-4 ml-2" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[600px] text-muted-foreground">
                                    <p className="text-lg mb-2">
                                        No hay PDF disponible
                                    </p>
                                    <p className="text-sm">
                                        Este libro no tiene un archivo PDF
                                        asociado
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
