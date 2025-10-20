import { panelApi } from './panelApi.api';

export const uploadBookPDF = async (bookId: string, file: File): Promise<void> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        await panelApi.post(`/files/book/${bookId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    } catch (error) {
        console.error('Error al subir el PDF del libro:', error);
        throw error;
    }
};

export const uploadBookCover = async (bookId: string, file: File): Promise<void> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        await panelApi.post(`/files/cover/${bookId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    } catch (error) {
        console.error('Error al subir la portada del libro:', error);
        throw error;
    }
};
