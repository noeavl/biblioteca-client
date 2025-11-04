import { useEffect, useState } from 'react';
import { BookCardWithMenu } from '@/library/components/BookCardWithMenu';
import { BooksGridSkeleton } from '@/library/components/BooksGridSkeleton';
import { getFavorites, removeFavorite, type FavoriteBook } from '@/library/api/favorites.api';
import { getReaderIdFromToken } from '@/auth/utils/jwt.utils';
import { toast } from 'sonner';

export const FavoritesPage = () => {
    const [favorites, setFavorites] = useState<FavoriteBook[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getFavorites();
            console.log('Favoritos recibidos:', data);
            setFavorites(data.favorites);
        } catch (err: any) {
            console.error('Error al cargar favoritos:', err);
            setError('Error al cargar los favoritos');
            if (err?.response?.data?.message) {
                toast.error(err.response.data.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFavorite = async (bookId: string) => {
        const readerId = getReaderIdFromToken();
        if (!readerId) {
            toast.error('No se pudo obtener el ID del lector');
            return;
        }

        try {
            await removeFavorite({ book: bookId, reader: readerId });
            toast.success('Libro removido de favoritos');
            // Recargar favoritos
            await loadFavorites();
        } catch (error: any) {
            console.error('Error al remover de favoritos:', error);
            if (error?.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Error al remover de favoritos');
            }
        }
    };

    const handleToggleRead = (id: string) => {
        console.log('Toggle read:', id);
        toast.info('Funcionalidad de "Leídos" próximamente');
    };

    const handleAddToCollection = (id: string) => {
        console.log('Add to collection:', id);
        toast.info('Funcionalidad de "Colecciones" próximamente');
    };

    if (loading) {
        return <BooksGridSkeleton />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-destructive">{error}</p>
            </div>
        );
    }

    if (favorites.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="material-symbols-outlined text-muted-foreground text-6xl mb-4">
                    favorite_border
                </span>
                <h3 className="text-xl font-semibold mb-2">No tienes favoritos aún</h3>
                <p className="text-muted-foreground">
                    Empieza a agregar libros a tus favoritos para verlos aquí
                </p>
            </div>
        );
    }

    return (
        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
            {favorites.map((favorite) => (
                <BookCardWithMenu
                    key={favorite._id}
                    id={favorite.book._id}
                    img={
                        favorite.book.coverImage
                            ? `${import.meta.env.VITE_API_URL}/files/cover/${favorite.book.coverImage}`
                            : null
                    }
                    title={favorite.book.title}
                    category={favorite.book.category.name}
                    author={`${favorite.book.author.person.firstName} ${favorite.book.author.person.lastName}`}
                    publicationYear={favorite.book.publicationYear}
                    isFavorite={true}
                    onToggleFavorite={handleToggleFavorite}
                    onToggleRead={handleToggleRead}
                    onAddToCollection={handleAddToCollection}
                />
            ))}
        </div>
    );
};
