import type { Book } from '@/mocks/books.mock';
import { BookCard } from './BookCard';
import { BookCardWithMenu } from './BookCardWithMenu';

interface BooksGridProps {
    books: Book[];
    withMenu?: boolean;
    collectionName?: string;
    onToggleFavorite?: (id: string) => void;
    onToggleRead?: (id: string) => void;
    onAddToCollection?: (id: string) => void;
    onRemoveFromCollection?: (id: string) => void;
}

export const BooksGrid = ({
    books,
    withMenu = false,
    collectionName,
    onToggleFavorite,
    onToggleRead,
    onAddToCollection,
    onRemoveFromCollection,
}: BooksGridProps) => {
    const BookComponent = withMenu ? BookCardWithMenu : BookCard;

    return (
        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
            {books.map((book) => (
                <BookComponent
                    key={book.id}
                    id={book.id}
                    img={book.img}
                    title={book.title}
                    category={book.category}
                    author={book.author}
                    publicationYear={book.publicationYear}
                    {...(withMenu && {
                        isFavorite: book.isFavorite,
                        isRead: book.isRead,
                        collectionName,
                        onToggleFavorite,
                        onToggleRead,
                        onAddToCollection,
                        onRemoveFromCollection,
                    })}
                />
            ))}
        </div>
    );
};
