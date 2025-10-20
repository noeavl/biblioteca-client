import { createBrowserRouter, Navigate } from 'react-router';
import { LibraryLayout } from './src/library/layouts/LibraryLayout';
import { HomePage as LibraryHomePage } from './src/library/pages/home/HomePage';
import { HomePage as PanelHomePage } from '@/panel/pages/home/HomePage';
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
import { ReaderPage } from '@/library/pages/reader/ReaderPage';
import { PanelLayout } from '@/panel/layouts/PanelLayout';
import { UsersListPage } from '@/panel/pages/users/UsersListPage';
import { UsersEditPage } from '@/panel/pages/users/UsersEditPage';
import { BooksListPage } from '@/panel/pages/books/BooksListPage';
import { BooksCreatePage } from '@/panel/pages/books/BooksCreatePage';
import { BooksEditPage } from '@/panel/pages/books/BooksEditPage';
import { CategoriesListPage } from '@/panel/pages/categories/CategoriesListPage';
import { AuthorsPage as PanelAuthorsPage } from '@/panel/pages/authors/AuthorsPage';

export const appRouter = createBrowserRouter([
    {
        path: '/',
        Component: LibraryLayout,
        children: [
            {
                index: true,
                Component: LibraryHomePage,
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
                    {
                        path: 'lector/:book',
                        Component: ReaderPage,
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
                        element: <Navigate to="favoritos" replace />,
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
        Component: PanelLayout,
        children: [
            {
                Component: PanelHomePage,
                index: true,
            },
            {
                path: 'usuarios',
                children: [
                    {
                        index: true,
                        Component: UsersListPage,
                    },
                    {
                        path: 'edit/:user',
                        Component: UsersEditPage,
                    },
                ],
            },
            {
                path: 'libros',
                children: [
                    {
                        index: true,
                        Component: BooksListPage,
                    },
                    {
                        path: 'crear',
                        Component: BooksCreatePage,
                    },
                    {
                        path: 'editar/:bookId',
                        Component: BooksEditPage,
                    },
                ],
            },
            {
                path: 'categorias',
                children: [
                    {
                        index: true,
                        Component: CategoriesListPage,
                    },
                ],
            },
            {
                path: 'autores',
                children: [
                    {
                        index: true,
                        Component: PanelAuthorsPage,
                    },
                ],
            },
        ],
    },
    {
        path: '*',
        Component: LibraryHomePage,
    },
]);
