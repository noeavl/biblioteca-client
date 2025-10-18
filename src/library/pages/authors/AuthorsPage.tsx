import { useState, useEffect } from 'react';
import { AuthorsGrid } from '@/library/components/AuthorsGrid';
import { CustomPagination } from '@/library/components/CustomPagination';
import {
    FilterSideBar,
    type FilterConfig,
} from '@/library/components/FilterSidebar';
import { MainLayout } from '@/library/layouts/MainLayout';
import { categories } from '@/mocks/categories.mock';
import { orderByItems } from '@/mocks/filters.mock';
import { getAuthors } from '@/library/api/authors.api';
import type { AuthorCard } from '@/library/interfaces/author.interface';

const authorFilters: FilterConfig[] = [
    { type: 'radio', label: 'Ordernar Por', items: orderByItems },
    { type: 'checkbox', label: 'Categorías', items: categories },
];

export const AuthorsPage = () => {
    const [authors, setAuthors] = useState<AuthorCard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuthors = async () => {
            try {
                const data = await getAuthors();
                const authorsCards: AuthorCard[] = data
                    .filter((author) => author.books.length > 0)
                    .map((author) => ({
                        _id: author._id,
                        firstName: author.person.firstName,
                        lastName: author.person.lastName,
                        img: author.fileName
                            ? `${import.meta.env.VITE_API_URL}/files/author/${author.fileName}`
                            : undefined,
                        quantityBooks: author.books.length,
                    }));
                setAuthors(authorsCards);
            } catch (error) {
                console.error('Error al cargar autores:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAuthors();
    }, []);

    return (
        <MainLayout
            title="Catálogo de Autores"
            sidebar={<FilterSideBar filters={authorFilters} />}
        >
            <div className="space-y-6 sm:space-y-8">
                {loading ? (
                    <p className="text-center">Cargando autores...</p>
                ) : (
                    <AuthorsGrid authors={authors} showQuantityBooks={true} />
                )}
                <CustomPagination />
            </div>
        </MainLayout>
    );
};
