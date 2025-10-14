import { Button } from '@/components/ui/button';
import { BooksGrid } from '@/library/components/BooksGrid';
import { MainContainer } from '@/library/components/MainContainer';
import { books, type Book } from '@/mocks/books.mock';
import { Link, useLoaderData } from 'react-router';

export const BookDetailPage = () => {
    const book = useLoaderData<Book>();

    if (!book) {
        return <div>Libro no encontrado</div>;
    }

    return (
        <MainContainer>
            <section className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
                <div className="h-64 w-full sm:h-80 sm:w-60 lg:h-100 lg:w-78 shadow-md rounded-2xl shrink-0 mx-auto lg:mx-0">
                    <img
                        src={book.img}
                        alt={book.title}
                        className="w-full h-full object-cover object-center rounded-2xl"
                    />
                </div>
                <article className="flex-1">
                    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                        <div>
                            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-bold">
                                {book.title}
                            </h2>
                            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gray-400">
                                por{' '}
                                <span className="text-blue-400">
                                    {book.author}
                                </span>
                            </h3>
                        </div>
                        <div className="flex flex-wrap justify-start items-center gap-2 sm:gap-3">
                            <span className="text-sm sm:text-base text-blue-400 bg-blue-100 px-3 py-2 rounded-full">
                                {book.category}
                            </span>
                            <span className="text-sm sm:text-base text-gray-400">
                                Publicado en {book.publicationYear}
                            </span>
                        </div>
                        <p className="text-sm sm:text-base leading-relaxed">
                            {book.synopsis}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link to={`/libros/lector/${book.id}`}>
                                <Button className="bg-blue-400 shadow-xl shadow-blue-200/50 hover:bg-blue-400 text-white font-bold w-full sm:w-auto">
                                    <span className="material-symbols-outlined">
                                        book_5
                                    </span>
                                    Leer ahora
                                </Button>
                            </Link>

                            <Button className="bg-blue-50 text-blue-400 hover:bg-blue-50 font-bold w-full sm:w-auto">
                                <span className="material-symbols-outlined">
                                    favorite
                                </span>
                                Añadir a favoritos
                            </Button>
                        </div>
                    </div>
                </article>
            </section>
            <section className="pt-12 sm:pt-20 lg:pt-30">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                        También te podría gustar
                    </h3>
                    <Link
                        className="text-sm font-medium hover:underline text-blue-500"
                        to={'/libros'}
                    >
                        Ver todo
                    </Link>
                </div>
                <BooksGrid
                    books={books.filter((b) => b.id !== book.id)}
                ></BooksGrid>
            </section>
        </MainContainer>
    );
};
