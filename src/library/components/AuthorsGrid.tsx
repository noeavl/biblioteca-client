import type { Author } from '@/mocks/authors.mock';
import { AuthorCard } from './AuthorCard';

interface AuthorsGridProps {
    authors: Author[];
}
export const AuthorsGrid = ({ authors }: AuthorsGridProps) => {
    return (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {authors.map((author) => (
                <AuthorCard
                    key={author.firstName}
                    firstName={author.firstName}
                    lastName={author.lastName}
                    img={author.img}
                ></AuthorCard>
            ))}
        </div>
    );
};
