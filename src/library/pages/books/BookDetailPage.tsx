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
            <section className="flex flex-row gap-8">
                <div className="h-100 w-78 shadow-md rounded-2xl">
                    <img
                        src={book.img}
                        alt={book.title}
                        className="w-full h-full object-cover object-center rounded-2xl"
                    />
                </div>
                <article>
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-8xl font-bold">{book.title}</h2>
                            <h3 className="text-4xl text-gray-400">
                                por{' '}
                                <span className="text-blue-400">
                                    {book.author}
                                </span>
                            </h3>
                        </div>
                        <div className="flex justify-start items-center gap-3">
                            <span className="text-blue-400 bg-blue-100 px-3 py-2 rounded-full">
                                {book.category}
                            </span>
                            <span className="text-gray-400">
                                Publicado en {book.publicationYear}
                            </span>
                        </div>
                        <p>{book.synopsis}</p>
                        <div className="flex gap-3">
                            <Button className="bg-blue-400 shadow-xl shadow-blue-200/50 hover:bg-blue-400 text-white font-bold">
                                <span className="material-symbols-outlined">
                                    book_5
                                </span>
                                Leer ahora
                            </Button>
                            <Button className="bg-blue-50 text-blue-400  hover:bg-blue-50 font-bold">
                                <span className="material-symbols-outlined">
                                    favorite
                                </span>
                                Añadir a favoritos
                            </Button>
                        </div>
                    </div>
                </article>
            </section>
            <section className="pt-30">
                <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                        También te podría gustar
                    </h3>
                    <Link
                        className="text-sm font-medium hover:underline text-blue-500"
                        to={{ pathname: 'libros' }}
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
