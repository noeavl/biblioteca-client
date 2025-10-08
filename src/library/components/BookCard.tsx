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
        <div className="group bg-white dark:bg-gray-800/50 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="relative">
                <img src={img} alt={title} />
                <div className="absolute top-2 right-2">
                    <button className="size-8 bg-white/80 dark:bg-gray-900/80 text-primary rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-900 transition-colors">
                        <span className="material-symbols-outlined">
                            favorite
                        </span>
                    </button>
                </div>
            </div>
            <div className="p-4">
                <p className="text-xs text-blue-500 font-semibold mb-1">
                    {category}
                </p>
                <h3 className="font-bold text-gray-900 dark:text-white text-base truncate">
                    {title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {author}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                    {publicationYear}
                </p>
            </div>
        </div>
    );
};
