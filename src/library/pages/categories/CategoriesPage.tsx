import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { CategoriesGrid } from '@/library/components/CategoriesGrid';
import { CustomPagination } from '@/library/components/CustomPagination';
import {
    FilterSideBar,
    type FilterConfig,
} from '@/library/components/FilterSidebar';
import { MainLayout } from '@/library/layouts/MainLayout';
import { getCategories } from '@/library/api/categories.api';
import type { BookCategory } from '@/library/interfaces/book.interface';
import { orderByItems } from '@/mocks/filters.mock';

const categoriesFilters: FilterConfig[] = [
    { type: 'radio', label: 'Ordernar Por', items: orderByItems },
];

const ITEMS_PER_PAGE = 12;

export const CategoriesPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [categories, setCategories] = useState<BookCategory[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Obtener página actual de los query params
    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    // Cargar categorías desde la API con paginación
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                setError(null);
                const skip = (currentPage - 1) * ITEMS_PER_PAGE;
                const response = await getCategories({
                    limit: ITEMS_PER_PAGE,
                    skip
                });
                setCategories(response.categories);
                setTotalPages(response.totalPages);
            } catch (err) {
                setError('Error al cargar las categorías');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [currentPage]);

    // Función para cambiar de página
    const handlePageChange = (page: number) => {
        setSearchParams({ page: page.toString() });
    };

    // Transformar categorías al formato esperado por CategoriesGrid
    const categoriesCards = categories.map(category => ({
        name: category.name,
        img: category.featuredBookCover
            ? `${import.meta.env.VITE_API_URL}/files/cover/${category.featuredBookCover}`
            : '',
        quantityBooks: category.books?.length || 0,
    }));

    return (
        <MainLayout
            title="Catálogo de Categorias"
            sidebar={<FilterSideBar filters={categoriesFilters} />}
        >
            <div className="space-y-6 sm:space-y-8">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-muted-foreground">Cargando categorías...</p>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-destructive">{error}</p>
                    </div>
                ) : categoriesCards.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-muted-foreground">No se encontraron categorías</p>
                    </div>
                ) : (
                    <>
                        <CategoriesGrid
                            categories={categoriesCards}
                            showQuantityBooks={true}
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
        </MainLayout>
    );
};
