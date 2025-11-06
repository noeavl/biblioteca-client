import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { BooksGrid } from '@/library/components/BooksGrid';
import { BooksGridSkeleton } from '@/library/components/BooksGridSkeleton';
import { CustomPagination } from '@/library/components/CustomPagination';
import {
    FilterSideBar,
    type FilterConfig,
} from '@/library/components/FilterSidebar';
import { MainLayout } from '@/library/layouts/MainLayout';
import { getBooks } from '@/library/api/books.api';
import { getCategories } from '@/library/api/categories.api';
import { getAuthors } from '@/library/api/authors.api';
import type { Book, BookCategory } from '@/library/interfaces/book.interface';
import type { Author } from '@/library/interfaces/author.interface';
import { orderByItems, type SortType } from '@/mocks/filters.mock';
import { getFavorites } from '@/library/api/favorites.api';
import { getReadingHistory } from '@/library/api/reading-history.api';
import { useAuth } from '@/auth/hooks/useAuth';
import { toast } from 'sonner';
import { AddToCollectionDialog } from '@/library/components/AddToCollectionDialog';
import { useBookActions } from '@/library/hooks/useBookActions';

const ITEMS_PER_PAGE = 12;

export const BooksPage = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [categories, setCategories] = useState<BookCategory[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filtersLoading, setFiltersLoading] = useState(true);

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
    const [selectedSort, setSelectedSort] = useState<SortType>('recent');
    const [books, setBooks] = useState<Book[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [collectionDialogOpen, setCollectionDialogOpen] = useState<boolean>(false);
    const [selectedBookForCollection, setSelectedBookForCollection] = useState<{ id: string; title: string } | null>(null);

    // Obtener página actual de los query params
    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const isReader = user?.role?.name === 'reader';

    // Hook optimizado para manejar favoritos y leídos
    const {
        favoriteBookIds,
        readBookIds,
        toggleFavorite,
        toggleRead,
        setFavoriteBookIds,
        setReadBookIds,
    } = useBookActions();

    // Cargar libros desde la API con filtros del lado del servidor
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                setLoading(true);
                setError(null);

                // Calcular skip basado en la página actual
                const skip = (currentPage - 1) * ITEMS_PER_PAGE;

                const response = await getBooks({
                    limit: ITEMS_PER_PAGE,
                    skip,
                    authors:
                        selectedAuthors.length > 0
                            ? selectedAuthors
                            : undefined,
                    categories:
                        selectedCategories.length > 0
                            ? selectedCategories
                            : undefined,
                    sort: selectedSort,
                    status: 'true',
                });

                setBooks(response.books);
                setTotalPages(response.totalPages);
            } catch (err) {
                setError('Error al cargar los libros');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, [currentPage, selectedAuthors, selectedCategories, selectedSort]);

    // Cargar categorías y autores para filtros en paralelo
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                setFiltersLoading(true);
                // Ejecutar ambas peticiones en paralelo para mejor rendimiento
                const [categoriesResponse, authorsResponse] = await Promise.all(
                    [
                        getCategories({ hasBooks: true }),
                        getAuthors({ hasBooks: true }),
                    ]
                );

                setCategories(categoriesResponse.categories);
                setAuthors(authorsResponse.authors);
            } catch (error) {
                console.error('Error al cargar los filtros:', error);
            } finally {
                setFiltersLoading(false);
            }
        };

        fetchFilters();
    }, []);

    // Cargar favoritos y leídos del usuario (solo para readers)
    useEffect(() => {
        const loadUserBookStates = async () => {
            if (!isReader) return;

            try {
                const [favoritesResponse, readingHistoryResponse] = await Promise.all([
                    getFavorites(),
                    getReadingHistory(),
                ]);

                const favoriteIds = new Set(favoritesResponse.favorites.map((fav) => fav.book._id));
                setFavoriteBookIds(favoriteIds);

                const readIds = new Set(readingHistoryResponse.readingHistory.map((item) => item.book._id));
                setReadBookIds(readIds);
            } catch (error) {
                console.error('Error al cargar estados de libros del usuario:', error);
            }
        };

        loadUserBookStates();
    }, [isReader]);

    // Función para cambiar de página
    const handlePageChange = (page: number) => {
        setSearchParams({ page: page.toString() });
    };

    const handleToggleFavorite = async (bookId: string) => {
        if (!isReader) {
            toast.error('Solo los lectores pueden agregar libros a favoritos');
            return;
        }
        await toggleFavorite(bookId);
    };

    const handleToggleRead = async (bookId: string) => {
        if (!isReader) {
            toast.error('Solo los lectores pueden marcar libros como leídos');
            return;
        }
        await toggleRead(bookId);
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

    // Handlers para los filtros - ahora usan IDs
    const handleCategoryChange = (categoryId: string, checked: boolean) => {
        setSelectedCategories((prev) =>
            checked
                ? [...prev, categoryId]
                : prev.filter((c) => c !== categoryId)
        );
        setSearchParams({ page: '1' }); // Reset a página 1 al filtrar
    };

    const handleAuthorChange = (authorId: string, checked: boolean) => {
        setSelectedAuthors((prev) =>
            checked ? [...prev, authorId] : prev.filter((a) => a !== authorId)
        );
        setSearchParams({ page: '1' }); // Reset a página 1 al filtrar
    };

    const handleSortChange = (sortValue: string) => {
        setSelectedSort(sortValue as SortType);
        setSearchParams({ page: '1' }); // Reset a página 1 al cambiar ordenamiento
    };

    // Preparar filtros
    const bookFilters: FilterConfig[] = [
        {
            type: 'radio',
            label: 'Ordenar Por',
            items: orderByItems,
            onChange: handleSortChange,
        },
        ...(filtersLoading
            ? []
            : [
                  {
                      type: 'checkbox' as const,
                      label: 'Categorías',
                      items: categories.map((category) => ({
                          name: category.name,
                          id: category._id,
                          quantityBooks: category.books?.length || 0,
                      })),
                      onChange: (categoryId: string, checked?: boolean) => {
                          handleCategoryChange(categoryId, checked ?? false);
                      },
                  },
                  {
                      type: 'checkbox' as const,
                      label: 'Autores',
                      items: authors.map((author) => ({
                          name: `${author.person.firstName} ${author.person.lastName}`,
                          id: author._id,
                          quantityBooks: author.books?.length || 0,
                      })),
                      onChange: (authorId: string, checked?: boolean) => {
                          handleAuthorChange(authorId, checked ?? false);
                      },
                  },
              ]),
    ];

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
        isRead: readBookIds.has(book._id),
    }));

    return (
        <MainLayout
            title="Catálogo de Libros"
            sidebar={
                <FilterSideBar
                    filters={bookFilters}
                    isLoading={filtersLoading}
                />
            }
        >
            <div className="space-y-6 sm:space-y-8">
                {loading ? (
                    <BooksGridSkeleton count={ITEMS_PER_PAGE} />
                ) : error ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-destructive">{error}</p>
                    </div>
                ) : transformedBooks.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-muted-foreground">
                            No se encontraron libros
                        </p>
                    </div>
                ) : (
                    <>
                        <BooksGrid
                            books={transformedBooks}
                            withMenu
                            onToggleFavorite={handleToggleFavorite}
                            onToggleRead={handleToggleRead}
                            onAddToCollection={handleAddToCollection}
                        />
                        {totalPages > 1 && (
                            <CustomPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </>
                )}
            </div>

            {selectedBookForCollection && (
                <AddToCollectionDialog
                    open={collectionDialogOpen}
                    onOpenChange={setCollectionDialogOpen}
                    bookId={selectedBookForCollection.id}
                    bookTitle={selectedBookForCollection.title}
                />
            )}
        </MainLayout>
    );
};
