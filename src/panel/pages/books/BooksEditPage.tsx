import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Upload, X, FileText } from 'lucide-react';
import { getAuthors } from '@/panel/api/authors.api';
import { getCategories } from '@/panel/api/categories.api';
import { getBookById, updateBook } from '@/panel/api/books.api';
import { uploadBookPDF, uploadBookCover } from '@/panel/api/files.api';
import type { Author } from '@/library/interfaces/author.interface';
import type { BookCategory, Book } from '@/library/interfaces/book.interface';
import { toast } from 'sonner';

export const BooksEditPage = () => {
    const navigate = useNavigate();
    const { bookId } = useParams<{ bookId: string }>();
    const [loading, setLoading] = useState(false);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [categories, setCategories] = useState<BookCategory[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [book, setBook] = useState<Book | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        authorId: '',
        categoryId: '',
        publicationYear: new Date().getFullYear(),
    });

    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [currentCoverUrl, setCurrentCoverUrl] = useState<string | null>(null);
    const [hasPDF, setHasPDF] = useState(false);

    // Cargar datos iniciales
    useEffect(() => {
        const fetchData = async () => {
            if (!bookId) {
                toast.error('ID del libro no válido');
                navigate('/panel/libros');
                return;
            }

            try {
                setLoadingData(true);
                const [bookData, authorsData, categoriesData] = await Promise.all([
                    getBookById(bookId),
                    getAuthors(),
                    getCategories(),
                ]);

                setBook(bookData);
                setAuthors(authorsData.authors);
                setCategories(categoriesData.categories);

                // Establecer valores del formulario
                setFormData({
                    title: bookData.title,
                    authorId: bookData.author._id,
                    categoryId: bookData.category._id,
                    publicationYear: bookData.publicationYear,
                });

                // Establecer portada actual
                if (bookData.coverImage) {
                    setCurrentCoverUrl(
                        `${import.meta.env.VITE_API_URL}/files/cover/${bookData.coverImage}`
                    );
                }

                // Verificar si tiene PDF
                if (bookData.fileName) {
                    setHasPDF(true);
                }
            } catch (error) {
                toast.error('Error al cargar los datos del libro');
                console.error(error);
                navigate('/panel/libros');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [bookId, navigate]);

    // Manejar cambio de imagen
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Por favor selecciona una imagen válida');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.error('La imagen no debe superar los 5MB');
                return;
            }

            setCoverImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Remover imagen nueva
    const handleRemoveImage = () => {
        setCoverImage(null);
        setPreviewUrl(null);
    };

    // Manejar cambio de PDF
    const handlePDFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                toast.error('Por favor selecciona un archivo PDF válido');
                return;
            }

            if (file.size > 50 * 1024 * 1024) {
                toast.error('El PDF no debe superar los 50MB');
                return;
            }

            setPdfFile(file);
            toast.success('PDF seleccionado correctamente');
        }
    };

    // Remover PDF
    const handleRemovePDF = () => {
        setPdfFile(null);
    };

    // Manejar submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!bookId) return;

        // Validaciones
        if (!formData.title.trim()) {
            toast.error('El título es requerido');
            return;
        }

        if (!formData.authorId) {
            toast.error('Debe seleccionar un autor');
            return;
        }

        if (!formData.categoryId) {
            toast.error('Debe seleccionar una categoría');
            return;
        }

        if (
            formData.publicationYear < 1 ||
            formData.publicationYear > 2030
        ) {
            toast.error('El año de publicación debe estar entre 1 y 2030');
            return;
        }

        try {
            setLoading(true);

            // Actualizar datos básicos del libro
            await updateBook(bookId, formData);

            // Subir archivos si existen
            const uploadPromises = [];
            let updatedCover = false;
            let updatedPDF = false;

            if (coverImage) {
                updatedCover = true;
                uploadPromises.push(
                    uploadBookCover(bookId, coverImage).catch((error) => {
                        console.error('Error al subir portada:', error);
                        throw new Error('cover');
                    })
                );
            }

            if (pdfFile) {
                updatedPDF = true;
                uploadPromises.push(
                    uploadBookPDF(bookId, pdfFile).catch((error) => {
                        console.error('Error al subir PDF:', error);
                        throw new Error('pdf');
                    })
                );
            }

            // Ejecutar subidas en paralelo
            if (uploadPromises.length > 0) {
                try {
                    await Promise.all(uploadPromises);
                    if (updatedCover && updatedPDF) {
                        toast.success('Libro, portada y PDF actualizados exitosamente');
                    } else if (updatedCover) {
                        toast.success('Libro y portada actualizados exitosamente');
                    } else if (updatedPDF) {
                        toast.success('Libro y PDF actualizados exitosamente');
                    }
                } catch (uploadError) {
                    const errorMessage = (uploadError as Error).message;
                    if (errorMessage === 'cover') {
                        toast.warning('Libro actualizado, pero hubo un error al subir la portada');
                    } else if (errorMessage === 'pdf') {
                        toast.warning('Libro actualizado, pero hubo un error al subir el PDF');
                    } else {
                        toast.warning('Libro actualizado, pero hubo errores al subir los archivos');
                    }
                }
            } else {
                toast.success('Libro actualizado exitosamente');
            }

            navigate('/panel/libros');
        } catch (error) {
            toast.error('Error al actualizar el libro');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!book) {
        return null;
    }

    const displayCoverUrl = previewUrl || currentCoverUrl;

    return (
        <div className="flex flex-col gap-6 p-6 w-full max-w-4xl mx-auto">
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
                        Editar Libro
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Actualiza la información del libro
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Información del Libro</CardTitle>
                        <CardDescription>
                            Modifica los campos que desees actualizar
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Título */}
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                Título <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="title"
                                placeholder="Ej: Cien años de soledad"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        title: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>

                        {/* Autor */}
                        <div className="space-y-2">
                            <Label htmlFor="author">
                                Autor <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={formData.authorId}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, authorId: value })
                                }
                                required
                            >
                                <SelectTrigger id="author">
                                    <SelectValue placeholder="Selecciona un autor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {authors.map((author) => (
                                        <SelectItem
                                            key={author._id}
                                            value={author._id}
                                        >
                                            {author.person.firstName}{' '}
                                            {author.person.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Categoría */}
                        <div className="space-y-2">
                            <Label htmlFor="category">
                                Categoría <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={formData.categoryId || undefined}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        categoryId: value,
                                    })
                                }
                                required
                            >
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Selecciona una categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem
                                            key={category._id}
                                            value={category._id}
                                        >
                                            <span className="capitalize">
                                                {category.name}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Año de publicación */}
                        <div className="space-y-2">
                            <Label htmlFor="year">
                                Año de Publicación{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="year"
                                type="number"
                                min="1"
                                max="2030"
                                placeholder="Ej: 1967"
                                value={formData.publicationYear}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        publicationYear: parseInt(
                                            e.target.value
                                        ),
                                    })
                                }
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Debe estar entre 1 y 2030
                            </p>
                        </div>

                        {/* Portada */}
                        <div className="space-y-2">
                            <Label htmlFor="cover">
                                Portada {currentCoverUrl && '(Reemplazar)'}
                            </Label>
                            {!displayCoverUrl ? (
                                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                                    <input
                                        id="cover"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="cover"
                                        className="cursor-pointer flex flex-col items-center gap-2"
                                    >
                                        <Upload className="h-10 w-10 text-muted-foreground" />
                                        <div className="text-sm">
                                            <span className="font-semibold text-primary">
                                                Haz clic para subir
                                            </span>{' '}
                                            <span className="text-muted-foreground">
                                                o arrastra y suelta
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            PNG, JPG o WEBP (máx. 5MB)
                                        </p>
                                    </label>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="relative inline-block">
                                        <img
                                            src={displayCoverUrl}
                                            alt="Preview"
                                            className="w-40 h-56 object-cover rounded-lg border-2"
                                        />
                                        {previewUrl && (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon-sm"
                                                className="absolute -top-2 -right-2"
                                                onClick={handleRemoveImage}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    {!previewUrl && (
                                        <div>
                                            <input
                                                id="cover-replace"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                            <label htmlFor="cover-replace">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => document.getElementById('cover-replace')?.click()}
                                                >
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Cambiar portada
                                                </Button>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* PDF del libro */}
                        <div className="space-y-2">
                            <Label htmlFor="pdf">
                                Archivo PDF {hasPDF && '(Reemplazar)'}
                            </Label>
                            {!pdfFile ? (
                                <div className="space-y-2">
                                    {hasPDF && (
                                        <div className="flex items-center gap-3 p-4 border-2 rounded-lg bg-muted/50">
                                            <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">
                                                    PDF actual del libro
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Sube un nuevo archivo para reemplazarlo
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                                        <input
                                            id="pdf"
                                            type="file"
                                            accept="application/pdf"
                                            onChange={handlePDFChange}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="pdf"
                                            className="cursor-pointer flex flex-col items-center gap-2"
                                        >
                                            <FileText className="h-10 w-10 text-muted-foreground" />
                                            <div className="text-sm">
                                                <span className="font-semibold text-primary">
                                                    Haz clic para subir PDF
                                                </span>{' '}
                                                <span className="text-muted-foreground">
                                                    o arrastra y suelta
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Archivo PDF (máx. 50MB)
                                            </p>
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 p-4 border-2 border-green-500/50 rounded-lg bg-green-50 dark:bg-green-950/20">
                                    <FileText className="h-8 w-8 text-green-600 dark:text-green-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate text-green-900 dark:text-green-100">
                                            {pdfFile.name}
                                        </p>
                                        <p className="text-xs text-green-700 dark:text-green-300">
                                            {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={handleRemovePDF}
                                        className="flex-shrink-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Botones */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/panel/libros')}
                                disabled={loading}
                                className="flex-1"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1"
                            >
                                {loading ? 'Actualizando...' : 'Actualizar Libro'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
};
