import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Link } from 'react-router';

export const LoginForm = () => {
    return (
        <div className={cn('flex flex-col gap-6')}>
            <Card className="border-none shadow-lg">
                <CardContent>
                    <form>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="email">
                                    Correo Electronico
                                </FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="juan@ejemplo.com"
                                    required
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
                                    required
                                />
                            </Field>
                            <Field>
                                <Button
                                    className="bg-blue-400 shadow-md shadow-blue-400/50 hover:bg-blue-400"
                                    type="submit"
                                >
                                    Iniciar sesión
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
