import { Button } from '@/components/ui/button';
import { MainContainer } from '@/library/components/MainContainer';
import { Link, useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { getBookById } from '@/library/api/books.api';
import type { Book } from '@/library/interfaces/book.interface';
import { BooksGrid } from '@/library/components/BooksGrid';
import { getBooks } from '@/panel/api/books.api';
import { useAuth } from '@/auth/hooks/useAuth';
import { addFavorite, removeFavorite, checkIsFavorite } from '@/library/api/favorites.api';
import { toast } from 'sonner';
import { getReaderIdFromToken } from '@/auth/utils/jwt.utils';

export const BookDetailPage = () => {
    const { bookId } = useParams<{ bookId: string }>();
    const { user } = useAuth();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [books, setBooks] = useState<Book[] | []>([]);
    const [relatedLoading, setRelatedLoading] = useState<boolean>(true);
    const [isFavorite, setIsFavorite] = useState<boolean>(false);
    const [isAddingFavorite, setIsAddingFavorite] = useState<boolean>(false);

    const isReader = user?.role?.name === 'reader';

    useEffect(() => {
        const fetchBook = async () => {
            if (!bookId) {
                setError('ID del libro no válido');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const bookData = await getBookById(bookId);
                setBook(bookData);
                setCategoryId(bookData.category._id);
                window.scrollTo({ top: 0, behavior: 'smooth' });

                // Verificar si el libro está en favoritos (solo para readers)
                if (isReader) {
                    const isFav = await checkIsFavorite(bookId);
                    setIsFavorite(isFav);
                }
            } catch (err) {
                setError('Error al cargar el libro');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBook();
    }, [bookId, isReader]);

    useEffect(() => {
        const fetchBooksByCategory = async () => {
            if (!categoryId) return;
            setRelatedLoading(true);

            try {
                const { books } = await getBooks({
                    limit: 7,
                    categories: [categoryId as string],
                });
                setBooks(books);
            } catch (error) {
                setError('Error al cargar el libro');
                console.error(error);
            } finally {
                setRelatedLoading(false);
            }
        };
        fetchBooksByCategory();
    }, [categoryId]);

    const handleToggleFavorite = async () => {
        if (!isReader) {
            toast.error('Solo los lectores pueden agregar libros a favoritos');
            return;
        }

        const readerId = getReaderIdFromToken();
        if (!readerId || !bookId) {
            toast.error('No se pudo agregar a favoritos');
            return;
        }

        try {
            setIsAddingFavorite(true);

            if (isFavorite) {
                await removeFavorite({ book: bookId, reader: readerId });
                setIsFavorite(false);
                toast.success('Libro removido de favoritos');
            } else {
                await addFavorite({ book: bookId, reader: readerId });
                setIsFavorite(true);
                toast.success('Libro agregado a favoritos');
            }
        } catch (error: any) {
            console.error('Error al gestionar favoritos:', error);
            if (error?.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Error al gestionar favoritos');
            }
        } finally {
            setIsAddingFavorite(false);
        }
    };

    const transformedBooks = books
        .filter((b) => b._id != book?._id)
        .map((b) => ({
            id: b._id,
            title: b.title,
            publicationYear: b.publicationYear,
            img: b.coverImage
                ? `${import.meta.env.VITE_API_URL}/files/cover/${b.coverImage}`
                : null,
            pdf: '',
            category: b.category.name,
            author: `${b.author.person.firstName} ${b.author.person.lastName}`,
        }));

    if (loading) {
        return (
            <MainContainer>
                <div className="flex items-center justify-center py-12">
                    <p className="text-muted-foreground">Cargando libro...</p>
                </div>
            </MainContainer>
        );
    }

    if (error || !book) {
        return (
            <MainContainer>
                <div className="flex items-center justify-center py-12">
                    <p className="text-destructive">
                        {error || 'Libro no encontrado'}
                    </p>
                </div>
            </MainContainer>
        );
    }

    const coverImageUrl = book.coverImage
        ? `${import.meta.env.VITE_API_URL}/files/cover/${book.coverImage}`
        : null;

    const authorName = `${book.author.person.firstName} ${book.author.person.lastName}`;

    return (
        <MainContainer>
            <section className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
                <div className="h-64 w-full sm:h-80 sm:w-60 lg:h-100 lg:w-78 shadow-md rounded-2xl shrink-0 mx-auto lg:mx-0 overflow-hidden">
                    {coverImageUrl ? (
                        <img
                            src={coverImageUrl}
                            alt={book.title}
                            className="w-full h-full object-cover object-center"
                        />
                    ) : (
                        <div className="w-full h-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-400 dark:text-blue-300 text-9xl">
                                book
                            </span>
                        </div>
                    )}
                </div>
                <article className="flex-1">
                    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                        <div>
                            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-bold">
                                {book.title}
                            </h2>
                            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gray-400">
                                por{' '}
                                <span className="text-blue-400">
                                    {authorName}
                                </span>
                            </h3>
                        </div>
                        <div className="flex flex-wrap justify-start items-center gap-2 sm:gap-3">
                            <span className="text-sm sm:text-base text-blue-400 bg-blue-100 px-3 py-2 rounded-full">
                                {book.category.name}
                            </span>
                            <span className="text-sm sm:text-base text-gray-400">
                                Publicado en {book.publicationYear}
                            </span>
                        </div>
                        <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                            {book.synopsis || 'Sin sinopsis disponible'}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link to={`/libros/lector/${book._id}`}>
                                <Button className="bg-blue-400 shadow-xl shadow-blue-200/50 hover:bg-blue-400 text-white font-bold w-full sm:w-auto">
                                    <span className="material-symbols-outlined">
                                        book_5
                                    </span>
                                    Leer ahora
                                </Button>
                            </Link>

                            {isReader && (
                                <Button
                                    onClick={handleToggleFavorite}
                                    disabled={isAddingFavorite}
                                    className="bg-blue-50 text-blue-400 hover:bg-blue-50 font-bold w-full sm:w-auto"
                                >
                                    <span className="material-symbols-outlined">
                                        {isFavorite ? 'heart_minus' : 'favorite'}
                                    </span>
                                    {isAddingFavorite
                                        ? 'Procesando...'
                                        : isFavorite
                                          ? 'Remover de favoritos'
                                          : 'Añadir a favoritos'}
                                </Button>
                            )}
                        </div>
                    </div>
                </article>
            </section>
            <section className="pt-12 sm:pt-20 lg:pt-30">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                        También te podría gustar
                    </h3>
                    <Link
                        className="text-sm font-medium hover:underline text-blue-500"
                        to={'/libros'}
                    >
                        Ver todo
                    </Link>
                </div>
                {relatedLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <p className="text-muted-foreground">
                            Cargando recomendaciones...
                        </p>
                    </div>
                ) : transformedBooks.length > 0 ? (
                    <BooksGrid books={transformedBooks} />
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <span className="material-symbols-outlined text-blue-300 text-6xl mb-3">
                            sentiment_satisfied
                        </span>
                        <p className="text-gray-500 dark:text-gray-400">
                            No hay libros relacionados disponibles por el
                            momento.
                        </p>
                    </div>
                )}
            </section>
        </MainContainer>
    );
};
