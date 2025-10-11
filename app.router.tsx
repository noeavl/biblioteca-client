import { createBrowserRouter, Navigate } from 'react-router';
import { LibraryLayout } from './src/library/layouts/LibraryLayout';
import { HomePage } from './src/library/pages/home/HomePage';
import { MyLibraryPage } from '@/library/pages/my-library/MyLibraryPage';
import { CategoriesPage } from '@/library/pages/categories/CategoriesPage';
import { BooksPage } from '@/library/pages/books/BooksPage';
import { AuthorsPage } from '@/library/pages/authors/AuthorsPage';
import { BookDetailPage } from '@/library/pages/books/BookDetailPage';
import { books } from '@/mocks/books.mock';
import { LoginPage } from '@/library/pages/login/LoginPage';
import { FavoritesPage } from '@/library/pages/my-library/favorites/FavoritesPage';
import { ReadPage } from '@/library/pages/my-library/read/ReadPage';
import { CollectionsPage } from '@/library/pages/my-library/collections/CollectionsPage';

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
                path: 'iniciar-sesion',
                Component: LoginPage,
            },
            {
                path: 'libros',
                children: [
                    {
                        path: '',
                        Component: BooksPage,
                    },
                    {
                        path: 'detalle/:book',
                        Component: BookDetailPage,
                        loader: async ({ params }) => {
                            const bookFound = books.find(
                                (book) => book.id === params.book
                            );
                            return bookFound;
                        },
                    },
                ],
            },
            {
                path: 'categorias',
                Component: CategoriesPage,
            },
            {
                path: 'autores',
                Component: AuthorsPage,
            },
            {
                path: 'mi-biblioteca',
                Component: MyLibraryPage,
                children: [
                    {
                        index: true,
                        element: <Navigate to="favoritos" replace />
                    },
                    { path: 'favoritos', Component: FavoritesPage },
                    { path: 'leidos', Component: ReadPage },
                    { path: 'colecciones', Component: CollectionsPage },
                ],
            },
        ],
    },
    {
        path: 'panel',
    },
    {
        path: '*',
        Component: HomePage,
    },
]);
