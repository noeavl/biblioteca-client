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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Eye, EyeOff, User, BookOpen, UserCog, Shield } from 'lucide-react';
import { getUserById, updateUser, getRoles } from '@/panel/api/users.api';
import { updateReader, getReaderByUserId } from '@/panel/api/readers.api';
import type { UserRole } from '@/library/interfaces/user.interface';
import { toast } from 'sonner';

export const UsersEditPage = () => {
    const navigate = useNavigate();
    const { user: userId } = useParams<{ user: string }>();
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [readerId, setReaderId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        role: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        status: true,
        // Campos específicos para reader
        suscription: false,
    });

    // Obtener el nombre del rol seleccionado
    const getSelectedRoleName = (): string => {
        const selectedRole = roles.find(r => r._id === formData.role);
        return selectedRole?.name || '';
    };

    // Cargar usuario y roles
    useEffect(() => {
        const fetchData = async () => {
            if (!userId) {
                toast.error('ID de usuario no válido');
                navigate('/panel/usuarios');
                return;
            }

            try {
                setLoadingData(true);
                const [userData, rolesData] = await Promise.all([
                    getUserById(userId),
                    getRoles(),
                ]);

                // Si el usuario es un lector, cargar sus datos específicos
                let readerData = null;
                if (userData.role.name === 'reader') {
                    try {
                        readerData = await getReaderByUserId(userId);
                        setReaderId(readerData._id);
                    } catch (error) {
                        console.error('Error al cargar datos del reader:', error);
                    }
                }

                setFormData({
                    role: userData.role._id,
                    name: userData.name,
                    email: userData.email,
                    password: '',
                    confirmPassword: '',
                    status: userData.status,
                    // Cargar campos específicos del reader si existen
                    suscription: readerData?.suscription || false,
                });
                setRoles(rolesData);
            } catch (error) {
                toast.error('Error al cargar los datos del usuario');
                console.error(error);
                navigate('/panel/usuarios');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [userId, navigate]);

    // Validar fortaleza de contraseña
    const validatePasswordStrength = (password: string): boolean => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        return hasUpperCase && hasLowerCase && hasNumber;
    };

    // Manejar submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId) return;

        // Validaciones solo para campos que se están modificando
        if (formData.name.trim() && formData.name.length > 20) {
            toast.error('El nombre no debe superar los 20 caracteres');
            return;
        }

        if (formData.name.trim() && formData.name !== formData.name.toLowerCase()) {
            toast.error('El nombre debe estar en minúsculas');
            return;
        }

        if (formData.email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                toast.error('El email debe ser válido');
                return;
            }
        }

        // Validar contraseña solo si se está cambiando
        if (formData.password) {
            if (formData.password.length < 6) {
                toast.error('La contraseña debe tener al menos 6 caracteres');
                return;
            }

            if (formData.password.length > 30) {
                toast.error('La contraseña no debe superar los 30 caracteres');
                return;
            }

            if (!validatePasswordStrength(formData.password)) {
                toast.error('La contraseña debe contener al menos una mayúscula, una minúscula y un número');
                return;
            }

            if (formData.password !== formData.confirmPassword) {
                toast.error('Las contraseñas no coinciden');
                return;
            }
        }

        try {
            setLoading(true);

            const roleName = getSelectedRoleName();

            // Construir payload del usuario (sin campos específicos de reader)
            const userPayload = {
                name: formData.name,
                email: formData.email,
                status: formData.status,
                ...(formData.password && { password: formData.password }),
            };

            // Actualizar el usuario
            await updateUser(userId, userPayload);

            // Si es reader y tenemos el readerId, actualizar los datos específicos del reader
            if (roleName === 'reader' && readerId) {
                await updateReader(readerId, {
                    suscription: formData.suscription,
                });
            }

            toast.success('Usuario actualizado exitosamente');
            navigate('/panel/usuarios');
        } catch (error: any) {
            console.error('Error al actualizar usuario:', error);
            if (error?.response?.data?.message) {
                const message = error.response.data.message;
                if (Array.isArray(message)) {
                    message.forEach((msg: string) => toast.error(msg));
                } else {
                    toast.error(message);
                }
            } else {
                toast.error('Error al actualizar el usuario');
            }
        } finally {
            setLoading(false);
        }
    };

    // Obtener icono según el rol
    const getRoleIcon = (roleName: string) => {
        switch (roleName) {
            case 'admin':
                return <Shield className="h-4 w-4" />;
            case 'reader':
                return <BookOpen className="h-4 w-4" />;
            case 'librarian':
                return <UserCog className="h-4 w-4" />;
            case 'executive':
                return <User className="h-4 w-4" />;
            default:
                return <User className="h-4 w-4" />;
        }
    };

    // Obtener label del rol
    const getRoleLabel = (roleName: string) => {
        switch (roleName) {
            case 'admin':
                return 'Administrador';
            case 'reader':
                return 'Lector';
            case 'librarian':
                return 'Bibliotecario';
            case 'executive':
                return 'Ejecutivo';
            default:
                return roleName;
        }
    };

    // Obtener color del badge según el rol
    const getRoleBadgeVariant = (roleName: string) => {
        switch (roleName) {
            case 'admin':
                return 'destructive';
            case 'reader':
                return 'default';
            case 'librarian':
                return 'secondary';
            case 'executive':
                return 'outline';
            default:
                return 'outline';
        }
    };

    if (loadingData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const selectedRoleName = getSelectedRoleName();

    return (
        <div className="flex flex-col gap-6 p-6 w-full max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/panel/usuarios')}
                >
                    <ArrowLeft />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Editar Usuario
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Modifica la información del usuario
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sección 1: Tipo de Usuario (NO EDITABLE) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tipo de Usuario</CardTitle>
                        <CardDescription>
                            El rol del usuario no puede ser modificado
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                            <div className="p-3 rounded-full bg-background">
                                {getRoleIcon(selectedRoleName)}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">{getRoleLabel(selectedRoleName)}</p>
                                <p className="text-sm text-muted-foreground">
                                    Rol asignado al usuario
                                </p>
                            </div>
                            <Badge variant={getRoleBadgeVariant(selectedRoleName)}>
                                {getRoleLabel(selectedRoleName)}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Sección 2: Datos de Acceso */}
                <Card>
                    <CardHeader>
                        <CardTitle>Datos de Acceso</CardTitle>
                        <CardDescription>
                            Información básica para iniciar sesión
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Nombre */}
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Nombre de Usuario
                            </Label>
                            <Input
                                id="name"
                                placeholder="Ej: juanperez"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                maxLength={20}
                            />
                            <p className="text-xs text-muted-foreground">
                                Debe estar en minúsculas. Máximo 20 caracteres ({formData.name.length}/20)
                            </p>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Ej: usuario@ejemplo.com"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                            />
                        </div>

                        {/* Contraseña */}
                        <div className="space-y-2">
                            <Label htmlFor="password">
                                Nueva Contraseña
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Dejar vacío para mantener la actual"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            password: e.target.value,
                                        })
                                    }
                                    minLength={6}
                                    maxLength={30}
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="absolute right-2 top-1/2 -translate-y-1/2"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Solo completar si desea cambiar la contraseña. Debe tener entre 6 y 30 caracteres, incluir al menos una mayúscula, una minúscula y un número
                            </p>
                        </div>

                        {/* Confirmar Contraseña */}
                        {formData.password && (
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">
                                    Confirmar Nueva Contraseña
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Confirme la nueva contraseña"
                                        value={formData.confirmPassword}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                confirmPassword: e.target.value,
                                            })
                                        }
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        className="absolute right-2 top-1/2 -translate-y-1/2"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Estado */}
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="status" className="text-base">
                                    Estado del Usuario
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {formData.status
                                        ? 'El usuario podrá acceder al sistema'
                                        : 'El usuario no podrá acceder al sistema'}
                                </p>
                            </div>
                            <Switch
                                id="status"
                                checked={formData.status}
                                onCheckedChange={(checked) =>
                                    setFormData({
                                        ...formData,
                                        status: checked,
                                    })
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Sección 3: Datos Específicos del LECTOR */}
                {selectedRoleName === 'reader' && (
                    <Card className="border-muted animate-in fade-in-50 duration-300">
                        <CardHeader>
                            <CardTitle>Datos del Lector</CardTitle>
                            <CardDescription>
                                Información específica para el lector
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Suscripción */}
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="suscription" className="text-base">
                                        Suscripción
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {formData.suscription
                                            ? 'El lector tiene una suscripción activa'
                                            : 'El lector no tiene suscripción activa'}
                                    </p>
                                </div>
                                <Switch
                                    id="suscription"
                                    checked={formData.suscription}
                                    onCheckedChange={(checked) =>
                                        setFormData({
                                            ...formData,
                                            suscription: checked,
                                        })
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Sección 3: Sin datos adicionales para ADMIN, LIBRARIAN o EXECUTIVE */}
                {(selectedRoleName === 'admin' || selectedRoleName === 'librarian' || selectedRoleName === 'executive') && (
                    <Card className="border-muted animate-in fade-in-50 duration-300">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <div className="p-2 rounded-full bg-muted">
                                    {getRoleIcon(selectedRoleName)}
                                </div>
                                <p className="text-sm">
                                    {selectedRoleName === 'admin'
                                        ? 'Los administradores tienen acceso completo al sistema y solo requieren datos de acceso básicos.'
                                        : selectedRoleName === 'librarian'
                                        ? 'Los bibliotecarios pueden gestionar libros, categorías y usuarios. Solo requieren datos de acceso básicos.'
                                        : 'Los ejecutivos tienen permisos especiales y solo requieren datos de acceso básicos.'
                                    }
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Botones */}
                <div className="flex gap-4 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/panel/usuarios')}
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
                        {loading ? 'Actualizando...' : 'Actualizar Usuario'}
                    </Button>
                </div>
            </form>
        </div>
    );
};
