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
import { Input } from '@/components/ui/input';
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
    Search,
    BookOpen,
} from 'lucide-react';
import { getBooks } from '@/panel/api/books.api';
import type { Book } from '@/library/interfaces/book.interface';
import { Skeleton } from '@/components/ui/skeleton';

const ITEMS_PER_PAGE = 8;

export const BooksListPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [books, setBooks] = useState<Book[]>([]);
    const [totalBooks, setTotalBooks] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Obtener página actual de los query params
    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    // Debounce del término de búsqueda
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // Esperar 500ms después de que el usuario deje de escribir

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Cargar libros desde la API con paginación y búsqueda del lado del servidor
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                setLoading(true);
                setError(null);
                const skip = (currentPage - 1) * ITEMS_PER_PAGE;
                const response = await getBooks({
                    limit: ITEMS_PER_PAGE,
                    skip,
                    search: debouncedSearchTerm || undefined, // Usar el término con debounce
                });
                setBooks(response.books);
                setTotalBooks(response.total);
                setTotalPages(response.totalPages);
            } catch (err) {
                setError('Error al cargar los libros');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, [currentPage, debouncedSearchTerm]);

    // Los libros ya vienen filtrados del servidor
    const currentBooks = books;

    // Calcular índices para mostrar en la UI
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + books.length;

    // Función para cambiar de página
    const handlePageChange = (page: number) => {
        setSearchParams({ page: page.toString() });
    };

    // Resetear a página 1 cuando cambia la búsqueda
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        if (currentPage !== 1) {
            setSearchParams({ page: '1' });
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6 w-full max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Libros
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona los libros de la biblioteca
                    </p>
                </div>
                <Button onClick={() => navigate('/panel/libros/crear')}>
                    <Plus />
                    Nuevo Libro
                </Button>
            </div>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Lista de Libros</CardTitle>
                    <CardDescription>
                        Administra y visualiza todos los libros registrados
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                            <Input
                                placeholder="Buscar libros..."
                                value={searchTerm}
                                onChange={(e) =>
                                    handleSearchChange(e.target.value)
                                }
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">
                                        Portada
                                    </TableHead>
                                    <TableHead>Título</TableHead>
                                    <TableHead>Autor</TableHead>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead className="text-center">
                                        Estado
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
                                                <Skeleton className="h-14 w-10 rounded" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-32" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-32" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-24" />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Skeleton className="h-6 w-16 mx-auto rounded-full" />
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
                                            colSpan={6}
                                            className="text-center h-24 text-destructive"
                                        >
                                            {error}
                                        </TableCell>
                                    </TableRow>
                                ) : currentBooks.length === 0 ? (
                                    // Sin resultados
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center h-24 text-muted-foreground"
                                        >
                                            No se encontraron libros
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    // Lista de libros
                                    currentBooks.map((book) => (
                                        <TableRow key={book._id}>
                                            <TableCell>
                                                <div className="h-14 w-10 overflow-hidden rounded shadow-sm">
                                                    {book.coverImage ? (
                                                        <img
                                                            src={`${
                                                                import.meta.env
                                                                    .VITE_API_URL
                                                            }/files/cover/${
                                                                book.coverImage
                                                            }`}
                                                            alt={book.title}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center">
                                                            <BookOpen className="text-white size-5" />
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {book.title}
                                            </TableCell>
                                            <TableCell>
                                                {book.author.person.firstName}{' '}
                                                {book.author.person.lastName}
                                            </TableCell>
                                            <TableCell className="capitalize">
                                                {book.category.name}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-flex items-center justify-center rounded-full bg-green-100  px-2.5 py-0.5 text-xs font-medium text-green-700 ">
                                                    Activo
                                                </span>
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
                                                        <DropdownMenuItem>
                                                            <BookOpen />
                                                            Ver detalles
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                navigate(
                                                                    `/panel/libros/editar/${book._id}`
                                                                )
                                                            }
                                                        >
                                                            <Pencil />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem variant="destructive">
                                                            <Trash2 />
                                                            Eliminar
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Mostrando {startIndex + 1} a{' '}
                            {Math.min(endIndex, totalBooks)} de {totalBooks}{' '}
                            libros
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
        </div>
    );
};
