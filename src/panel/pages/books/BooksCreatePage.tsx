import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
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
import { createBook } from '@/panel/api/books.api';
import { uploadBookPDF, uploadBookCover } from '@/panel/api/files.api';
import type { Author } from '@/library/interfaces/author.interface';
import type { BookCategory } from '@/library/interfaces/book.interface';
import { toast } from 'sonner';

export const BooksCreatePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [categories, setCategories] = useState<BookCategory[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    const [formData, setFormData] = useState({
        title: '',
        authorId: '',
        categoryId: '',
        publicationYear: new Date().getFullYear(),
    });

    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [pdfFile, setPdfFile] = useState<File | null>(null);

    // Cargar autores y categorías
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingData(true);
                const [authorsData, categoriesData] = await Promise.all([
                    getAuthors(),
                    getCategories(),
                ]);
                setAuthors(authorsData);
                setCategories(categoriesData);
            } catch (error) {
                toast.error('Error al cargar los datos necesarios');
                console.error(error);
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, []);

    // Manejar cambio de imagen
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                toast.error('Por favor selecciona una imagen válida');
                return;
            }

            // Validar tamaño (máximo 5MB)
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

    // Remover imagen
    const handleRemoveImage = () => {
        setCoverImage(null);
        setPreviewUrl(null);
    };

    // Manejar cambio de PDF
    const handlePDFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validar tipo de archivo
            if (file.type !== 'application/pdf') {
                toast.error('Por favor selecciona un archivo PDF válido');
                return;
            }

            // Validar tamaño (máximo 50MB)
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

            // Crear el libro primero (solo con datos básicos)
            const newBook = await createBook(formData);

            // Subir archivos si existen
            const uploadPromises = [];
            let hasCover = false;
            let hasPDF = false;

            if (coverImage && newBook._id) {
                hasCover = true;
                uploadPromises.push(
                    uploadBookCover(newBook._id, coverImage).catch((error) => {
                        console.error('Error al subir portada:', error);
                        throw new Error('cover');
                    })
                );
            }

            if (pdfFile && newBook._id) {
                hasPDF = true;
                uploadPromises.push(
                    uploadBookPDF(newBook._id, pdfFile).catch((error) => {
                        console.error('Error al subir PDF:', error);
                        throw new Error('pdf');
                    })
                );
            }

            // Ejecutar subidas en paralelo
            if (uploadPromises.length > 0) {
                try {
                    await Promise.all(uploadPromises);
                    if (hasCover && hasPDF) {
                        toast.success('Libro, portada y PDF creados exitosamente');
                    } else if (hasCover) {
                        toast.success('Libro y portada creados exitosamente');
                    } else if (hasPDF) {
                        toast.success('Libro y PDF creados exitosamente');
                    }
                } catch (uploadError) {
                    const errorMessage = (uploadError as Error).message;
                    if (errorMessage === 'cover' && errorMessage === 'pdf') {
                        toast.warning('Libro creado, pero hubo errores al subir la portada y el PDF');
                    } else if (errorMessage === 'cover') {
                        toast.warning('Libro creado, pero hubo un error al subir la portada');
                    } else if (errorMessage === 'pdf') {
                        toast.warning('Libro creado, pero hubo un error al subir el PDF');
                    }
                }
            } else {
                toast.success('Libro creado exitosamente');
            }

            navigate('/panel/libros');
        } catch (error) {
            toast.error('Error al crear el libro');
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
                        Crear Nuevo Libro
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Completa la información del libro
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Información del Libro</CardTitle>
                        <CardDescription>
                            Los campos marcados con * son obligatorios
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
                                value={formData.categoryId}
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
                            <Label htmlFor="cover">Portada (opcional)</Label>
                            {!previewUrl ? (
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
                                <div className="relative inline-block">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-40 h-56 object-cover rounded-lg border-2"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon-sm"
                                        className="absolute -top-2 -right-2"
                                        onClick={handleRemoveImage}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* PDF del libro */}
                        <div className="space-y-2">
                            <Label htmlFor="pdf">Archivo PDF (opcional)</Label>
                            {!pdfFile ? (
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
                                {loading ? 'Creando...' : 'Crear Libro'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
};
