import { createBrowserRouter } from 'react-router';
import { LibraryLayout } from './src/library/layouts/LibraryLayout';
import { HomePage } from './src/library/pages/home/HomePage';
import { MyLibraryPage } from '@/library/pages/my-library/MyLibraryPage';
import { CategoriesPage } from '@/library/pages/categories/CategoriesPage';
import { BooksPage } from '@/library/pages/books/BooksPage';
import { AuthorsPage } from '@/library/pages/authors/AuthorsPage';

export const appRouter = createBrowserRouter([
    {
        path: '/',
        Component: LibraryLayout,
        children: [
            {
                index: true,
                Component: HomePage,
            },
            {
                path: '/libros',
                Component: BooksPage,
            },
            {
                path: '/categorias',
                Component: CategoriesPage,
            },
            {
                path: '/autores',
                Component: AuthorsPage,
            },
            {
                path: '/mi-biblioteca',
                Component: MyLibraryPage,
            },
        ],
    },
    {
        path: '*',
        Component: HomePage,
    },
]);
