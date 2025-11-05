import { BooksGrid } from '@/library/components/BooksGrid';
import { useParams } from 'react-router';
import { useState, useEffect } from 'react';
import { getCollectionById, removeBookFromCollection } from '@/library/api/collections.api';
import type { CollectionWithBooks } from '@/library/api/collections.api';
import { toast } from 'sonner';
import { addFavorite, removeFavorite, checkIsFavorite } from '@/library/api/favorites.api';
import { addReadingHistory, removeReadingHistory, getReadingHistory } from '@/library/api/reading-history.api';
import { getReaderIdFromToken } from '@/auth/utils/jwt.utils';
import { useAuth } from '@/auth/hooks/useAuth';
import { AddToCollectionDialog } from '@/library/components/AddToCollectionDialog';

export const CollectionsPage = () => {
    const { collectionId } = useParams<{ collectionId: string }>();
    const { user } = useAuth();
    const [collection, setCollection] = useState<CollectionWithBooks | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [favoriteBookIds, setFavoriteBookIds] = useState<Set<string>>(new Set());
    const [readBookIds, setReadBookIds] = useState<Set<string>>(new Set());
    const [collectionDialogOpen, setCollectionDialogOpen] = useState<boolean>(false);
    const [selectedBookForCollection, setSelectedBookForCollection] = useState<{ id: string; title: string } | null>(null);

    const isReader = user?.role?.name === 'reader';

    useEffect(() => {
        const loadCollection = async (): Promise<void> => {
            if (!collectionId) return;

            try {
                setLoading(true);
                const collectionData = await getCollectionById(collectionId, { withBooks: true });
                setCollection(collectionData);

                // Load favorites and read books for readers
                if (isReader) {
                    try {
                        const favoriteIds = new Set<string>();
                        for (const book of collectionData.books) {
                            const isFav = await checkIsFavorite(book._id);
                            if (isFav) {
                                favoriteIds.add(book._id);
                            }
                        }
                        setFavoriteBookIds(favoriteIds);

                        const { readingHistory } = await getReadingHistory({ limit: 1000 });
                        const readIds = new Set(readingHistory.map((item) => item.book._id));
                        setReadBookIds(readIds);
                    } catch (error) {
                        console.error('Error al cargar favoritos y leídos:', error);
                    }
                }
            } catch (error) {
                console.error('Error al cargar colección:', error);
                toast.error('Error al cargar la colección');
            } finally {
                setLoading(false);
            }
        };

        loadCollection();
    }, [collectionId, isReader]);

    const handleToggleFavorite = async (bookId: string): Promise<void> => {
        if (!isReader) {
            toast.error('Solo los lectores pueden agregar favoritos');
            return;
        }

        const readerId = getReaderIdFromToken();
        if (!readerId) return;

        try {
            const isFavorite = favoriteBookIds.has(bookId);

            if (isFavorite) {
                await removeFavorite({ book: bookId, reader: readerId });
                setFavoriteBookIds((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(bookId);
                    return newSet;
                });
                toast.success('Libro removido de favoritos');
            } else {
                await addFavorite({ book: bookId, reader: readerId });
                setFavoriteBookIds((prev) => new Set(prev).add(bookId));
                toast.success('Libro agregado a favoritos');
            }
        } catch (error: unknown) {
            console.error('Error al gestionar favoritos:', error);
            if (error && typeof error === 'object' && 'response' in error) {
                const apiError = error as { response?: { data?: { message?: string } } };
                if (apiError.response?.data?.message) {
                    toast.error(apiError.response.data.message);
                }
            }
        }
    };

    const handleToggleRead = async (bookId: string): Promise<void> => {
        if (!isReader) {
            toast.error('Solo los lectores pueden marcar libros como leídos');
            return;
        }

        const readerId = getReaderIdFromToken();
        if (!readerId) return;

        try {
            const isRead = readBookIds.has(bookId);

            if (isRead) {
                await removeReadingHistory({ bookId, readerId });
                setReadBookIds((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(bookId);
                    return newSet;
                });
                toast.success('Libro marcado como no leído');
            } else {
                await addReadingHistory({ book: bookId, reader: readerId });
                setReadBookIds((prev) => new Set(prev).add(bookId));
                toast.success('Libro marcado como leído');
            }
        } catch (error: unknown) {
            console.error('Error al gestionar estado de leído:', error);
            if (error && typeof error === 'object' && 'response' in error) {
                const apiError = error as { response?: { data?: { message?: string } } };
                if (apiError.response?.data?.message) {
                    toast.error(apiError.response.data.message);
                }
            }
        }
    };

    const handleAddToCollection = (bookId: string): void => {
        if (!isReader) {
            toast.error('Solo los lectores pueden agregar libros a colecciones');
            return;
        }

        const book = collection?.books.find((b) => b._id === bookId);
        if (!book) return;

        setSelectedBookForCollection({
            id: book._id,
            title: book.title,
        });
        setCollectionDialogOpen(true);
    };

    const handleRemoveFromCollection = async (bookId: string): Promise<void> => {
        if (!collectionId) return;

        try {
            await removeBookFromCollection(collectionId, bookId);

            // Update local state
            setCollection((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    books: prev.books.filter((book) => book._id !== bookId),
                };
            });

            toast.success('Libro removido de la colección');
        } catch (error: unknown) {
            console.error('Error al remover libro de colección:', error);
            if (error && typeof error === 'object' && 'response' in error) {
                const apiError = error as { response?: { data?: { message?: string } } };
                if (apiError.response?.data?.message) {
                    toast.error(apiError.response.data.message);
                } else {
                    toast.error('Error al remover el libro de la colección');
                }
            } else {
                toast.error('Error al remover el libro de la colección');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Cargando colección...</p>
            </div>
        );
    }

    if (!collection) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-destructive">Colección no encontrada</p>
            </div>
        );
    }

    if (collection.books.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <span className="material-symbols-outlined text-muted-foreground" style={{ fontSize: '4rem' }}>
                    menu_book
                </span>
                <div className="text-center">
                    <p className="text-xl font-semibold text-muted-foreground mb-2">
                        No hay libros en esta colección
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Agrega libros a esta colección para empezar a organizarlos
                    </p>
                </div>
            </div>
        );
    }

    const transformedBooks = collection.books.map((book) => ({
        id: book._id,
        title: book.title,
        publicationYear: book.publicationYear,
        img: book.coverImage
            ? `${import.meta.env.VITE_API_URL}/files/cover/${book.coverImage}`
            : null,
        pdf: '',
        category: book.category.name,
        author: `${book.author.person.firstName} ${book.author.person.lastName}`,
        isFavorite: favoriteBookIds.has(book._id),
        isRead: readBookIds.has(book._id),
    }));

    return (
        <>
            <BooksGrid
                books={transformedBooks}
                withMenu
                collectionName={collection.name}
                onToggleFavorite={handleToggleFavorite}
                onToggleRead={handleToggleRead}
                onAddToCollection={handleAddToCollection}
                onRemoveFromCollection={handleRemoveFromCollection}
            />

            {selectedBookForCollection && (
                <AddToCollectionDialog
                    open={collectionDialogOpen}
                    onOpenChange={setCollectionDialogOpen}
                    bookId={selectedBookForCollection.id}
                    bookTitle={selectedBookForCollection.title}
                />
            )}
        </>
    );
};
