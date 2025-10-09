import { Link } from 'react-router';

interface AuthorCardProps {
    firstName: string;
    lastName: string;
    img: string;
}
export const AuthorCard = ({ firstName, lastName, img }: AuthorCardProps) => {
    return (
        <div className="group text-center">
            <Link to={{ pathname: '/authores' }}>
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
            </Link>
        </div>
    );
};
