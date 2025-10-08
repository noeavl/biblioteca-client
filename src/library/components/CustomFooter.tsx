import { Link } from 'react-router';

export const CustomFooter = () => {
    return (
        <footer className="bg-white dark:bg-[#101922] text-slate-800 dark:text-white border-t border-slate-200 dark:border-slate-800">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-between space-y-6 md:flex-row md:space-y-0">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-2xl text-blue-500">
                            {'BV'}
                            book{'MEZE'}
                        </span>
                        <span className="text-sm font-thin">BVMEZE © 2025</span>
                    </div>
                    <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
                        <Link
                            className="hover:text-primary"
                            to={{ pathname: '/' }}
                        >
                            Acerca de nosotros
                        </Link>
                        <Link
                            className="hover:text-primary"
                            to={{ pathname: '/' }}
                        >
                            Contacto
                        </Link>
                        <Link
                            className="hover:text-primary"
                            to={{ pathname: '/' }}
                        >
                            Política de privacidad
                        </Link>
                        <Link
                            className="hover:text-primary"
                            to={{ pathname: '/' }}
                        >
                            Términos de servicio
                        </Link>
                    </nav>
                    <div className="flex items-center space-x-4">
                        <Link
                            className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white"
                            to={{ pathname: '/' }}
                        >
                            <i className="fab fa-facebook-f"></i>
                        </Link>
                        <Link
                            className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white"
                            to={{ pathname: '/' }}
                        >
                            <i className="fab fa-twitter"></i>
                        </Link>
                        <Link
                            className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white"
                            to={{ pathname: '/' }}
                        >
                            <i className="fab fa-instagram"></i>
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
