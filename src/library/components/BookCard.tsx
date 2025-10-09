import { Button } from '@/components/ui/button';

interface BookProps {
    title: string;
    publicationYear: number;
    author: string;
    category: string;
    img: string;
}

export const BookCard = ({
    title,
    publicationYear,
    author,
    category,
    img,
}: BookProps) => {
    return (
        <div className="group bg-white dark:bg-gray-800/50 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
            <div className="relative h-48 sm:h-52 md:h-56 lg:h-60 xl:h-64">
                <img
                    className="w-full h-full object-cover object-center"
                    src={img}
                    alt={title}
                />
                <div className="absolute top-2 right-2">
                    <Button className="size-7 sm:size-8 bg-white/80 dark:bg-gray-900/80 text-primary rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-900 transition-colors">
                        <span className="material-symbols-outlined text-blue-400 text-lg sm:text-xl">
                            favorite
                        </span>
                    </Button>
                </div>
            </div>
            <div className="p-3 sm:p-4 flex-1 flex flex-col">
                <p className="text-xs sm:text-xs text-blue-500 font-semibold mb-1">
                    {category}
                </p>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base truncate mb-1">
                    {title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                    {author}
                </p>
                <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500">
                    {publicationYear}
                </p>
            </div>
        </div>
    );
};
