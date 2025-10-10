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
                <img
                    alt={name}
                    className="h-full w-full object-cover aspect-square transition-transform duration-300 group-hover:scale-105"
                    src={img}
                />

                <div className="absolute inset-0 bg-black/40"></div>

                <p className="absolute bottom-4 left-4 text-xl font-bold text-white">
                    {name}{' '}
                </p>
            </div>
            <p className="text-blue-400 font-thin">
                {showQuantityBooks &&
                    quantityBooks != undefined &&
                    quantityBooks > 0 &&
                    `${quantityBooks} Libros`}
            </p>
        </Link>
    );
};
