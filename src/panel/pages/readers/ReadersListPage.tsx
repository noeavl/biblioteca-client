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
    CheckCircle,
    XCircle,
    BookOpen,
} from 'lucide-react';
import { getReaders, deleteReader } from '@/panel/api/readers.api';
import type { Reader } from '@/library/interfaces/reader.interface';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { Badge } from '@/components/ui/badge';

const ITEMS_PER_PAGE = 8;

export const ReadersListPage = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [readers, setReaders] = useState<Reader[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalReaders, setTotalReaders] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [readerToDelete, setReaderToDelete] = useState<Reader | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Cargar lectores desde la API con paginación
    useEffect(() => {
        const fetchReaders = async () => {
            try {
                setLoading(true);
                setError(null);
                const skip = (currentPage - 1) * ITEMS_PER_PAGE;
                const data = await getReaders({
                    limit: ITEMS_PER_PAGE,
                    skip,
                });
                setReaders(data.readers);
                setTotalPages(data.totalPages);
                setTotalReaders(data.total);
            } catch (err) {
                setError('Error al cargar los lectores');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchReaders();
    }, [currentPage]);

    const currentReaders = readers;

    // Calcular índices para mostrar en la UI
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + readers.length;

    // Manejar eliminación de lector
    const handleDeleteReader = async () => {
        if (!readerToDelete) return;

        try {
            setIsDeleting(true);
            await deleteReader(readerToDelete._id);

            toast.success(
                `Lector ${readerToDelete.user.name} eliminado exitosamente`
            );
            setReaderToDelete(null);

            // Recargar los lectores después de eliminar
            const skip = (currentPage - 1) * ITEMS_PER_PAGE;
            const data = await getReaders({
                limit: ITEMS_PER_PAGE,
                skip,
            });
            setReaders(data.readers);
            setTotalPages(data.totalPages);
            setTotalReaders(data.total);

            // Si la página actual quedó vacía y no es la primera, volver a la anterior
            if (data.readers.length === 0 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        } catch (error: any) {
            console.error('Error al eliminar lector:', error);
            if (error?.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Error al eliminar el lector');
            }
        } finally {
            setIsDeleting(false);
        }
    };

    // Obtener iniciales del nombre
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="flex flex-col gap-6 p-6 w-full max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Lectores
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona los lectores registrados en la biblioteca
                    </p>
                </div>
                <Button onClick={() => navigate('/panel/lectores/crear')}>
                    <Plus />
                    Nuevo Lector
                </Button>
            </div>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Lista de Lectores</CardTitle>
                    <CardDescription>
                        Administra y visualiza todos los lectores registrados
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Lector</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="text-center">
                                        Suscripción
                                    </TableHead>
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
                                                <div className="flex items-center gap-3">
                                                    <Skeleton className="h-10 w-10 rounded-full" />
                                                    <Skeleton className="h-4 w-32" />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-48" />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Skeleton className="h-6 w-24 mx-auto rounded-full" />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Skeleton className="h-6 w-20 mx-auto rounded-full" />
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
                                ) : currentReaders.length === 0 ? (
                                    // Sin resultados
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center h-24"
                                        >
                                            No se encontraron lectores
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    // Lista de lectores
                                    currentReaders.map((reader) => {
                                        return (
                                            <TableRow key={reader._id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarFallback className="bg-blue-500 text-white">
                                                                {getInitials(
                                                                    reader.user
                                                                        .name
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span>
                                                            {reader.user.name}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {reader.user.email}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {reader.suscription ? (
                                                        <Badge
                                                            variant="default"
                                                            className="gap-1"
                                                        >
                                                            <BookOpen className="h-3 w-3" />
                                                            Activa
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="secondary"
                                                            className="gap-1"
                                                        >
                                                            <BookOpen className="h-3 w-3" />
                                                            Inactiva
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {reader.user.status ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full  px-2.5 py-0.5 text-xs font-medium ">
                                                            <CheckCircle className="h-3 w-3" />
                                                            Activo
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium">
                                                            <XCircle className="h-3 w-3" />
                                                            Inactivo
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
                                                                        `/panel/lectores/editar/${reader._id}`
                                                                    )
                                                                }
                                                            >
                                                                <Pencil />
                                                                Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                variant="destructive"
                                                                onClick={() =>
                                                                    setReaderToDelete(
                                                                        reader
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
                            {Math.min(endIndex, totalReaders)} de{' '}
                            {totalReaders} lectores
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
                                                    setCurrentPage(
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
                open={!!readerToDelete}
                onOpenChange={(open) => !open && setReaderToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            ¿Estás seguro de eliminar este lector?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará
                            permanentemente el lector{' '}
                            <span className="font-semibold">
                                {readerToDelete?.user.name}
                            </span>{' '}
                            ({readerToDelete?.user.email}) de la base de datos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteReader}
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
