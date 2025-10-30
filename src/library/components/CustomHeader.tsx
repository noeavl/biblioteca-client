import { Link, useNavigate } from 'react-router';
import { CustomLogo } from '../../components/custom/CustomLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import {
    Search,
    User,
    LogOut,
    Settings,
    Menu,
    Home,
    Library,
    BookOpen,
    Users,
    Moon,
    Sun,
} from 'lucide-react';
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
import { useTheme } from 'next-themes';

export const CustomHeader = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
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
        <header
            className={`sticky z-50 top-0 w-full mx-auto px-4 sm:px-6 lg:px-8 border-b bg-background`}
        >
            <div className="flex my-4 sm:my-6 md:my-10 items-center justify-between space-x-4 sm:space-x-8">
                <CustomLogo />
                <div className="grow max-w hidden md:block relative">
                    <Input
                        type="search"
                        placeholder="Buscar libros, autores o categorias..."
                        className={`w-full pl-9 `}
                    />
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 " />
                </div>
                <div className="flex-none items-center space-x-2">
                    <div className="sm:hidden flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                                setTheme(theme === 'dark' ? 'light' : 'dark')
                            }
                            aria-label="Toggle theme"
                            className="p-2"
                        >
                            {theme === 'dark' ? (
                                <Sun className="h-5 w-5" />
                            ) : (
                                <Moon className="h-5 w-5" />
                            )}
                        </Button>
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="p-2"
                                >
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className={`w-[80%] sm:w-[385px] p-0 `}
                            >
                                <SheetHeader className={`p-4 border-b`}>
                                    <SheetTitle className={`text-left `}>
                                        Menú
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col h-full">
                                    <div className="p-4 space-y-4">
                                        <div className="relative">
                                            <Input
                                                type="search"
                                                placeholder="Buscar libros, autores o categorias..."
                                                className="w-full pl-9"
                                            />
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        </div>

                                        <nav className="space-y-2">
                                            <Link
                                                className="flex items-center gap-2 py-2 px-3 hover:bg-accent rounded-lg text-sm"
                                                to={'/libros'}
                                            >
                                                <BookOpen className="h-4 w-4" />
                                                <span>Libros</span>
                                            </Link>
                                            <Link
                                                className="flex items-center gap-2 py-2 px-3 hover:bg-accent rounded-lg text-sm"
                                                to={'/categorias'}
                                            >
                                                <Library className="h-4 w-4" />
                                                <span>Categorías</span>
                                            </Link>
                                            <Link
                                                className="flex items-center gap-2 py-2 px-3 hover:bg-accent rounded-lg text-sm"
                                                to={'/autores'}
                                            >
                                                <Users className="h-4 w-4" />
                                                <span>Autores</span>
                                            </Link>
                                            <Link
                                                className="flex items-center gap-2 py-2 px-3 hover:bg-accent rounded-lg text-sm"
                                                to={'/mi-biblioteca'}
                                            >
                                                <Home className="h-4 w-4" />
                                                <span>Mi biblioteca</span>
                                            </Link>
                                        </nav>
                                    </div>

                                    <div className="mt-auto border-t p-4">
                                        {!isAuthenticated ? (
                                            <Button
                                                className="w-full"
                                                variant="default"
                                            >
                                                <Link to={'iniciar-sesion'}>
                                                    Iniciar Sesión
                                                </Link>
                                            </Button>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarFallback className="bg-primary text-primary-foreground">
                                                            {getUserInitials()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">
                                                            {user?.name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {user?.email}
                                                        </span>
                                                    </div>
                                                </div>

                                                <Separator />

                                                <nav className="space-y-2">
                                                    {canAccessPanel && (
                                                        <Link
                                                            className="flex items-center gap-2 py-2 px-3 hover:bg-accent rounded-lg text-sm"
                                                            to={'/panel'}
                                                        >
                                                            <Settings className="h-4 w-4" />
                                                            <span>
                                                                Panel de
                                                                administración
                                                            </span>
                                                        </Link>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start gap-2 text-sm h-9"
                                                        onClick={handleLogout}
                                                    >
                                                        <LogOut className="h-4 w-4" />
                                                        <span>
                                                            Cerrar sesión
                                                        </span>
                                                    </Button>
                                                </nav>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                                setTheme(theme === 'dark' ? 'light' : 'dark')
                            }
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? (
                                <Sun className="h-5 w-5" />
                            ) : (
                                <Moon className="h-5 w-5" />
                            )}
                        </Button>
                        {!isAuthenticated && (
                            <Button variant={'link'}>
                                <Link to={'iniciar-sesion'}>
                                    Iniciar Sesión
                                </Link>
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
                                        <Button
                                            variant="ghost"
                                            className="relative h-10 w-10 rounded-full"
                                        >
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback className="bg-blue-400 text-white">
                                                    {getUserInitials()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        className="w-56"
                                        align="end"
                                        forceMount
                                    >
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    {user?.name}
                                                </p>
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
                                        <DropdownMenuItem
                                            onClick={handleLogout}
                                        >
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
