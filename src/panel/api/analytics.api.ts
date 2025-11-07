import { panelApi } from './panelApi.api';
import type { DashboardAnalytics } from '@/panel/interfaces/analytics.interface';

/**
 * Obtiene las estadísticas y análisis del dashboard
 * @returns DashboardAnalytics con toda la información analítica
 * @throws Error si falla la petición
 */
export const getDashboardAnalytics = async (): Promise<DashboardAnalytics> => {
    try {
        const { data } = await panelApi.get<DashboardAnalytics>('/dashboard/analytics');
        return data;
    } catch (error) {
        console.error('Error al obtener las analíticas del dashboard:', error);
        throw error;
    }
};
