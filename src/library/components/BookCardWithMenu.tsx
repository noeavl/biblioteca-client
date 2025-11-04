import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router';
import { useAuth } from '@/auth/hooks/useAuth';

interface BookCardWithMenuProps {
    id: string;
    title: string;
    publicationYear: number;
    author: string;
    category: string;
    img: string | null;
    isFavorite?: boolean;
    isRead?: boolean;
    collectionName?: string;
    onToggleFavorite?: (id: string) => void;
    onToggleRead?: (id: string) => void;
    onAddToCollection?: (id: string) => void;
    onRemoveFromCollection?: (id: string) => void;
}

export const BookCardWithMenu = ({
    id,
    title,
    publicationYear,
    author,
    category,
    img,
    isFavorite = false,
    isRead = false,
    collectionName,
    onToggleFavorite,
    onToggleRead,
    onAddToCollection,
    onRemoveFromCollection,
}: BookCardWithMenuProps) => {
    const { user } = useAuth();
    const isReader = user?.role?.name === 'reader';

    return (
        <div className="group bg-card rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col border border-foreground/30">
            <Link
                to={`/libros/detalle/${id}`}
                className="relative h-48 sm:h-52 md:h-56 lg:h-60 xl:h-64"
            >
                {img ? (
                    <img
                        className="w-full h-full object-cover object-center"
                        src={img}
                        alt={title}
                    />
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-6xl">
                            book
                        </span>
                    </div>
                )}
            </Link>
            <div className="p-3 sm:p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs sm:text-xs text-primary font-semibold">
                        {category}
                    </p>
                    {isReader && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 hover:bg-accent"
                                    onClick={(e) => e.preventDefault()}
                                >
                                    <span className="material-symbols-outlined text-muted-foreground text-lg">
                                        more_vert
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                side="bottom"
                                className="w-48"
                            >
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onToggleFavorite?.(id);
                                    }}
                                >
                                    <span className="material-symbols-outlined text-sm mr-2">
                                        {isFavorite ? 'heart_minus' : 'favorite'}
                                    </span>
                                    {isFavorite
                                        ? 'Remover de favoritos'
                                        : 'Agregar a favoritos'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onToggleRead?.(id);
                                    }}
                                >
                                    <span className="material-symbols-outlined text-sm mr-2">
                                        {isRead ? 'book_2' : 'done'}
                                    </span>
                                    {isRead
                                        ? 'Marcar como no leído'
                                        : 'Marcar como leído'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onAddToCollection?.(id);
                                    }}
                                >
                                    <span className="material-symbols-outlined text-sm mr-2">
                                        library_add
                                    </span>
                                    Añadir a colección
                                </DropdownMenuItem>
                                {collectionName && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                onRemoveFromCollection?.(id);
                                            }}
                                        >
                                            <span className="material-symbols-outlined text-sm mr-2">
                                                remove_circle
                                            </span>
                                            Remover
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
                <Link to={`/libros/detalle/${id}`}>
                    <h3 className="font-bold text-foreground text-sm sm:text-base truncate mb-1">
                        {title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {author}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        {publicationYear}
                    </p>
                </Link>
            </div>
        </div>
    );
};
