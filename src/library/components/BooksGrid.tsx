import type { Book } from '@/mocks/books.mock';
import { BookCard } from './BookCard';
interface BooksGridProps {
    books: Book[];
}
export const BooksGrid = ({ books }: BooksGridProps) => {
    return (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
