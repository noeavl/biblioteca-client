interface AuthorCardProps {
    firstName: string;
    lastName: string;
    img?: string;
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
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

    return (
        <div className="group text-center cursor-pointer">
            <div className="mx-auto h-32 w-32 overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-purple-500 dark:from-blue-600 dark:to-purple-700 flex items-center justify-center">
                {img ? (
                    <img
                        alt={`${firstName} ${lastName}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        src={`${
                            import.meta.env.VITE_API_URL
                        }/files/author/${img}`}
                    />
                ) : (
                    <span className="text-4xl font-bold text-white">
                        {initials}
                    </span>
                )}
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
        </div>
    );
};
