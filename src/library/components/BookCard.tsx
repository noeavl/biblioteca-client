import { Link } from 'react-router';

interface BookProps {
    id: string;
    title: string;
    publicationYear: number;
    author: string;
    category: string;
    img: string | null;
}

export const BookCard = ({
    id,
    title,
    publicationYear,
    author,
    category,
    img,
}: BookProps) => {
    return (
        <Link
            to={`/libros/detalle/${id}`}
            className="group rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col bg-card border"
        >
            <div className="relative h-48 sm:h-52 md:h-56 lg:h-60 xl:h-64 bg-muted">
                {img ? (
                    <img
                        className="w-full h-full object-cover object-center"
                        src={img}
                        alt={title}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-6xl">
                            book
                        </span>
                    </div>
                )}
            </div>
            <div className="p-3 sm:p-4 flex-1 flex flex-col">
                <p className="text-xs sm:text-xs text-primary font-semibold mb-1">
                    {category}
                </p>
                <h3 className="font-bold text-foreground text-sm sm:text-base truncate mb-1">
                    {title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{author}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                    {publicationYear}
                </p>
            </div>
        </Link>
    );
};
