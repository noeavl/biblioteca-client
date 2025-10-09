import { Link } from 'react-router';
import { BooksGrid } from '@/library/components/BooksGrid';
import { books } from '@/mocks/books.mock';
import { CategoriesGrid } from '@/library/components/CategoriesGrid';
import { categories } from '@/mocks/categories.mock';
import { AuthorsGrid } from '@/library/components/AuthorsGrid';
import { authors } from '@/mocks/authors.mock';
import homeSectionSearchImg from '@/assets/home-section-search.webp';

export const HomePage = () => {
    return (
        <>
            {/* Sección de bienvenida */}
            <section className="h-[calc(100vh-4rem)] relative overflow-hidden">
                <img
                    src={homeSectionSearchImg}
                    className="absolute inset-0 scale-110 backdrop-blur-md object-cover object-center w-full h-full"
                    alt="Descubre un mundo de historias"
                />
                <div className="absolute inset-0 w-full h-full bg-black/30 backdrop-blur-sm"></div>
                <div className="absolute inset-0 w-full h-full flex flex-col justify-center items-center text-white space-y-6 px-4">
                    <h1 className="font-bold text-4xl sm:text-6xl text-center leading-tight">
                        Descubre un mundo de historias
                    </h1>
                    <p className="text-lg sm:text-2xl font-thin text-center max-w-2xl">
                        Explora nuestra colección de libros y sumergete en
                        nuevas aventuras
                    </p>
                </div>
            </section>
            <section className="py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Destacados
                        </h3>
                        <Link
                            className="text-sm font-medium hover:underline text-blue-500"
                            to={{ pathname: '/libros' }}
                        >
                            Ver todo
                        </Link>
                    </div>
                    <BooksGrid books={books}></BooksGrid>
                </div>
            </section>
            <section className="bg-background-light pb-16 sm:pb-24 dark:bg-background-dark/50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Autores Populares
                        </h3>
                        <Link
                            className="text-sm font-medium hover:underline text-blue-500"
                            to={{ pathname: '/autores' }}
                        >
                            Ver todo
                        </Link>
                    </div>
                    <AuthorsGrid authors={authors} />
                </div>
            </section>
            <section className="bg-background-light pb-16 sm:pb-24 dark:bg-background-dark/50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Explorar por categoría
                        </h3>
                        <Link
                            className="text-sm font-medium hover:underline text-blue-500"
                            to={{ pathname: '/categorias' }}
                        >
                            Ver todo
                        </Link>
                    </div>
                    <CategoriesGrid categories={categories}></CategoriesGrid>
                </div>
            </section>
        </>
    );
};
