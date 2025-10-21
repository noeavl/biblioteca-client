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
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { getUserById, updateUser, getRoles } from '@/panel/api/users.api';
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

    const [formData, setFormData] = useState({
        role: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        status: true,
    });

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

                setFormData({
                    role: userData.role._id,
                    name: userData.name,
                    email: userData.email,
                    password: '',
                    confirmPassword: '',
                    status: userData.status,
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
        // Al menos una mayúscula, una minúscula, un número
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
            await updateUser(userId, formData);
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
                        Editar Usuario
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Modifica la información del usuario
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Información del Usuario</CardTitle>
                        <CardDescription>
                            Todos los campos son opcionales. Solo se actualizarán los campos modificados
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

                        {/* Rol */}
                        <div className="space-y-2">
                            <Label htmlFor="role">
                                Rol
                            </Label>
                            <Select
                                value={formData.role || undefined}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, role: value })
                                }
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
                                                {role.name === 'admin' && 'Administrador'}
                                                {role.name === 'librarian' && 'Bibliotecario'}
                                                {role.name === 'executive' && 'Ejecutivo'}
                                                {role.name === 'reader' && 'Lector'}
                                                {!['admin', 'librarian', 'executive', 'reader'].includes(role.name) && role.name}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                    </CardContent>
                </Card>
            </form>
        </div>
    );
};
