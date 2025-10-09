import type { Book } from '@/mocks/books.mock';
import { BookCard } from './BookCard';
interface BooksGridProps {
    books: Book[];
}
export const BooksGrid = ({ books }: BooksGridProps) => {
    return (
        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
            {books.map((book) => (
                <BookCard
                    key={book.title}
                    img={book.img}
                    title={book.title}
                    category={book.author}
                    author={book.author}
                    publicationYear={book.publicationYear}
                ></BookCard>
            ))}
        </div>
    );
};
