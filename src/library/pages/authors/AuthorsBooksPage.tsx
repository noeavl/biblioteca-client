import { getAuthorById } from '@/library/api/authors.api';
import { getBooks } from '@/library/api/books.api';
import type { Author } from '@/library/interfaces/author.interface';
import type { Book } from '@/library/interfaces/book.interface';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { BookCard } from '@/library/components/BookCard';
import { CustomPagination } from '@/library/components/CustomPagination';
import { Skeleton } from '@/components/ui/skeleton';

const BOOKS_PER_PAGE = 12;

export const AuthorsBooksPage = () => {
    const { authorId } = useParams<{ authorId: string }>();
    const [author, setAuthor] = useState<Author | null>(null);
    const [books, setBooks] = useState<Book[]>([]);
    const [totalBooks, setTotalBooks] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingBooks, setLoadingBooks] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    // Cargar información del autor
    useEffect(() => {
        const fetchAuthor = async () => {
            if (!authorId) {
                setError('ID del autor no válido');
                setLoading(false);
                return;
            }

            try {
                const authorData = await getAuthorById(authorId);
                setAuthor(authorData);
            } catch (error) {
                setError('Error al cargar el autor');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchAuthor();
    }, [authorId]);

    // Cargar libros del autor con paginación
    useEffect(() => {
        const fetchBooks = async () => {
            if (!authorId) return;

            setLoadingBooks(true);
            try {
                const skip = (currentPage - 1) * BOOKS_PER_PAGE;
                const response = await getBooks({
                    authors: [authorId],
                    limit: BOOKS_PER_PAGE,
                    skip,
                });
                setBooks(response.books);
                setTotalBooks(response.total);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (error) {
                console.error('Error al cargar los libros:', error);
            } finally {
                setLoadingBooks(false);
            }
        };

        fetchBooks();
    }, [authorId, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-12">
                    <Skeleton className="w-32 h-32 sm:w-40 sm:h-40 rounded-full" />
                    <div className="flex-1 space-y-4">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-full max-w-2xl" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <Skeleton className="h-8 w-48 mb-6" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                    {[...Array(12)].map((_, i) => (
                        <Skeleton key={i} className="h-64 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    if (error || !author) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                        Autor no encontrado
                    </h2>
                    <p className="text-muted-foreground">{error}</p>
                </div>
            </div>
        );
    }

    const authorImageUrl = author.fileName
        ? `${import.meta.env.VITE_API_URL}/files/author/${author.fileName}`
        : null;
    const authorName = `${author.person.firstName} ${author.person.lastName}`;

    // Calcular paginación
    const totalPages = Math.ceil(totalBooks / BOOKS_PER_PAGE);

    return (
        <div className="container mx-auto px-4 sm:p-6 p-8">
            {/* Author Header Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 py-16">
                <div className="w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
                    {authorImageUrl ? (
                        <img
                            className="w-full h-full object-cover rounded-full"
                            src={authorImageUrl}
                            alt={authorName}
                        />
                    ) : (
                        <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-4xl font-bold text-white">
                                {author.person.firstName.charAt(0)}
                                {author.person.lastName.charAt(0)}
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        {authorName}
                    </h1>
                    <p className="text-muted-foreground text-sm sm:text-base mb-2">
                        Autor reconocido con {totalBooks}{' '}
                        {totalBooks === 1 ? 'libro' : 'libros'} en nuestro
                        catálogo.
                    </p>
                </div>
            </div>

            {/* Books Section */}
            <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
                    Books by {authorName}
                </h2>

                {loadingBooks ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                        {[...Array(BOOKS_PER_PAGE)].map((_, i) => (
                            <Skeleton key={i} className="h-64 w-full" />
                        ))}
                    </div>
                ) : totalBooks === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">
                            No hay libros disponibles de este autor.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                            {books.map((book) => (
                                <BookCard
                                    key={book._id}
                                    id={book._id}
                                    title={book.title}
                                    publicationYear={book.publicationYear}
                                    author={`${book.author.person.firstName} ${book.author.person.lastName}`}
                                    category={book.category.name}
                                    img={
                                        book.coverImage
                                            ? `${
                                                  import.meta.env.VITE_API_URL
                                              }/files/cover/${book.coverImage}`
                                            : null
                                    }
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center">
                                <CustomPagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
