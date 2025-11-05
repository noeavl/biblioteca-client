import { MainContainer } from '@/library/components/MainContainer';
import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import type { Book, BookCategory } from '@/library/interfaces/book.interface';
import { BooksGrid } from '@/library/components/BooksGrid';
import { getBooks } from '@/panel/api/books.api';
import { getCategoryById } from '@/library/api/categories.api';
import { BooksGridSkeleton } from '@/library/components/BooksGridSkeleton';
import { addFavorite, removeFavorite, getFavorites } from '@/library/api/favorites.api';
import { getReaderIdFromToken } from '@/auth/utils/jwt.utils';
import { useAuth } from '@/auth/hooks/useAuth';
import { toast } from 'sonner';
import { AddToCollectionDialog } from '@/library/components/AddToCollectionDialog';

const ITEMS_PER_PAGE = 12;

export const CategoryDetailPage = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const { user } = useAuth();
    const [category, setCategory] = useState<BookCategory | null>(null);
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [booksLoading, setBooksLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [favoriteBookIds, setFavoriteBookIds] = useState<Set<string>>(new Set());
    const [collectionDialogOpen, setCollectionDialogOpen] = useState<boolean>(false);
    const [selectedBookForCollection, setSelectedBookForCollection] = useState<{ id: string; title: string } | null>(null);

    const isReader = user?.role?.name === 'reader';

    // Cargar categoría
    useEffect(() => {
        const fetchCategory = async () => {
            if (!categoryId) {
                setError('ID de categoría no válido');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const categoryData = await getCategoryById(categoryId);
                setCategory(categoryData);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (err) {
                setError('Error al cargar la categoría');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategory();
    }, [categoryId]);

    // Cargar libros de la categoría
    useEffect(() => {
        const fetchBooks = async () => {
            if (!categoryId) return;

            try {
                setBooksLoading(true);
                const { books: categoryBooks } = await getBooks({
                    limit: ITEMS_PER_PAGE,
                    skip: 0,
                    categories: [categoryId],
                });
                setBooks(categoryBooks);
            } catch (err) {
                console.error('Error al cargar libros:', err);
            } finally {
                setBooksLoading(false);
            }
        };

        fetchBooks();
    }, [categoryId]);

    // Cargar favoritos del usuario (solo para readers)
    useEffect(() => {
        const loadFavorites = async () => {
            if (!isReader) return;

            try {
                const { favorites } = await getFavorites();
                const favoriteIds = new Set(favorites.map((fav) => fav.book._id));
                setFavoriteBookIds(favoriteIds);
            } catch (error) {
                console.error('Error al cargar favoritos:', error);
            }
        };

        loadFavorites();
    }, [isReader]);

    // Manejar toggle de favoritos
    const handleToggleFavorite = async (bookId: string) => {
        if (!isReader) {
            toast.error('Solo los lectores pueden agregar libros a favoritos');
            return;
        }

        const readerId = getReaderIdFromToken();
        if (!readerId) {
            toast.error('No se pudo obtener el ID del lector');
            return;
        }

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
        } catch (error: any) {
            console.error('Error al gestionar favoritos:', error);
            if (error?.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Error al gestionar favoritos');
            }
        }
    };

    const handleToggleRead = (id: string) => {
        console.log('Toggle read:', id);
        toast.info('Funcionalidad de "Leídos" próximamente');
    };

    const handleAddToCollection = (bookId: string) => {
        if (!isReader) {
            toast.error('Solo los lectores pueden agregar libros a colecciones');
            return;
        }

        const book = books.find((b) => b._id === bookId);
        if (!book) return;

        setSelectedBookForCollection({
            id: book._id,
            title: book.title,
        });
        setCollectionDialogOpen(true);
    };

    // Estados de carga y error
    if (loading) {
        return (
            <MainContainer>
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </MainContainer>
        );
    }

    if (error || !category) {
        return (
            <MainContainer>
                <div className="flex items-center justify-center py-12">
                    <p className="text-destructive">{error || 'Categoría no encontrada'}</p>
                </div>
            </MainContainer>
        );
    }

    // Transformar libros al formato esperado por BooksGrid
    const transformedBooks = books.map((book) => ({
        id: book._id,
        title: book.title,
        publicationYear: book.publicationYear,
        author: `${book.author.person.firstName} ${book.author.person.lastName}`,
        category: book.category.name,
        img: book.coverImage
            ? `${import.meta.env.VITE_API_URL}/files/cover/${book.coverImage}`
            : null,
        isFavorite: favoriteBookIds.has(book._id),
        isRead: false,
    }));

    return (
        <MainContainer>
            {/* Hero Section - Información de la Categoría */}
            <section className="mb-8 sm:mb-12 lg:mb-16">
                <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6">
                    {/* Icono de Categoría */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-4xl sm:text-5xl md:text-6xl">
                            category
                        </span>
                    </div>

                    {/* Nombre de Categoría */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
                        {category.name}
                    </h1>

                    {/* Estadísticas */}
                    <div className="flex items-center gap-4 text-sm sm:text-base text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-xl">
                                book
                            </span>
                            <span>
                                {books.length} {books.length === 1 ? 'libro' : 'libros'}
                            </span>
                        </div>
                    </div>

                    {/* Descripción (si existe en el futuro) */}
                    <p className="max-w-2xl text-muted-foreground text-sm sm:text-base md:text-lg">
                        Explora nuestra colección de libros en la categoría {category.name}
                    </p>
                </div>
            </section>

            {/* Sección de Libros */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                        Libros en esta categoría
                    </h2>
                </div>

                {booksLoading ? (
                    <BooksGridSkeleton count={ITEMS_PER_PAGE} />
                ) : books.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <span className="material-symbols-outlined text-muted-foreground text-6xl mb-4">
                            menu_book
                        </span>
                        <h3 className="text-xl font-semibold mb-2">
                            No hay libros en esta categoría
                        </h3>
                        <p className="text-muted-foreground">
                            Aún no hay libros disponibles en {category.name}
                        </p>
                    </div>
                ) : (
                    <BooksGrid
                        books={transformedBooks}
                        withMenu
                        onToggleFavorite={handleToggleFavorite}
                        onToggleRead={handleToggleRead}
                        onAddToCollection={handleAddToCollection}
                    />
                )}
            </section>

            {selectedBookForCollection && (
                <AddToCollectionDialog
                    open={collectionDialogOpen}
                    onOpenChange={setCollectionDialogOpen}
                    bookId={selectedBookForCollection.id}
                    bookTitle={selectedBookForCollection.title}
                />
            )}
        </MainContainer>
    );
};
