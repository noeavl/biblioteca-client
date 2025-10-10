import { Link } from 'react-router';

interface AuthorCardProps {
    firstName: string;
    lastName: string;
    img: string;
    showQuantityBooks?: boolean;
    quantityBooks?: number;
}
export const AuthorCard = ({
    firstName,
    lastName,
    img,
    quantityBooks,
    showQuantityBooks,
}: AuthorCardProps) => {
    return (
        <Link className="group text-center" to={'autores'}>
            <div className="mx-auto h-32 w-32 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <img
                    alt="Author avatar"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    src={img}
                />
            </div>
            <h4 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
                {`${firstName} ${lastName}`}
            </h4>
            {showQuantityBooks &&
                quantityBooks != undefined &&
                quantityBooks > 0 && (
                    <h5 className="text-blue-400 font-thin">
                        {quantityBooks} Libros
                    </h5>
                )}
        </Link>
    );
};
