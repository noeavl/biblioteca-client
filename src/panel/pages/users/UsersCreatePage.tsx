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
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Eye, EyeOff, User, BookOpen, UserCog, Shield } from 'lucide-react';
import { createUser, getRoles } from '@/panel/api/users.api';
import { createReader } from '@/panel/api/readers.api';
import type { UserRole } from '@/library/interfaces/user.interface';
import { toast } from 'sonner';

interface FormData {
    role: string;
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    status: boolean;
    suscription: boolean;
}

export const UsersCreatePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [loadingData, setLoadingData] = useState<boolean>(true);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

    const [formData, setFormData] = useState<FormData>({
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

    // Cargar roles desde la API
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                setLoadingData(true);
                const rolesData = await getRoles();
                setRoles(rolesData);
            } catch (error: unknown) {
                toast.error('Error al cargar los roles');
                console.error(error);
            } finally {
                setLoadingData(false);
            }
        };

        fetchRoles();
    }, []);

    // Validar fortaleza de contraseña
    const validatePasswordStrength = (password: string): boolean => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        return hasUpperCase && hasLowerCase && hasNumber;
    };

    // Manejar submit
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        // Validaciones base
        if (!formData.role) {
            toast.error('Debe seleccionar un rol');
            return;
        }

        if (!formData.name.trim()) {
            toast.error('El nombre es requerido');
            return;
        }

        if (formData.name.length > 20) {
            toast.error('El nombre no debe superar los 20 caracteres');
            return;
        }

        if (formData.name !== formData.name.toLowerCase()) {
            toast.error('El nombre debe estar en minúsculas');
            return;
        }

        if (!formData.email.trim()) {
            toast.error('El email es requerido');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('El email debe ser válido');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (formData.password.length > 30) {
            toast.error('La contraseña no debe superar los 30 caracteres');
            return;
        }

        if (!validatePasswordStrength(formData.password)) {
            toast.error(
                'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
            );
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        // Validaciones específicas por rol
        const roleName = getSelectedRoleName();

        try {
            setLoading(true);

            // Construir payload base (sin campos específicos de reader)
            const userPayload = {
                role: formData.role,
                name: formData.name,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                status: formData.status,
            };

            // Crear el usuario
            const userResponse = await createUser(userPayload);

            // Si es reader, crear el registro de reader
            if (roleName === 'reader' && userResponse._id) {
                await createReader({
                    user: userResponse._id,
                    suscription: formData.suscription,
                });
            }

            toast.success('Usuario creado exitosamente');
            navigate('/panel/usuarios');
        } catch (error: unknown) {
            console.error('Error al crear usuario:', error);

            // Type guard para verificar si el error tiene la estructura esperada
            if (
                error &&
                typeof error === 'object' &&
                'response' in error &&
                error.response &&
                typeof error.response === 'object' &&
                'data' in error.response &&
                error.response.data &&
                typeof error.response.data === 'object' &&
                'message' in error.response.data
            ) {
                const message = (error.response.data as { message: string | string[] }).message;
                if (Array.isArray(message)) {
                    message.forEach((msg: string) => toast.error(msg));
                } else {
                    toast.error(message);
                }
            } else {
                toast.error('Error al crear el usuario');
            }
        } finally {
            setLoading(false);
        }
    };

    // Obtener icono según el rol
    const getRoleIcon = (roleName: string): React.JSX.Element => {
        switch (roleName) {
            case 'admin':
                return <Shield className="h-5 w-5" />;
            case 'reader':
                return <BookOpen className="h-5 w-5" />;
            case 'librarian':
                return <UserCog className="h-5 w-5" />;
            case 'executive':
                return <User className="h-5 w-5" />;
            default:
                return <User className="h-5 w-5" />;
        }
    };

    // Obtener label del rol
    const getRoleLabel = (roleName: string): string => {
        switch (roleName) {
            case 'admin':
                return 'Administador';
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
                        Crear Nuevo Usuario
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Completa la información del usuario según su rol
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sección 1: Selección de Rol */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tipo de Usuario</CardTitle>
                        <CardDescription>
                            Selecciona el rol que tendrá el usuario en el sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {roles.map((role) => (
                                <button
                                    key={role._id}
                                    type="button"
                                    onClick={() =>
                                        setFormData({ ...formData, role: role._id })
                                    }
                                    className={`
                                        p-4 border-2 rounded-lg transition-all duration-200
                                        hover:shadow-md hover:scale-105
                                        ${
                                            formData.role === role._id
                                                ? 'border-primary bg-primary/5 shadow-md'
                                                : 'border-border hover:border-primary/50'
                                        }
                                    `}
                                >
                                    <div className="flex flex-col items-center gap-2 text-center">
                                        <div
                                            className={`
                                                p-2 rounded-full
                                                ${
                                                    formData.role === role._id
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'bg-muted text-muted-foreground'
                                                }
                                            `}
                                        >
                                            {getRoleIcon(role.name)}
                                        </div>
                                        <span className="font-medium text-sm">
                                            {getRoleLabel(role.name)}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Sección 2: Datos de Acceso (siempre visible) */}
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
                                Nombre de Usuario{' '}
                                <span className="text-destructive">*</span>
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
                                required
                                maxLength={20}
                            />
                            <p className="text-xs text-muted-foreground">
                                Debe estar en minúsculas. Máximo 20 caracteres (
                                {formData.name.length}/20)
                            </p>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Email{' '}
                                <span className="text-destructive">*</span>
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
                                required
                            />
                        </div>

                        {/* Contraseña */}
                        <div className="space-y-2">
                            <Label htmlFor="password">
                                Contraseña{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Ingrese la contraseña"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            password: e.target.value,
                                        })
                                    }
                                    required
                                    minLength={6}
                                    maxLength={30}
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="absolute right-2 top-1/2 -translate-y-1/2"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Debe tener entre 6 y 30 caracteres, incluir al
                                menos una mayúscula, una minúscula y un número
                            </p>
                        </div>

                        {/* Confirmar Contraseña */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">
                                Confirmar Contraseña{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    placeholder="Confirme la contraseña"
                                    value={formData.confirmPassword}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            confirmPassword: e.target.value,
                                        })
                                    }
                                    required
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="absolute right-2 top-1/2 -translate-y-1/2"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

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
                {(selectedRoleName === 'admin' || selectedRoleName === 'librarian' || selectedRoleName === 'executive') && formData.role && (
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
                        disabled={loading || !formData.role}
                        className="flex-1"
                    >
                        {loading ? 'Creando...' : 'Crear Usuario'}
                    </Button>
                </div>
            </form>
        </div>
    );
};
