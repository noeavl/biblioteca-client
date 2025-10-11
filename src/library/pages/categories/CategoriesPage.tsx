import { CategoriesGrid } from '@/library/components/CategoriesGrid';
import { CustomPagination } from '@/library/components/CustomPagination';
import {
    FilterSideBar,
    type FilterConfig,
} from '@/library/components/FilterSidebar';
import { MainLayout } from '@/library/layouts/MainLayout';
import { categories } from '@/mocks/categories.mock';
import { orderByItems } from '@/mocks/filters.mock';

const categoriesFilters: FilterConfig[] = [
    { type: 'radio', label: 'Ordernar Por', items: orderByItems },
];
export const CategoriesPage = () => {
    return (
        <MainLayout
            title="Catálogo de Categorias"
            sidebar={<FilterSideBar filters={categoriesFilters} />}
        >
            <div className="space-y-6 sm:space-y-8">
                <CategoriesGrid
                    categories={categories}
                    showQuantityBooks={true}
                />
                <CustomPagination />
            </div>
        </MainLayout>
    );
};
