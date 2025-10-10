import { BooksGrid } from '@/library/components/BooksGrid';
import { CustomPagination } from '@/library/components/CustomPagination';
import {
    FilterSideBar,
    type FilterConfig,
} from '@/library/components/FilterSidebar';
import { MainLayout } from '@/library/layouts/MainLayout';
import { authors } from '@/mocks/authors.mock';
import { books } from '@/mocks/books.mock';
import { categories } from '@/mocks/categories.mock';

const OrderByItems = [
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

const bookFilters: FilterConfig[] = [
    { type: 'radio', label: 'Ordenar Por', items: OrderByItems },
    { type: 'checkbox', label: 'Categorías', items: categories },
    {
        type: 'checkbox',
        label: 'Autores',
        items: authors.map((author) => ({
            name: author.firstName + ' ' + author.lastName,
            quantityBooks: author.quantityBooks,
        })),
    },
];

export const BooksPage = () => {
    return (
        <MainLayout
            title="Catálogo de Libros"
            sidebar={<FilterSideBar filters={bookFilters} />}
        >
            <div className="space-y-6 sm:space-y-8">
                <BooksGrid books={books}></BooksGrid>
                <CustomPagination />
            </div>
        </MainLayout>
    );
};
