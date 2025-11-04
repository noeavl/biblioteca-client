import { Skeleton } from '@/components/ui/skeleton';

export const BookCardSkeleton = () => (
    <div className="bg-card rounded-lg shadow-md overflow-hidden h-full flex flex-col border border-foreground/30">
        {/* Image skeleton */}
        <Skeleton className="h-48 sm:h-52 md:h-56 lg:h-60 xl:h-64 w-full rounded-none" />

        {/* Content skeleton */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col space-y-2">
            {/* Category */}
            <Skeleton className="h-3 w-20" />
            {/* Title */}
            <Skeleton className="h-4 w-full" />
            {/* Author */}
            <Skeleton className="h-3 w-2/3" />
            {/* Year */}
            <Skeleton className="h-3 w-16" />
        </div>
    </div>
);
