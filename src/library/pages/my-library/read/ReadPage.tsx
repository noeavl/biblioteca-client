import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BookCardWithMenu } from '@/library/components/BookCardWithMenu';
import { BooksGridSkeleton } from '@/library/components/BooksGridSkeleton';
import { CustomPagination } from '@/library/components/CustomPagination';
import {
    getReadingHistory,
    removeReadingHistory,
    type ReadingHistory,
} from '@/library/api/reading-history.api';
import { getReaderIdFromToken } from '@/auth/utils/jwt.utils';
import { toast } from 'sonner';
import { type SortType } from '@/mocks/filters.mock';
import { AddToCollectionDialog } from '@/library/components/AddToCollectionDialog';

const ITEMS_PER_PAGE = 12;

interface ReadContext {
    selectedSort: SortType;
}

export const ReadPage = () => {
    const { selectedSort } = useOutletContext<ReadContext>();
    const [readingHistory, setReadingHistory] = useState<ReadingHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [collectionDialogOpen, setCollectionDialogOpen] = useState<boolean>(false);
    const [selectedBookForCollection, setSelectedBookForCollection] = useState<{ id: string; title: string } | null>(null);

    useEffect(() => {
        loadReadingHistory(currentPage);
    }, [currentPage, selectedSort]);

    const loadReadingHistory = async (page: number) => {
        try {
            setLoading(true);
            setError(null);
            const skip = (page - 1) * ITEMS_PER_PAGE;
            const data = await getReadingHistory({
                limit: ITEMS_PER_PAGE,
                skip,
                sort: selectedSort,
            });
            setReadingHistory(data.readingHistory);
            setTotalPages(data.totalPages);
        } catch (err: any) {
            console.error('Error al cargar el historial de lectura:', err);
            setError('Error al cargar el historial de lectura');
            if (err?.response?.data?.message) {
                toast.error(err.response.data.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleToggleFavorite = (id: string) => {
        console.log('Toggle favorite:', id);
        toast.info('Funcionalidad de "Favoritos" próximamente');
    };

    const handleToggleRead = async (bookId: string) => {
        const readerId = getReaderIdFromToken();
        if (!readerId) {
            toast.error('No se pudo obtener el ID del lector');
            return;
        }

        try {
            await removeReadingHistory({ bookId, readerId });
            toast.success('Libro removido del historial de lectura');
            await loadReadingHistory(currentPage);
        } catch (error: any) {
            console.error('Error al remover del historial de lectura:', error);
            if (error?.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Error al remover del historial de lectura');
            }
        }
    };

    const handleAddToCollection = (bookId: string) => {
        const item = readingHistory.find((history) => history.book._id === bookId);
        if (!item) return;

        setSelectedBookForCollection({
            id: item.book._id,
            title: item.book.title,
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

    if (readingHistory.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="material-symbols-outlined text-muted-foreground text-6xl mb-4">
                    history
                </span>
                <h3 className="text-xl font-semibold mb-2">No tienes libros en tu historial</h3>
                <p className="text-muted-foreground">
                    Empieza a leer libros para verlos aquí
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
                {readingHistory.map((item) => (
                    <BookCardWithMenu
                        key={item._id}
                        id={item.book._id}
                        img={
                            item.book.coverImage
                                ? `${import.meta.env.VITE_API_URL}/files/cover/${item.book.coverImage}`
                                : null
                        }
                        title={item.book.title}
                        category={item.book.category.name}
                        author={`${item.book.author.person.firstName} ${item.book.author.person.lastName}`}
                        publicationYear={item.book.publicationYear}
                        isFavorite={false} // TODO: Check if the book is a favorite
                        isRead={true} // All books in the history are read
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