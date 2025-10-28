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
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { createUser, getRoles } from '@/panel/api/users.api';
import type { UserRole } from '@/library/interfaces/user.interface';
import { toast } from 'sonner';

export const UsersCreatePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        role: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        status: true,
    });

    // Cargar roles desde la API
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                setLoadingData(true);
                const rolesData = await getRoles();
                setRoles(rolesData);
            } catch (error) {
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
        // Al menos una mayúscula, una minúscula, un número
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        return hasUpperCase && hasLowerCase && hasNumber;
    };

    // Manejar submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validaciones
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

        try {
            setLoading(true);
            await createUser(formData);
            toast.success('Usuario creado exitosamente');
            navigate('/panel/usuarios');
        } catch (error: any) {
            console.error('Error al crear usuario:', error);
            if (error?.response?.data?.message) {
                const message = error.response.data.message;
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
                    onClick={() => navigate('/panel/usuarios')}
                >
                    <ArrowLeft />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Crear Nuevo Usuario
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Completa la información del usuario
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Información del Usuario</CardTitle>
                        <CardDescription>
                            Los campos marcados con * son obligatorios
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

                        {/* Rol */}
                        <div className="space-y-2">
                            <Label htmlFor="role">
                                Rol <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, role: value })
                                }
                                required
                            >
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Selecciona un rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem
                                            key={role._id}
                                            value={role._id}
                                        >
                                            <span className="capitalize">
                                                {role.name === 'admin' &&
                                                    'Administrador'}
                                                {role.name === 'librarian' &&
                                                    'Bibliotecario'}
                                                {role.name === 'executive' &&
                                                    'Ejecutivo'}
                                                {role.name === 'reader' &&
                                                    'Lector'}
                                                {![
                                                    'admin',
                                                    'librarian',
                                                    'executive',
                                                    'reader',
                                                ].includes(role.name) &&
                                                    role.name}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                {loading ? 'Creando...' : 'Crear Usuario'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
};
