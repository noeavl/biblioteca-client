import { Link } from 'react-router';

export const CustomLogo = () => {
    return (
        <Link to={'/'} className="flex-none items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-blue-500">
                {'BV'}
                book{''}
            </span>
        </Link>
    );
};
