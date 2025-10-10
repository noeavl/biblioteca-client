import { AuthorsGrid } from '@/library/components/AuthorsGrid';
import { CustomPagination } from '@/library/components/CustomPagination';
import {
    FilterSideBar,
    type FilterConfig,
} from '@/library/components/FilterSidebar';
import { MainLayout } from '@/library/layouts/MainLayout';
import { authors } from '@/mocks/authors.mock';
import { categories } from '@/mocks/categories.mock';
import { OrderByItems } from '@/mocks/filters.mock';

const authorFilters: FilterConfig[] = [
    { type: 'radio', label: 'Ordernar Por', items: OrderByItems },
    { type: 'checkbox', label: 'Categorías', items: categories },
];

export const AuthorsPage = () => {
    return (
        <MainLayout
            title="Catálogo de Autores"
            sidebar={<FilterSideBar filters={authorFilters} />}
        >
            <div className="space-y-6 sm:space-y-8">
                <AuthorsGrid authors={authors} showQuantityBooks={true} />
                <CustomPagination />
            </div>
        </MainLayout>
    );
};
