import { Link } from 'react-router';
import { CustomLogo } from '../../components/custom/CustomLogo';
import { Button } from '@/components/ui/button';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group';
import { Search } from 'lucide-react';
import { useAuth } from '@/auth/hooks/useAuth';

export const CustomHeader = () => {
    const { isAuthenticated, user } = useAuth();
    const canAccessPanel = user?.role === 'admin' || user?.role === 'librarian';
    return (
        <header className="sticky z-50 top-0 w-full mx-auto px-4 sm:px-6 lg:px-8 border-b bg-white">
            <div className="flex my-10 items-center justify-between space-x-8">
                <CustomLogo />
                <div className="grow max-w hidden md:block">
                    <InputGroup className="bg-white text-primary h-10">
                        <InputGroupInput
                            className="text-sm"
                            placeholder="Buscar libros, autores o categorias..."
                        ></InputGroupInput>
                        <InputGroupAddon>
                            <Search className="w-4 h-4" />
                        </InputGroupAddon>
                    </InputGroup>
                </div>
                <div className="flex-none items-center space-x-2">
                    <div className="sm:hidden">
                        {/* simple menu button for mobile (visual placeholder) */}
                        <button aria-label="menu" className="p-2 rounded-md">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                    </div>
                    <div className="hidden sm:flex">
                        {!isAuthenticated && (
                            <Button variant={'link'}>
                                <Link to={'iniciar-sesion'}>Iniciar Sesión</Link>
                            </Button>
                        )}
                        {isAuthenticated && canAccessPanel && (
                            <Button variant={'link'}>
                                <Link to={'/panel'}>Panel</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
            <div className="pb-6">
                <nav className="hidden lg:flex justify-start space-x-8">
                    <Link to={'/libros'}>Libros</Link>
                    <Link to={'/categorias'}>Categorías</Link>
                    <Link to={'/autores'}>Autores</Link>
                    <Link to={'/mi-biblioteca'}>Mi biblioteca</Link>
                </nav>
            </div>
        </header>
    );
};
