import { Link } from 'react-router';

interface CategoryProps {
    name: string;
    img: string;
    showQuantityBooks?: boolean;
    quantityBooks?: number;
}
export const CategoryCard = ({
    name,
    img,
    quantityBooks,
    showQuantityBooks,
}: CategoryProps) => {
    return (
        <Link className="group" to={'/'}>
            <div className="relative overflow-hidden rounded-lg mb-3">
                {img ? (
                    <img
                        alt={name}
                        className="h-full w-full object-cover aspect-square transition-transform duration-300 group-hover:scale-105"
                        src={img}
                    />
                ) : (
                    <div className="h-full w-full aspect-square bg-blue-500 flex items-center justify-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-16 w-16 text-white/60"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                        </svg>
                    </div>
                )}

                <div className="absolute inset-0 bg-foreground/40"></div>

                <span className="absolute bottom-4 left-4 text-xl font-bold text-primary-foreground">
                    {name}{' '}
                </span>
            </div>
            <p className="text-primary font-thin">
                {showQuantityBooks &&
                    quantityBooks != undefined &&
                    quantityBooks > 0 &&
                    `${quantityBooks} Libros`}
            </p>
        </Link>
    );
};
