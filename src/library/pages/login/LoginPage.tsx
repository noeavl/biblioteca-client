import { LoginForm } from '@/library/components/LoginForm';

export const LoginPage = () => {
    return (
        <div className="relative bg-[url(@/assets/bg-window-books.png)] bg-cover bg-center flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="absolute backdrop-blur-sm inset-0 bg-black/30"></div>
            <div className="flex w-full max-w-sm flex-col gap-6 z-10">
                <div className="text-center space-y-3">
                    <h2 className="text-4xl font-bold text-white">
                        Bienvenido de nuevo
                    </h2>
                    <p className="text-xl font-normal text-gray-100">
                        Por favor, ingresa tus datos.
                    </p>
                </div>
                <LoginForm />
            </div>
        </div>
    );
};
