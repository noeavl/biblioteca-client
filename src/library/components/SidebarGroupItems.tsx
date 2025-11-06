import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Icon } from '../../components/custom/Icon';
import { Link, useLocation, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

export interface MenuItem {
    name: string;
    url?: string;
    icon?: string;
    id?: string;
}

interface SidebarItemProps {
    label: string;
    items: Array<MenuItem>;
    onDeleteCollection?: (collectionId: string) => Promise<void>;
}

export const SidebarGroupItems = ({ label, items, onDeleteCollection }: SidebarItemProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [collectionToDelete, setCollectionToDelete] = useState<{ id: string; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (e: React.MouseEvent, item: MenuItem) => {
        e.preventDefault();
        e.stopPropagation();
        if (item.id) {
            setCollectionToDelete({ id: item.id, name: item.name });
            setDeleteDialogOpen(true);
        }
    };

    const handleConfirmDelete = async () => {
        if (!collectionToDelete || !onDeleteCollection) return;

        setIsDeleting(true);
        try {
            await onDeleteCollection(collectionToDelete.id);
            setDeleteDialogOpen(false);
            setCollectionToDelete(null);

            // Navigate to main library if we're on the deleted collection's page
            if (location.pathname.includes(collectionToDelete.id)) {
                navigate('/mi-biblioteca');
            }
        } catch (error) {
            console.error('Error al eliminar colección:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <SidebarGroup>
                <SidebarGroupLabel className="text-2xl mb-6 font-bold">
                    {label}
                </SidebarGroupLabel>
                <SidebarMenu>
                    {items.map((item) => {
                        const isActive = location.pathname === item.url;
                        const isCollection = onDeleteCollection && item.id;

                        return (
                            <SidebarMenuItem key={item.id ?? item.name}>
                                <div className="flex items-center gap-2 w-full">
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive}
                                        className={`flex-1 ${isActive ? 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300' : ''}`}
                                    >
                                        <Link to={item.url ?? '/'}>
                                            <Icon icon={item.icon} />
                                            <span>{item.name}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                    {isCollection && (
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={(e) => handleDeleteClick(e, item)}
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Eliminar colección</span>
                                        </Button>
                                    )}
                                </div>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroup>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar colección?</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Estás seguro de que deseas eliminar la colección "{collectionToDelete?.name}"?
                            Esta acción no se puede deshacer. Los libros no serán eliminados, solo se removerán de la colección.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
