import { Link } from 'react-router';
import { CustomLogo } from '../../components/custom/CustomLogo';

export const CustomFooter = () => {
    return (
        <footer className="text-foreground border-t border-border">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-between space-y-6 md:flex-row md:space-y-0">
                    <div className="flex gap-1 items-end">
                        <CustomLogo />
                        <span className="text-sm text-muted-foreground">
                            ©2025
                        </span>
                    </div>

                    <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
                        <Link
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            to={'/'}
                        >
                            Acerca de nosotros
                        </Link>
                        <Link
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            to={'/'}
                        >
                            Contacto
                        </Link>
                        <Link
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            to={'/'}
                        >
                            Política de privacidad
                        </Link>
                        <Link
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            to={'/'}
                        >
                            Términos de servicio
                        </Link>
                    </nav>
                    <div className="flex items-center space-x-4">
                        <Link
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            to={'/'}
                        >
                            <i className="fab fa-facebook-f"></i>
                        </Link>
                        <Link
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            to={'/'}
                        >
                            <i className="fab fa-twitter"></i>
                        </Link>
                        <Link
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            to={'/'}
                        >
                            <i className="fab fa-instagram"></i>
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
