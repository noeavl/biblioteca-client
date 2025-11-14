import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BookCardWithMenu } from '@/library/components/BookCardWithMenu';
import { BooksGridSkeleton } from '@/library/components/BooksGridSkeleton';
import { CustomPagination } from '@/library/components/CustomPagination';
import { getFavorites, removeFavorite, type FavoriteBook } from '@/library/api/favorites.api';
import { getReadingHistory, addReadingHistory, removeReadingHistory } from '@/library/api/reading-history.api';
import { getReaderIdFromToken } from '@/auth/utils/jwt.utils';
import { toast } from 'sonner';
import { type SortType } from '@/mocks/filters.mock';
import { AddToCollectionDialog } from '@/library/components/AddToCollectionDialog';
import { useBookActions } from '@/library/hooks/useBookActions';

const ITEMS_PER_PAGE = 12;

interface FavoritesContext {
    selectedSort: SortType;
}

export const FavoritesPage = () => {
    const { selectedSort } = useOutletContext<FavoritesContext>();
    const [favorites, setFavorites] = useState<FavoriteBook[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [collectionDialogOpen, setCollectionDialogOpen] = useState<boolean>(false);
    const [selectedBookForCollection, setSelectedBookForCollection] = useState<{ id: string; title: string } | null>(null);

    // Hook optimizado para manejar favoritos y leídos
    const {
        readBookIds,
        setReadBookIds,
    } = useBookActions();

    const loadFavorites = async () => {
        try {
            setLoading(true);
            setError(null);
            const skip = (currentPage - 1) * ITEMS_PER_PAGE;

            const [favoritesData, readingHistoryData] = await Promise.all([
                getFavorites({ limit: ITEMS_PER_PAGE, skip, sort: selectedSort }),
                getReadingHistory({ limit: 1000 }), // Fetch all read books to check status
            ]);

            setFavorites(favoritesData.favorites);
            setTotalPages(favoritesData.totalPages);

            const readIds = new Set(readingHistoryData.readingHistory.map((item) => item.book._id));
            setReadBookIds(readIds);
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

    useEffect(() => {
        loadFavorites();
    }, [currentPage, selectedSort]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleToggleFavorite = async (bookId: string) => {
        const readerId = getReaderIdFromToken();
        if (!readerId) {
            toast.error('No se pudo obtener el ID del lector');
            return;
        }

        // Optimistic update: remover inmediatamente de la UI
        const previousFavorites = [...favorites];
        setFavorites(prevFavorites => prevFavorites.filter(fav => fav.book._id !== bookId));
        toast.success('Libro removido de favoritos');

        try {
            await removeFavorite({ book: bookId, reader: readerId });
            // Si la eliminación fue exitosa, recargar para actualizar la paginación
            loadFavorites();
        } catch (error: any) {
            // Si falla, revertir el cambio optimista
            setFavorites(previousFavorites);
            console.error('Error al remover de favoritos:', error);
            if (error?.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Error al remover de favoritos');
            }
        }
    };

    const handleToggleRead = async (bookId: string) => {
        const readerId = getReaderIdFromToken();
        if (!readerId) {
            toast.error('No se pudo obtener el ID del lector');
            return;
        }

        const isRead = readBookIds.has(bookId);

        // Optimistic update: actualizar inmediatamente la UI
        if (isRead) {
            setReadBookIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(bookId);
                return newSet;
            });
            toast.success('Libro marcado como no leído');
        } else {
            setReadBookIds((prev) => new Set(prev).add(bookId));
            toast.success('Libro marcado como leído');
        }

        try {
            if (isRead) {
                await removeReadingHistory({ bookId, readerId });
            } else {
                await addReadingHistory({ book: bookId, reader: readerId });
            }
        } catch (error: any) {
            // Si falla, revertir el cambio optimista
            if (isRead) {
                setReadBookIds((prev) => new Set(prev).add(bookId));
            } else {
                setReadBookIds((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(bookId);
                    return newSet;
                });
            }
            console.error('Error al gestionar estado de leído:', error);
            if (error?.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Error al gestionar estado de leído');
            }
        }
    };

    const handleAddToCollection = (bookId: string) => {
        const favorite = favorites.find((fav) => fav.book._id === bookId);
        if (!favorite) return;

        setSelectedBookForCollection({
            id: favorite.book._id,
            title: favorite.book.title,
        });
        setCollectionDialogOpen(true);
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
        <div className="space-y-6 sm:space-y-8">
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
                        isRead={readBookIds.has(favorite.book._id)}
                        onToggleFavorite={handleToggleFavorite}
                        onToggleRead={handleToggleRead}
                        onAddToCollection={handleAddToCollection}
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <CustomPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}

            {selectedBookForCollection && (
                <AddToCollectionDialog
                    open={collectionDialogOpen}
                    onOpenChange={setCollectionDialogOpen}
                    bookId={selectedBookForCollection.id}
                    bookTitle={selectedBookForCollection.title}
                />
            )}
        </div>
    );
};
