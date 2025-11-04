import { BookCardSkeleton } from './BookCardSkeleton';

interface BooksGridSkeletonProps {
    count?: number;
}

export const BooksGridSkeleton = ({ count = 10 }: BooksGridSkeletonProps) => (
    <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
        {Array.from({ length: count }).map((_, index) => (
            <BookCardSkeleton key={index} />
        ))}
    </div>
);
