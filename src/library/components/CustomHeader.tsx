import { Link, useNavigate } from 'react-router';
import { CustomLogo } from '../../components/custom/CustomLogo';
import { Button } from '@/components/ui/button';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group';
import { Search, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/auth/hooks/useAuth';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const CustomHeader = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const canAccessPanel = user?.role === 'admin' || user?.role === 'librarian';

    const handleLogout = () => {
        logout();
        navigate('/iniciar-sesion');
    };

    const getUserInitials = () => {
        if (!user?.name) return 'U';
        const names = user.name.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return names[0][0].toUpperCase();
    };

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
                    <div className="hidden sm:flex items-center gap-2">
                        {!isAuthenticated && (
                            <Button variant={'link'}>
                                <Link to={'iniciar-sesion'}>Iniciar Sesión</Link>
                            </Button>
                        )}
                        {isAuthenticated && (
                            <>
                                {canAccessPanel && (
                                    <Button variant={'link'}>
                                        <Link to={'/panel'}>Panel</Link>
                                    </Button>
                                )}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback className="bg-blue-400 text-white">
                                                    {getUserInitials()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56" align="end" forceMount>
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none">{user?.name}</p>
                                                <p className="text-xs leading-none text-muted-foreground">
                                                    {user?.email}
                                                </p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Perfil</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Configuración</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleLogout}>
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Cerrar sesión</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
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
