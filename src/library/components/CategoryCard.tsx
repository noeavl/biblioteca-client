import { Link } from 'react-router';

interface CategoryProps {
    name: string;
    img: string;
}
export const CategoryCard = ({ name, img }: CategoryProps) => {
    return (
        <Link className="group block" to={'/'}>
            <div className="relative overflow-hidden rounded-lg">
                <img
                    alt={name}
                    className="h-full w-full object-cover aspect-square transition-transform duration-300 group-hover:scale-105"
                    src={img}
                />
                <div className="absolute inset-0 bg-black/40"></div>
                <p className="absolute bottom-4 left-4 text-xl font-bold text-white">
                    {name}
                </p>
            </div>
        </Link>
    );
};
