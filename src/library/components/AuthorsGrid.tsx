import type { AuthorCard as AuthorCardType } from '@/library/interfaces/author.interface';
import { AuthorCard } from './AuthorCard';

interface AuthorsGridProps {
    authors: AuthorCardType[];
    showQuantityBooks?: boolean;
}
export const AuthorsGrid = ({
    authors,
    showQuantityBooks,
}: AuthorsGridProps) => {
    return (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {authors.map((author) => (
                <AuthorCard
                    key={author._id}
                    firstName={author.firstName}
                    lastName={author.lastName}
                    showQuantityBooks={showQuantityBooks}
                    quantityBooks={author.quantityBooks}
                    img={author.img}
                ></AuthorCard>
            ))}
        </div>
    );
};
