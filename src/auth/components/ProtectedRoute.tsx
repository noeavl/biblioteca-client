import { Navigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        // Si no está autenticado, redirigir al login
        return <Navigate to="/iniciar-sesion" replace />;
    }

    // Si está autenticado, mostrar el contenido
    return <>{children}</>;
};
