import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { MoreHorizontal, Plus, Pencil, Trash2, Search } from "lucide-react";
import { getAuthors, deleteAuthor } from "@/panel/api/authors.api";
import type { Author } from "@/library/interfaces/author.interface";
import { Skeleton } from "@/components/ui/skeleton";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 8;

export const AuthorsPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [authorToDelete, setAuthorToDelete] = useState<Author | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Cargar autores desde la API
    useEffect(() => {
        const fetchAuthors = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getAuthors();
                setAuthors(data.authors);
            } catch (err) {
                setError("Error al cargar los autores");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAuthors();
    }, []);

    // Función para generar iniciales
    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`;
    };

    // Filtrar autores por término de búsqueda
    const filteredAuthors = authors.filter((author) => {
        const fullName =
            `${author.person.firstName} ${author.person.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
    });

    // Calcular paginación
    const totalPages = Math.ceil(filteredAuthors.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentAuthors = filteredAuthors.slice(startIndex, endIndex);

    // Resetear a página 1 cuando cambia la búsqueda
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    // Manejar eliminación de autor
    const handleDeleteAuthor = async () => {
        if (!authorToDelete) return;

        try {
            setIsDeleting(true);
            await deleteAuthor(authorToDelete._id);

            // Actualizar la lista de autores
            setAuthors(authors.filter(author => author._id !== authorToDelete._id));

            toast.success(`Autor ${authorToDelete.person.firstName} ${authorToDelete.person.lastName} eliminado exitosamente`);
            setAuthorToDelete(null);
        } catch (error: any) {
            console.error('Error al eliminar autor:', error);
            if (error?.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Error al eliminar el autor');
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
                        Autores
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona los autores de la biblioteca
                    </p>
                </div>
                <Button onClick={() => navigate('/panel/autores/crear')}>
                    <Plus />
                    Nuevo Autor
                </Button>
            </div>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Lista de Autores</CardTitle>
                    <CardDescription>
                        Administra y visualiza todos los autores registrados
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                            <Input
                                placeholder="Buscar autores..."
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
                                        Avatar
                                    </TableHead>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Apellido</TableHead>
                                    <TableHead className="text-center">
                                        Libros
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
                                                <Skeleton className="h-10 w-10 rounded-full" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-32" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-32" />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Skeleton className="h-6 w-8 mx-auto rounded-full" />
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
                                            colSpan={5}
                                            className="text-center h-24 text-destructive"
                                        >
                                            {error}
                                        </TableCell>
                                    </TableRow>
                                ) : currentAuthors.length === 0 ? (
                                    // Sin resultados
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center h-24 text-muted-foreground"
                                        >
                                            No se encontraron autores
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    // Lista de autores
                                    currentAuthors.map((author) => (
                                        <TableRow key={author._id}>
                                            <TableCell>
                                                <div className="h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-purple-500 dark:from-blue-600 dark:to-purple-700 flex items-center justify-center">
                                                    {author.fileName ? (
                                                        <img
                                                            alt={`${author.person.firstName} ${author.person.lastName}`}
                                                            className="h-full w-full object-cover"
                                                            src={`${import.meta.env.VITE_API_URL}/files/author/${author.fileName}`}
                                                        />
                                                    ) : (
                                                        <span className="text-sm font-bold text-white">
                                                            {getInitials(
                                                                author.person
                                                                    .firstName,
                                                                author.person
                                                                    .lastName
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {author.person.firstName}
                                            </TableCell>
                                            <TableCell>
                                                {author.person.lastName}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
                                                    {author.books.length}
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
                                                        <DropdownMenuItem
                                                            onClick={() => navigate(`/panel/autores/editar/${author._id}`)}
                                                        >
                                                            <Pencil />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            variant="destructive"
                                                            onClick={() => setAuthorToDelete(author)}
                                                        >
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
                            Mostrando {startIndex + 1} a{" "}
                            {Math.min(endIndex, filteredAuthors.length)} de{" "}
                            {filteredAuthors.length} autores
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
                                                    setCurrentPage(
                                                        currentPage - 1
                                                    );
                                                }
                                            }}
                                            className={
                                                currentPage === 1
                                                    ? "pointer-events-none opacity-50"
                                                    : ""
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
                                                            setCurrentPage(
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
                                                <PaginationItem key={pageNumber}>
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
                                                    setCurrentPage(
                                                        currentPage + 1
                                                    );
                                                }
                                            }}
                                            className={
                                                currentPage === totalPages
                                                    ? "pointer-events-none opacity-50"
                                                    : ""
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
            <AlertDialog open={!!authorToDelete} onOpenChange={(open) => !open && setAuthorToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro de eliminar este autor?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el autor{' '}
                            <span className="font-semibold">
                                {authorToDelete?.person.firstName} {authorToDelete?.person.lastName}
                            </span>{' '}
                            de la base de datos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteAuthor}
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
