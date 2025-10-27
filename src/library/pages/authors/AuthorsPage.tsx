import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { AuthorsGrid } from '@/library/components/AuthorsGrid';
import { CustomPagination } from '@/library/components/CustomPagination';
import {
    FilterSideBar,
    type FilterConfig,
} from '@/library/components/FilterSidebar';
import { MainLayout } from '@/library/layouts/MainLayout';
import { getAuthors } from '@/library/api/authors.api';
import { getCategories } from '@/library/api/categories.api';
import { orderByItems, type SortType } from '@/mocks/filters.mock';
import type { AuthorCard } from '@/library/interfaces/author.interface';
import type { BookCategory } from '@/library/interfaces/book.interface';

const ITEMS_PER_PAGE = 12;

export const AuthorsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [authors, setAuthors] = useState<AuthorCard[]>([]);
    const [categories, setCategories] = useState<BookCategory[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedSort, setSelectedSort] = useState<SortType>('recent');

    // Obtener página actual de los query params
    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    // Cargar autores desde la API con paginación y filtros
    useEffect(() => {
        const fetchAuthors = async () => {
            try {
                setLoading(true);
                setError(null);
                const skip = (currentPage - 1) * ITEMS_PER_PAGE;
                const response = await getAuthors({
                    limit: ITEMS_PER_PAGE,
                    skip,
                    categories: selectedCategories.length > 0 ? selectedCategories : undefined,
                    sort: selectedSort,
                });

                const authorsCards: AuthorCard[] = response.authors.map((author) => ({
                    _id: author._id,
                    firstName: author.person.firstName,
                    lastName: author.person.lastName,
                    img: author.fileName,
                    quantityBooks: author.books?.length || 0,
                }));

                setAuthors(authorsCards);
                setTotalPages(response.totalPages);
            } catch (err) {
                setError('Error al cargar los autores');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAuthors();
    }, [currentPage, selectedCategories, selectedSort]);

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

    // Función para cambiar de página
    const handlePageChange = (page: number) => {
        setSearchParams({ page: page.toString() });
    };

    // Manejar cambios en los filtros de categorías
    const handleCategoryChange = (categoryId: string, checked: boolean) => {
        setSelectedCategories((prev) => {
            if (checked) {
                return [...prev, categoryId];
            } else {
                return prev.filter((id) => id !== categoryId);
            }
        });
        // Resetear a la primera página cuando cambian los filtros
        setSearchParams({ page: '1' });
    };

    const handleSortChange = (sortValue: string) => {
        setSelectedSort(sortValue as SortType);
        setSearchParams({ page: '1' });
    };

    // Preparar filtros
    const authorFilters: FilterConfig[] = [
        {
            type: 'radio',
            label: 'Ordenar Por',
            items: orderByItems,
            onChange: handleSortChange,
        },
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
    ];

    return (
        <MainLayout
            title="Catálogo de Autores"
            sidebar={<FilterSideBar filters={authorFilters} />}
        >
            <div className="space-y-6 sm:space-y-8">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-muted-foreground">Cargando autores...</p>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-destructive">{error}</p>
                    </div>
                ) : authors.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-muted-foreground">No se encontraron autores</p>
                    </div>
                ) : (
                    <>
                        <AuthorsGrid authors={authors} showQuantityBooks={true} />
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
        </MainLayout>
    );
};
