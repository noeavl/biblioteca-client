import { createBrowserRouter, Navigate } from 'react-router';
import { LibraryLayout } from './src/library/layouts/LibraryLayout';
import { HomePage as LibraryHomePage } from './src/library/pages/home/HomePage';
import { HomePage as PanelHomePage } from '@/panel/pages/home/HomePage';
import { MyLibraryPage } from '@/library/pages/my-library/MyLibraryPage';
import { CategoriesPage } from '@/library/pages/categories/CategoriesPage';
import { CategoryDetailPage } from '@/library/pages/categories/CategoryDetailPage';
import { BooksPage } from '@/library/pages/books/BooksPage';
import { AuthorsPage } from '@/library/pages/authors/AuthorsPage';
import { BookDetailPage } from '@/library/pages/books/BookDetailPage';
import { LoginPage } from '@/library/pages/login/LoginPage';
import { FavoritesPage } from '@/library/pages/my-library/favorites/FavoritesPage';
import { ReadPage } from '@/library/pages/my-library/read/ReadPage';
import { CollectionsPage } from '@/library/pages/my-library/collections/CollectionsPage';
import { ReaderPage } from '@/library/pages/reader/ReaderPage';
import { PanelLayout } from '@/panel/layouts/PanelLayout';
import { UsersListPage } from '@/panel/pages/users/UsersListPage';
import { UsersCreatePage } from '@/panel/pages/users/UsersCreatePage';
import { UsersEditPage } from '@/panel/pages/users/UsersEditPage';
import { BooksListPage } from '@/panel/pages/books/BooksListPage';
import { BooksCreatePage } from '@/panel/pages/books/BooksCreatePage';
import { BooksEditPage } from '@/panel/pages/books/BooksEditPage';
import { BookDetailPage as PanelBookDetailPage } from '@/panel/pages/books/BookDetailPage';
import { CategoriesListPage } from '@/panel/pages/categories/CategoriesListPage';
import { CategoriesCreatePage } from '@/panel/pages/categories/CategoriesCreatePage';
import { CategoriesEditPage } from '@/panel/pages/categories/CategoriesEditPage';
import { AuthorsPage as PanelAuthorsPage } from '@/panel/pages/authors/AuthorsPage';
import { AuthorsCreatePage } from '@/panel/pages/authors/AuthorsCreatePage';
import { AuthorsEditPage } from '@/panel/pages/authors/AuthorsEditPage';
import { AuthorsBooksPage } from './src/library/pages/authors/AuthorsBooksPage';
import { ProtectedRoute } from '@/auth/components/ProtectedRoute';
import { ReaderRoute } from '@/auth/components/ReaderRoute';
import ProfilePage from '@/library/pages/profile/ProfilePage';

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
                path: 'perfil',
                element: (
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'libros',
                children: [
                    {
                        path: '',
                        Component: BooksPage,
                    },
                    {
                        path: 'detalle/:bookId',
                        Component: BookDetailPage,
                    },
                    {
                        path: 'lector/:bookId',
                        Component: ReaderPage,
                    },
                ],
            },
            {
                path: 'categorias',
                children: [
                    {
                        path: '',
                        Component: CategoriesPage,
                    },
                    {
                        path: 'detalle/:categoryId',
                        Component: CategoryDetailPage,
                    },
                ],
            },
            {
                path: 'autores',
                children: [
                    {
                        path: '',
                        Component: AuthorsPage,
                    },
                    {
                        path: 'detalle/:authorId',
                        Component: AuthorsBooksPage,
                    },
                ],
            },
            {
                path: 'mi-biblioteca',
                element: (
                    <ReaderRoute>
                        <MyLibraryPage />
                    </ReaderRoute>
                ),
                children: [
                    {
                        index: true,
                        element: <Navigate to="favoritos" replace />,
                    },
                    { path: 'favoritos', Component: FavoritesPage },
                    { path: 'leidos', Component: ReadPage },
                    { path: 'colecciones/:collectionId', Component: CollectionsPage },
                ],
            },
        ],
    },
    {
        path: 'panel',
        element: (
            <ProtectedRoute>
                <PanelLayout />
            </ProtectedRoute>
        ),
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
                        path: 'crear',
                        Component: UsersCreatePage,
                    },
                    {
                        path: 'editar/:user',
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
                    {
                        path: 'detalle/:bookId',
                        Component: PanelBookDetailPage,
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
                    {
                        path: 'crear',
                        Component: CategoriesCreatePage,
                    },
                    {
                        path: 'editar/:categoryId',
                        Component: CategoriesEditPage,
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
                    {
                        path: 'crear',
                        Component: AuthorsCreatePage,
                    },
                    {
                        path: 'editar/:authorId',
                        Component: AuthorsEditPage,
                    },
                ],
            },
        ],
    },
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
]);
