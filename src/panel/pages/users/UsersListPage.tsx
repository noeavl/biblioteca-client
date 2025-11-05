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
    Shield,
    BookOpen,
    UserCog,
    User as UserIcon,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import { getUsers, deleteUser } from '@/panel/api/users.api';
import type { User } from '@/library/interfaces/user.interface';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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

// Mapeo de roles a configuración
const roleConfig: Record<
    string,
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }
> = {
    admin: {
        label: 'Administrador',
        variant: 'destructive',
        icon: Shield,
    },
    librarian: {
        label: 'Bibliotecario',
        variant: 'secondary',
        icon: UserCog,
    },
    executive: {
        label: 'Ejecutivo',
        variant: 'outline',
        icon: UserIcon,
    },
    reader: {
        label: 'Lector',
        variant: 'default',
        icon: BookOpen,
    },
};

export const UsersListPage = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [users, setUsers] = useState<User[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Cargar usuarios desde la API con paginación
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null);
                const skip = (currentPage - 1) * ITEMS_PER_PAGE;
                const data = await getUsers({
                    limit: ITEMS_PER_PAGE,
                    skip,
                });
                setUsers(data.users);
                setTotalPages(data.totalPages);
                setTotalUsers(data.total);
            } catch (err) {
                setError('Error al cargar los usuarios');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [currentPage]);

    const currentUsers = users;

    // Calcular índices para mostrar en la UI
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + users.length;

    // Manejar eliminación de usuario
    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            setIsDeleting(true);
            await deleteUser(userToDelete._id);

            toast.success(
                `Usuario ${userToDelete.name} eliminado exitosamente`
            );
            setUserToDelete(null);

            // Recargar los usuarios después de eliminar
            const skip = (currentPage - 1) * ITEMS_PER_PAGE;
            const data = await getUsers({
                limit: ITEMS_PER_PAGE,
                skip,
            });
            setUsers(data.users);
            setTotalPages(data.totalPages);
            setTotalUsers(data.total);

            // Si la página actual quedó vacía y no es la primera, volver a la anterior
            if (data.users.length === 0 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        } catch (error: any) {
            console.error('Error al eliminar usuario:', error);
            if (error?.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Error al eliminar el usuario');
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

    // Obtener configuración de rol
    const getRoleConfig = (roleName: string) => {
        return (
            roleConfig[roleName] || {
                label: roleName,
                variant: 'outline' as const,
                icon: UserIcon,
            }
        );
    };

    return (
        <div className="flex flex-col gap-6 p-6 w-full max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Usuarios
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona los usuarios del sistema
                    </p>
                </div>
                <Button onClick={() => navigate('/panel/usuarios/crear')}>
                    <Plus />
                    Nuevo Usuario
                </Button>
            </div>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Lista de Usuarios</CardTitle>
                    <CardDescription>
                        Administra y visualiza todos los usuarios registrados
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="text-center">
                                        Rol
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
                                ) : currentUsers.length === 0 ? (
                                    // Sin resultados
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center h-24"
                                        >
                                            No se encontraron usuarios
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    // Lista de usuarios
                                    currentUsers.map((user) => {
                                        const roleInfo = getRoleConfig(
                                            user.role.name
                                        );

                                        return (
                                            <TableRow key={user._id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarFallback className="bg-blue-500 text-white">
                                                                {getInitials(
                                                                    user.name
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span>
                                                            {user.name}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {user.email}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant={roleInfo.variant} className="gap-1">
                                                        <roleInfo.icon className="h-3 w-3" />
                                                        {roleInfo.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {user.status ? (
                                                        <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Activo
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="gap-1">
                                                            <XCircle className="h-3 w-3" />
                                                            Inactivo
                                                        </Badge>
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
                                                                        `/panel/usuarios/editar/${user._id}`
                                                                    )
                                                                }
                                                            >
                                                                <Pencil />
                                                                Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                variant="destructive"
                                                                onClick={() =>
                                                                    setUserToDelete(
                                                                        user
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
                            {Math.min(endIndex, totalUsers)} de {totalUsers}{' '}
                            usuarios
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
                open={!!userToDelete}
                onOpenChange={(open) => !open && setUserToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            ¿Estás seguro de eliminar este usuario?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará
                            permanentemente el usuario{' '}
                            <span className="font-semibold">
                                {userToDelete?.name}
                            </span>{' '}
                            ({userToDelete?.email}) de la base de datos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteUser}
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
