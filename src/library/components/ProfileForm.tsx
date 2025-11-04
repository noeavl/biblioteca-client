import { useAuth } from '@/auth/hooks/useAuth';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState, useEffect } from 'react';
import { updateProfile } from '../api/profile.api';
import { getMe } from '@/auth/api/auth.api';
import { toast } from 'sonner';

interface ValidationErrors {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
}

export const ProfileForm = () => {
    const { user, updateUser, logout } = useAuth();

    // Estados del formulario
    const [name, setName] = useState<string>(user?.name || '');
    const [email, setEmail] = useState<string>(user?.email || '');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [status, setStatus] = useState<boolean>(user?.status ?? true);

    // Estados de UI
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [showStatusDialog, setShowStatusDialog] = useState<boolean>(false);
    const [pendingStatusChange, setPendingStatusChange] = useState<boolean | null>(null);
    const [showSuccessAlert, setShowSuccessAlert] = useState<boolean>(false);

    // Validación
    const [errors, setErrors] = useState<ValidationErrors>({});

    // Fetch fresh user data from auth/me on mount
    useEffect(() => {
        let isMounted = true;

        const fetchUserData = async (): Promise<void> => {
            try {
                setIsLoading(true);
                const freshUserData = await getMe();

                if (isMounted) {
                    updateUser(freshUserData);
                    setName(freshUserData.name);
                    setEmail(freshUserData.email);
                    setStatus(freshUserData.status);
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Error al cargar datos del usuario:', error);
                    toast.error('Error al cargar los datos del perfil');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchUserData();

        return () => {
            isMounted = false;
        };
    }, []); // Empty dependency array - only run once on mount

    if (isLoading || !user) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        // Validar nombre
        if (!name.trim()) {
            newErrors.name = 'El nombre de usuario es requerido';
        } else if (name.trim().length < 3) {
            newErrors.name = 'El nombre debe tener al menos 3 caracteres';
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            newErrors.email = 'El email es requerido';
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'El email no es válido';
        }

        // Validar contraseña (solo si se está cambiando)
        if (password) {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

            if (password.length < 6) {
                newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
            } else if (!passwordRegex.test(password)) {
                newErrors.password = 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)';
            }

            if (password !== confirmPassword) {
                newErrors.confirmPassword = 'Las contraseñas no coinciden';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleStatusChange = (newStatus: boolean): void => {
        if (!newStatus) {
            // Si intenta desactivar, mostrar advertencia
            setPendingStatusChange(newStatus);
            setShowStatusDialog(true);
        } else {
            // Si activa, aplicar directamente
            setStatus(newStatus);
        }
    };

    const confirmStatusChange = (): void => {
        if (pendingStatusChange !== null) {
            setStatus(pendingStatusChange);
            setPendingStatusChange(null);
        }
        setShowStatusDialog(false);
    };

    const cancelStatusChange = (): void => {
        setPendingStatusChange(null);
        setShowStatusDialog(false);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Por favor, corrige los errores en el formulario');
            return;
        }

        try {
            setIsSubmitting(true);

            // Solo enviar campos que cambiaron (PATCH semántico)
            const updateData: {
                name?: string;
                email?: string;
                status?: boolean;
                password?: string;
                confirmPassword?: string;
            } = {};

            // Comparar con valores originales del usuario
            if (name.trim() !== user.name) {
                updateData.name = name.trim();
            }

            if (email.trim() !== user.email) {
                updateData.email = email.trim();
            }

            if (status !== user.status) {
                updateData.status = status;
            }

            // Solo incluir contraseña si se ingresó una nueva
            if (password) {
                updateData.password = password;
                updateData.confirmPassword = confirmPassword;
            }

            // Si no hay cambios, no hacer la petición
            if (Object.keys(updateData).length === 0) {
                toast.info('No hay cambios para guardar');
                setIsSubmitting(false);
                return;
            }

            await updateProfile(updateData);

            // Obtener datos actualizados completos del usuario desde /auth/me
            const freshUserData = await getMe();
            updateUser(freshUserData);

            // Actualizar estados locales con datos frescos
            setName(freshUserData.name);
            setEmail(freshUserData.email);
            setStatus(freshUserData.status);

            // Limpiar contraseñas después de actualizar
            setPassword('');
            setConfirmPassword('');

            // Mostrar alerta de éxito
            setShowSuccessAlert(true);
            toast.success('Perfil actualizado correctamente');

            // Ocultar alerta después de 5 segundos
            setTimeout(() => {
                setShowSuccessAlert(false);
            }, 5000);

            // Si desactivó la cuenta, cerrar sesión
            if (!status) {
                toast.info('Cerrando sesión...');
                setTimeout(() => {
                    logout();
                    window.location.href = '/iniciar-sesion';
                }, 2000);
            }
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            const err = error as ApiError;
            if (err.response?.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error('Error al actualizar el perfil');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const hasChanges = (): boolean => {
        return (
            name !== user.name ||
            email !== user.email ||
            status !== user.status ||
            password !== '' ||
            confirmPassword !== ''
        );
    };

    return (
        <>
            {/* Alerta de éxito */}
            {showSuccessAlert && (
                <Alert className="mb-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <AlertDescription>
                        Tu perfil ha sido actualizado correctamente.
                    </AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Información de la Cuenta</CardTitle>
                        <CardDescription>
                            Actualiza tu información personal y configuración de cuenta
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Información Básica */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Información Personal</h3>

                            {/* Nombre de usuario */}
                            <div className="space-y-2">
                                <Label htmlFor="username">
                                    Nombre de usuario <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="username"
                                    value={name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setName(e.target.value);
                                        if (errors.name) {
                                            setErrors({ ...errors, name: undefined });
                                        }
                                    }}
                                    placeholder="Ingresa tu nombre"
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Email <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setEmail(e.target.value);
                                        if (errors.email) {
                                            setErrors({ ...errors, email: undefined });
                                        }
                                    }}
                                    placeholder="tu@email.com"
                                    className={errors.email ? 'border-destructive' : ''}
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email}</p>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Seguridad */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Seguridad</h3>
                            <p className="text-sm text-muted-foreground">
                                Deja los campos vacíos si no deseas cambiar tu contraseña
                            </p>

                            {/* Nueva Contraseña */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Nueva Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setPassword(e.target.value);
                                        if (errors.password) {
                                            setErrors({ ...errors, password: undefined });
                                        }
                                    }}
                                    placeholder="Mínimo 6 caracteres"
                                    className={errors.password ? 'border-destructive' : ''}
                                />
                                <p className="text-xs text-muted-foreground">
                                    La contraseña debe contener al menos 6 caracteres, incluyendo mayúscula, minúscula, número y carácter especial (@$!%*?&)
                                </p>
                                {errors.password && (
                                    <p className="text-sm text-destructive">{errors.password}</p>
                                )}
                            </div>

                            {/* Confirmar Contraseña */}
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setConfirmPassword(e.target.value);
                                        if (errors.confirmPassword) {
                                            setErrors({ ...errors, confirmPassword: undefined });
                                        }
                                    }}
                                    placeholder="Repite tu contraseña"
                                    className={errors.confirmPassword ? 'border-destructive' : ''}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-sm text-destructive">
                                        {errors.confirmPassword}
                                    </p>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Estado de la Cuenta */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Estado de la Cuenta</h3>

                            <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                                <div className="flex-1 space-y-1">
                                    <Label htmlFor="status" className="text-base cursor-pointer">
                                        Cuenta {status ? 'Activa' : 'Inactiva'}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {status
                                            ? 'Tu cuenta está activa y puedes iniciar sesión'
                                            : 'Tu cuenta está desactivada'}
                                    </p>
                                </div>
                                <Switch
                                    id="status"
                                    checked={status}
                                    onCheckedChange={handleStatusChange}
                                />
                            </div>

                            {!status && (
                                <Alert variant="destructive">
                                    <span className="material-symbols-outlined text-sm">
                                        warning
                                    </span>
                                    <AlertDescription>
                                        <strong>Advertencia:</strong> Si desactivas tu cuenta, no
                                        podrás iniciar sesión. Necesitarás contactar con un
                                        administrador para reactivarla.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setName(user.name);
                                setEmail(user.email);
                                setPassword('');
                                setConfirmPassword('');
                                setStatus(user.status);
                                setErrors({});
                            }}
                            disabled={isSubmitting || !hasChanges()}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting || !hasChanges()}>
                            {isSubmitting ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin mr-2 text-sm">
                                        progress_activity
                                    </span>
                                    Guardando...
                                </>
                            ) : (
                                'Guardar Cambios'
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>

            {/* Diálogo de confirmación para desactivar cuenta */}
            <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-destructive">
                                warning
                            </span>
                            ¿Desactivar tu cuenta?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                            <p>
                                Estás a punto de desactivar tu cuenta. Esto significa que:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>No podrás iniciar sesión</li>
                                <li>Perderás acceso a tu biblioteca</li>
                                <li>Necesitarás contactar a un administrador para reactivarla</li>
                            </ul>
                            <p className="font-semibold mt-4">
                                ¿Estás seguro de que deseas continuar?
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={cancelStatusChange}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmStatusChange}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Sí, desactivar cuenta
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
