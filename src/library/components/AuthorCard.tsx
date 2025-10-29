import { Link } from 'react-router';

interface AuthorCardProps {
    id: string;
    firstName: string;
    lastName: string;
    img?: string;
    showQuantityBooks?: boolean;
    quantityBooks?: number;
}
export const AuthorCard = ({
    id,
    firstName,
    lastName,
    img,
    quantityBooks,
    showQuantityBooks,
}: AuthorCardProps) => {
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

    return (
        <div className="group text-center cursor-pointer">
            <Link to={`/autores/detalle/${id}`}>
                <div className="mx-auto h-32 w-32 overflow-hidden rounded-full bg-gradient-to-br from-primary/60 to-primary flex items-center justify-center bg-gray-400">
                    {img ? (
                        <img
                            alt={`${firstName} ${lastName}`}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            src={`${
                                import.meta.env.VITE_API_URL
                            }/files/author/${img}`}
                        />
                    ) : (
                        <span className="text-4xl font-bold text-blue-50">
                            {initials}
                        </span>
                    )}
                </div>
                <h4 className="mt-4 text-base font-semibold text-foreground">
                    {`${firstName} ${lastName}`}
                </h4>
                {showQuantityBooks &&
                    quantityBooks != undefined &&
                    quantityBooks > 0 && (
                        <h5 className="text-muted-foreground font-thin">
                            {quantityBooks} Libros
                        </h5>
                    )}
            </Link>
        </div>
    );
};
