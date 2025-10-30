import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    MoreHorizontal,
    Plus,
    Pencil,
    Trash2,
    BookOpen,
} from 'lucide-react';
import { getCategories, deleteCategory } from '@/panel/api/categories.api';
import type { BookCategory } from '@/library/interfaces/book.interface';
import { Skeleton } from '@/components/ui/skeleton';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 8;

export const CategoriesListPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [categories, setCategories] = useState<BookCategory[]>([]);
    const [totalCategories, setTotalCategories] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categoryToDelete, setCategoryToDelete] =
        useState<BookCategory | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Obtener página actual de los query params
    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    // Cargar categorías desde la API con paginación
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                setError(null);
                const skip = (currentPage - 1) * ITEMS_PER_PAGE;
                const response = await getCategories({
                    limit: ITEMS_PER_PAGE,
                    skip,
                });
                setCategories(response.categories);
                setTotalCategories(response.total);
                setTotalPages(response.totalPages);
            } catch (err) {
                setError('Error al cargar las categorías');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [currentPage]);

    // Calcular índices para mostrar en la UI
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + categories.length;
    const currentCategories = categories;

    // Función para cambiar de página
    const handlePageChange = (page: number) => {
        setSearchParams({ page: page.toString() });
    };

    // Manejar eliminación de categoría
    const handleDeleteCategory = async () => {
        if (!categoryToDelete) return;

        try {
            setIsDeleting(true);
            await deleteCategory(categoryToDelete._id);

            // Actualizar la lista de categorías
            setCategories(
                categories.filter(
                    (category) => category._id !== categoryToDelete._id
                )
            );

            toast.success(
                `Categoría "${categoryToDelete.name}" eliminada exitosamente`
            );
            setCategoryToDelete(null);
        } catch (error: any) {
            console.error('Error al eliminar categoría:', error);
            if (error?.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Error al eliminar la categoría');
            }
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6 w-full max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Categorías
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona las categorías de la biblioteca
                    </p>
                </div>
                <Button onClick={() => navigate('/panel/categorias/crear')}>
                    <Plus />
                    Nueva Categoría
                </Button>
            </div>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Lista de Categorías</CardTitle>
                    <CardDescription>
                        Administra y visualiza todas las categorías registradas
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead className="text-center">
                                        Libros
                                    </TableHead>
                                    <TableHead className="text-center">
                                        Portada Destacada
                                    </TableHead>
                                    <TableHead className="w-[80px] text-right">
                                        Acciones
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    // Estado de carga con skeleton
                                    [...Array(5)].map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Skeleton className="h-4 w-32" />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Skeleton className="h-6 w-8 mx-auto rounded-full" />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Skeleton className="h-4 w-16 mx-auto" />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Skeleton className="h-8 w-8 ml-auto" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : error ? (
                                    // Estado de error
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-center h-24 text-destructive"
                                        >
                                            {error}
                                        </TableCell>
                                    </TableRow>
                                ) : currentCategories.length === 0 ? (
                                    // Sin resultados
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-center h-24 text-muted-foreground"
                                        >
                                            No se encontraron categorías
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    // Lista de categorías
                                    currentCategories.map((category) => {
                                        const coverUrl =
                                            category.featuredBookCover
                                                ? `${
                                                      import.meta.env
                                                          .VITE_API_URL
                                                  }/files/cover/${
                                                      category.featuredBookCover
                                                  }`
                                                : null;

                                        return (
                                            <TableRow key={category._id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        {coverUrl ? (
                                                            <img
                                                                src={coverUrl}
                                                                alt={
                                                                    category.name
                                                                }
                                                                className="h-12 w-9 object-cover rounded shadow-sm"
                                                            />
                                                        ) : (
                                                            <div className="h-12 w-9 rounded bg-blue-500 flex items-center justify-center">
                                                                <BookOpen className="h-5 w-5 text-white" />
                                                            </div>
                                                        )}
                                                        <span className="capitalize">
                                                            {category.name}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                                        {category.books
                                                            ?.length || 0}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {category.featuredBookCover ? (
                                                        <span className="text-xs text-green-600 font-medium">
                                                            Sí
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            No
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon-sm"
                                                            >
                                                                <MoreHorizontal />
                                                                <span className="sr-only">
                                                                    Abrir menú
                                                                </span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>
                                                                Acciones
                                                            </DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/panel/categorias/editar/${category._id}`
                                                                    )
                                                                }
                                                            >
                                                                <Pencil />
                                                                Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                variant="destructive"
                                                                onClick={() =>
                                                                    setCategoryToDelete(
                                                                        category
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 />
                                                                Eliminar
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Mostrando {startIndex + 1} a{' '}
                            {Math.min(endIndex, totalCategories)} de{' '}
                            {totalCategories} categorías
                        </p>

                        {totalPages > 1 && (
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (currentPage > 1) {
                                                    handlePageChange(
                                                        currentPage - 1
                                                    );
                                                }
                                            }}
                                            className={
                                                currentPage === 1
                                                    ? 'pointer-events-none opacity-50'
                                                    : ''
                                            }
                                        />
                                    </PaginationItem>

                                    {[...Array(totalPages)].map((_, index) => {
                                        const pageNumber = index + 1;
                                        // Mostrar solo algunas páginas alrededor de la actual
                                        if (
                                            pageNumber === 1 ||
                                            pageNumber === totalPages ||
                                            (pageNumber >= currentPage - 1 &&
                                                pageNumber <= currentPage + 1)
                                        ) {
                                            return (
                                                <PaginationItem
                                                    key={pageNumber}
                                                >
                                                    <PaginationLink
                                                        href="#"
                                                        isActive={
                                                            currentPage ===
                                                            pageNumber
                                                        }
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handlePageChange(
                                                                pageNumber
                                                            );
                                                        }}
                                                    >
                                                        {pageNumber}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            );
                                        } else if (
                                            pageNumber === currentPage - 2 ||
                                            pageNumber === currentPage + 2
                                        ) {
                                            return (
                                                <PaginationItem
                                                    key={pageNumber}
                                                >
                                                    <PaginationEllipsis />
                                                </PaginationItem>
                                            );
                                        }
                                        return null;
                                    })}

                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (currentPage < totalPages) {
                                                    handlePageChange(
                                                        currentPage + 1
                                                    );
                                                }
                                            }}
                                            className={
                                                currentPage === totalPages
                                                    ? 'pointer-events-none opacity-50'
                                                    : ''
                                            }
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* AlertDialog para confirmar eliminación */}
            <AlertDialog
                open={!!categoryToDelete}
                onOpenChange={(open) => !open && setCategoryToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            ¿Estás seguro de eliminar esta categoría?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará
                            permanentemente la categoría{' '}
                            <span className="font-semibold capitalize">
                                "{categoryToDelete?.name}"
                            </span>{' '}
                            de la base de datos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteCategory}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
