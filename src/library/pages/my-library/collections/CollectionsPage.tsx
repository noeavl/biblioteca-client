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
import { EditCollectionDialog } from '@/library/components/EditCollectionDialog';
import { Button } from '@/components/ui/button';
import { useCollections } from '@/library/context/CollectionsContext';

export const CollectionsPage = () => {
    const { collectionId } = useParams<{ collectionId: string }>();
    const { user } = useAuth();
    const { updateCollectionName } = useCollections();
    const [collection, setCollection] = useState<CollectionWithBooks | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [favoriteBookIds, setFavoriteBookIds] = useState<Set<string>>(new Set());
    const [readBookIds, setReadBookIds] = useState<Set<string>>(new Set());
    const [collectionDialogOpen, setCollectionDialogOpen] = useState<boolean>(false);
    const [selectedBookForCollection, setSelectedBookForCollection] = useState<{ id: string; title: string } | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);

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

        const isFavorite = favoriteBookIds.has(bookId);

        // Optimistic update: actualizar inmediatamente la UI
        if (isFavorite) {
            setFavoriteBookIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(bookId);
                return newSet;
            });
            toast.success('Libro removido de favoritos');
        } else {
            setFavoriteBookIds((prev) => new Set(prev).add(bookId));
            toast.success('Libro agregado a favoritos');
        }

        try {
            if (isFavorite) {
                await removeFavorite({ book: bookId, reader: readerId });
            } else {
                await addFavorite({ book: bookId, reader: readerId });
            }
        } catch (error: unknown) {
            // Si falla, revertir el cambio optimista
            if (isFavorite) {
                setFavoriteBookIds((prev) => new Set(prev).add(bookId));
            } else {
                setFavoriteBookIds((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(bookId);
                    return newSet;
                });
            }
            console.error('Error al gestionar favoritos:', error);
            if (error && typeof error === 'object' && 'response' in error) {
                const apiError = error as { response?: { data?: { message?: string } } };
                if (apiError.response?.data?.message) {
                    toast.error(apiError.response.data.message);
                } else {
                    toast.error('Error al gestionar favoritos');
                }
            } else {
                toast.error('Error al gestionar favoritos');
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
        } catch (error: unknown) {
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
            if (error && typeof error === 'object' && 'response' in error) {
                const apiError = error as { response?: { data?: { message?: string } } };
                if (apiError.response?.data?.message) {
                    toast.error(apiError.response.data.message);
                } else {
                    toast.error('Error al gestionar estado de leído');
                }
            } else {
                toast.error('Error al gestionar estado de leído');
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

        // Optimistic update: remover inmediatamente de la UI
        const previousCollection = collection;
        setCollection((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                books: prev.books.filter((book) => book._id !== bookId),
            };
        });
        toast.success('Libro removido de la colección');

        try {
            await removeBookFromCollection(collectionId, bookId);
        } catch (error: unknown) {
            // Si falla, revertir el cambio optimista
            setCollection(previousCollection);
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

    const handleEditSuccess = async (): Promise<void> => {
        if (!collectionId) return;

        try {
            const updatedCollection = await getCollectionById(collectionId, { withBooks: true });
            setCollection(updatedCollection);
            // Update the name in the sidebar context
            updateCollectionName(updatedCollection._id, updatedCollection.name);
        } catch (error) {
            console.error('Error al recargar colección:', error);
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
            <>
                {/* Header con nombre, descripción y botón de editar */}
                <div className="mb-6 space-y-3 overflow-hidden">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl sm:text-3xl font-bold text-foreground break-all">
                                {collection.name}
                            </h2>
                            {collection.description && (
                                <p className="mt-2 text-sm sm:text-base text-muted-foreground break-all whitespace-normal">
                                    {collection.description}
                                </p>
                            )}
                        </div>
                        {isReader && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditDialogOpen(true)}
                                className="flex-shrink-0"
                            >
                                <span className="material-symbols-outlined text-lg mr-2">
                                    edit
                                </span>
                                Editar
                            </Button>
                        )}
                    </div>
                </div>

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

                {collection && (
                    <EditCollectionDialog
                        open={editDialogOpen}
                        onOpenChange={setEditDialogOpen}
                        collectionId={collection._id}
                        currentName={collection.name}
                        currentDescription={collection.description}
                        onSuccess={handleEditSuccess}
                    />
                )}
            </>
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
            {/* Header con nombre, descripción y botón de editar */}
            <div className="mb-6 space-y-3 overflow-hidden">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground break-all">
                            {collection.name}
                        </h2>
                        {collection.description && (
                            <p className="mt-2 text-sm sm:text-base text-muted-foreground break-all whitespace-normal">
                                {collection.description}
                            </p>
                        )}
                    </div>
                    {isReader && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditDialogOpen(true)}
                            className="flex-shrink-0"
                        >
                            <span className="material-symbols-outlined text-lg mr-2">
                                edit
                            </span>
                            Editar
                        </Button>
                    )}
                </div>
            </div>

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

            {collection && (
                <EditCollectionDialog
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    collectionId={collection._id}
                    currentName={collection.name}
                    currentDescription={collection.description}
                    onSuccess={handleEditSuccess}
                />
            )}
        </>
    );
};
