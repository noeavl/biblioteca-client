import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { BooksGrid } from '@/library/components/BooksGrid';
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

const orderByItems = [
    {
        name: 'Popularidad',
    },
    {
        name: 'Recientes',
    },
    {
        name: 'Alfabético (A-Z)',
    },
    {
        name: 'Alfabético (Z-A)',
    },
];

const ITEMS_PER_PAGE = 10;

export const BooksPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [categories, setCategories] = useState<BookCategory[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
    const [allBooks, setAllBooks] = useState<Book[]>([]);

    // Obtener página actual de los query params
    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    // Cargar todos los libros desde la API
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                setLoading(true);
                setError(null);
                // Cargar todos los libros sin paginación para filtrar en el cliente
                const response = await getBooks({
                    limit: 1000, // Límite alto para obtener todos
                    skip: 0
                });
                setAllBooks(response.books);
            } catch (err) {
                setError('Error al cargar los libros');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    // Cargar categorías para filtros
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategories();
                setCategories(response.categories);
            } catch (error) {
                console.error('Error al cargar las categorías:', error);
            }
        };

        fetchCategories();
    }, []);

    // Cargar autores para filtros
    useEffect(() => {
        const fetchAuthors = async () => {
            try {
                const response = await getAuthors();
                setAuthors(response.authors);
            } catch (error) {
                console.error('Error al cargar los autores:', error);
            }
        };

        fetchAuthors();
    }, []);

    // Función para cambiar de página
    const handlePageChange = (page: number) => {
        setSearchParams({ page: page.toString() });
    };

    const handleToggleFavorite = (id: string) => {
        console.log('Toggle favorite:', id);
        // TODO: Implementar lógica para añadir/remover de favoritos
    };

    const handleToggleRead = (id: string) => {
        console.log('Toggle read:', id);
        // TODO: Implementar lógica para marcar como leído/no leído
    };

    const handleAddToCollection = (id: string) => {
        console.log('Add to collection:', id);
        // TODO: Implementar lógica para añadir a colección
    };

    // Filtrar libros según categorías y autores seleccionados
    const filteredBooks = allBooks.filter((book) => {
        const categoryMatch = selectedCategories.length === 0 ||
            selectedCategories.includes(book.category.name);
        const authorMatch = selectedAuthors.length === 0 ||
            selectedAuthors.includes(`${book.author.person.firstName} ${book.author.person.lastName}`);
        return categoryMatch && authorMatch;
    });

    // Calcular paginación del lado del cliente
    const totalFilteredPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

    // Handlers para los filtros
    const handleCategoryChange = (categoryName: string, checked: boolean) => {
        setSelectedCategories(prev =>
            checked ? [...prev, categoryName] : prev.filter(c => c !== categoryName)
        );
        setSearchParams({ page: '1' }); // Reset a página 1 al filtrar
    };

    const handleAuthorChange = (authorName: string, checked: boolean) => {
        setSelectedAuthors(prev =>
            checked ? [...prev, authorName] : prev.filter(a => a !== authorName)
        );
        setSearchParams({ page: '1' }); // Reset a página 1 al filtrar
    };

    // Preparar filtros
    const bookFilters: FilterConfig[] = [
        { type: 'radio', label: 'Ordenar Por', items: orderByItems },
        {
            type: 'checkbox',
            label: 'Categorías',
            items: categories.map((category) => ({
                name: category.name,
                id: category._id,
                quantityBooks: category.books?.length || 0,
            })),
            onChange: handleCategoryChange,
        },
        {
            type: 'checkbox',
            label: 'Autores',
            items: authors.map((author) => ({
                name: `${author.person.firstName} ${author.person.lastName}`,
                quantityBooks: author.books?.length || 0,
            })),
            onChange: handleAuthorChange,
        },
    ];

    // Transformar libros al formato esperado por BooksGrid
    const transformedBooks = paginatedBooks.map((book) => ({
        id: book._id,
        title: book.title,
        publicationYear: book.publicationYear,
        author: `${book.author.person.firstName} ${book.author.person.lastName}`,
        category: book.category.name,
        img: book.coverImage
            ? `${import.meta.env.VITE_API_URL}/files/cover/${book.coverImage}`
            : null,
        isFavorite: false, // TODO: Implementar lógica de favoritos
        isRead: false, // TODO: Implementar lógica de leído
    }));

    return (
        <MainLayout
            title="Catálogo de Libros"
            sidebar={<FilterSideBar filters={bookFilters} />}
        >
            <div className="space-y-6 sm:space-y-8">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-muted-foreground">Cargando libros...</p>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-destructive">{error}</p>
                    </div>
                ) : transformedBooks.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-muted-foreground">No se encontraron libros</p>
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
                        {totalFilteredPages > 1 && (
                            <CustomPagination
                                currentPage={currentPage}
                                totalPages={totalFilteredPages}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </>
                )}
            </div>
        </MainLayout>
    );
};
