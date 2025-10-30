import { LoginForm } from '@/library/components/LoginForm';

export const LoginPage = () => {
    return (
        <div className="relative bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6 z-10">
                <div className="text-center space-y-3">
                    <h2 className="text-4xl font-bold text-foreground">
                        Bienvenido de nuevo
                    </h2>
                    <p className="text-xl font-normal text-muted-foreground">
                        Por favor, ingresa tus datos.
                    </p>
                </div>
                <LoginForm />
            </div>
        </div>
    );
};
