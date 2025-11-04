export interface DecodedToken {
    sub: string;
    email: string;
    role: string;
    reader?: string;
    iat: number;
}

export const decodeToken = (token: string): DecodedToken | null => {
    try {
        // El JWT tiene 3 partes separadas por puntos: header.payload.signature
        const payload = token.split('.')[1];
        if (!payload) return null;

        // Decodificar el payload de base64
        const decoded = JSON.parse(atob(payload));
        return decoded;
    } catch (error) {
        console.error('Error al decodificar el token:', error);
        return null;
    }
};

export const getReaderIdFromToken = (): string | null => {
    try {
        const token = localStorage.getItem('token');
        console.log('🔑 Token obtenido del localStorage:', token ? 'Token existe' : 'No hay token');
        if (!token) return null;

        const decoded = decodeToken(token);
        console.log('📦 Token decodificado:', decoded);
        console.log('👤 Reader ID extraído:', decoded?.reader);
        return decoded?.reader || null;
    } catch (error) {
        console.error('Error al obtener reader ID del token:', error);
        return null;
    }
};
