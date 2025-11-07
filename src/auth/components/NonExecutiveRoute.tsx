import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../hooks/useAuth';

/**
 * Componente para proteger rutas que NO deben ser accesibles para usuarios con rol "executive"
 * Los ejecutivos solo tienen acceso al dashboard/inicio del panel
 */
export const NonExecutiveRoute = () => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        // Si no está autenticado, redirigir al login
        return <Navigate to="/iniciar-sesion" replace />;
    }

    // Verificar si el usuario tiene rol de executive
    if (user?.role?.name === 'executive') {
        // Si es executive, redirigir al panel de inicio
        return <Navigate to="/panel" replace />;
    }

    // Si está autenticado y NO es executive, mostrar el contenido
    return <Outlet />;
};
