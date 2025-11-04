import { Navigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

interface ReaderRouteProps {
    children: React.ReactNode;
}

export const ReaderRoute = ({ children }: ReaderRouteProps) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        // Si no está autenticado, redirigir al login
        return <Navigate to="/iniciar-sesion" replace />;
    }

    // Verificar si el usuario tiene rol de reader
    if (user?.role?.name !== 'reader') {
        // Si no es reader, redirigir a la página principal
        return <Navigate to="/" replace />;
    }

    // Si está autenticado y es reader, mostrar el contenido
    return <>{children}</>;
};
