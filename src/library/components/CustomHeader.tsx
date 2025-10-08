import { Link } from 'react-router';
import { CustomLogo } from '../../components/custom/CustomLogo';
import { Button } from '@/components/ui/button';

export const CustomHeader = () => {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white">
            <div className="container mx-auto">
                <div className="flex h-20 items-center justify-between">
                    <CustomLogo />
                    <nav className="flex justify-center space-x-8">
                        <Link to={{ pathname: '/' }}>Inicio</Link>
                        <Link to={{ pathname: '/libros' }}>Libros</Link>
                        <Link to={{ pathname: '/categorias' }}>Categorías</Link>
                        <Link to={{ pathname: '/autores' }}>Autores</Link>
                        <Link to={{ pathname: '/mi-biblioteca' }}>
                            Mi biblioteca
                        </Link>
                    </nav>
                    <div>
                        <Button variant={'link'}>
                            <Link to={{ pathname: '/iniciar-sesion' }}>
                                Iniciar Sesión
                            </Link>
                        </Button>
                        <Button variant={'link'}>
                            <Link to={{ pathname: '/panel' }}>Panel</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
};
