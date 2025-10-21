import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router';
import { useState, type FormEvent } from 'react';
import { loginAction } from '../actions/login.action';
import { useAuth } from '@/auth/hooks/useAuth';

export const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSlowWarning, setShowSlowWarning] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        setShowSlowWarning(false);

        // Mostrar advertencia si tarda más de 2 segundos
        const warningTimeout = setTimeout(() => {
            setShowSlowWarning(true);
        }, 2000);

        try {
            const response = await loginAction(email, password);
            login(response.access_token, response.user);
            navigate('/');
        } catch (err: any) {
            // Mostrar el mensaje específico del backend si existe
            if (err?.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err?.message) {
                setError(err.message);
            } else {
                setError('Credenciales inválidas. Por favor, intenta de nuevo.');
            }
        } finally {
            clearTimeout(warningTimeout);
            setIsLoading(false);
            setShowSlowWarning(false);
        }
    };

    return (
        <div className={cn('flex flex-col gap-6')}>
            <Card className="border-none shadow-lg">
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <FieldGroup>
                            {error && (
                                <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                                    {error}
                                </div>
                            )}
                            {showSlowWarning && (
                                <div className="text-amber-600 text-sm text-center bg-amber-50 p-2 rounded">
                                    El servidor está iniciando, esto puede tardar unos segundos...
                                </div>
                            )}
                            <Field>
                                <FieldLabel htmlFor="email">
                                    Correo Electronico
                                </FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="juan@ejemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </Field>
                            <Field>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">
                                        Contraseña
                                    </FieldLabel>
                                    <Link
                                        to={'/'}
                                        className="ml-auto text-sm font-thin text-blue-400 underline-offset-4 hover:underline"
                                    >
                                        ¿Olvidé mi contraseña?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="********"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </Field>
                            <Field>
                                <Button
                                    className="bg-blue-400 shadow-md shadow-blue-400/50 hover:bg-blue-400"
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
