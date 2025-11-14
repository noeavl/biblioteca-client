import {
    FilterSideBar,
    type FilterConfig,
} from '@/library/components/FilterSidebar';
import { MyLibraryLayout } from '@/library/layouts/MyLibraryLayout';
import {
    menuItems,
    orderByItems,
    type SortType,
} from '@/mocks/filters.mock';
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { createCollection, deleteCollection } from '@/library/api/collections.api';
import { getReaderIdFromToken } from '@/auth/utils/jwt.utils';
import { useAuth } from '@/auth/hooks/useAuth';
import { toast } from 'sonner';
import { useCollections } from '@/library/context/CollectionsContext';

const getTitleByPath = (pathname: string): string => {
    if (pathname.includes('/favoritos')) return 'Favoritos';
    if (pathname.includes('/colecciones')) return 'Colecciones';
    if (pathname.includes('/leidos')) return 'Leídos';
    return 'Mi Biblioteca';
};

export const MyLibraryPage = () => {
    const location = useLocation();
    const title = getTitleByPath(location.pathname);
    const { user } = useAuth();
    const [selectedSort, setSelectedSort] = useState<SortType>('recent');
    const { collections: collectionsItems, isLoading: isLoadingCollections, refreshCollections, removeCollection: removeCollectionFromContext } = useCollections();

    const isReader = user?.role?.name === 'reader';

    const handleSortChange = (sortValue: string) => {
        setSelectedSort(sortValue as SortType);
    };

    const handleAddCollection = async (name: string): Promise<void> => {
        if (!isReader) {
            toast.error('Solo los lectores pueden crear colecciones');
            return;
        }

        const readerId = getReaderIdFromToken();
        if (!readerId) {
            toast.error('No se pudo crear la colección');
            return;
        }

        try {
            await createCollection({
                reader: readerId,
                name: name.trim(),
                visibility: 'private', // Default to private as requested
            });

            // Reload collections from context
            await refreshCollections();
            toast.success('Colección creada correctamente');
        } catch (error: unknown) {
            console.error('Error al crear colección:', error);

            if (error && typeof error === 'object' && 'response' in error) {
                const apiError = error as { response?: { data?: { message?: string } } };
                if (apiError.response?.data?.message) {
                    toast.error(apiError.response.data.message);
                } else {
                    toast.error('Error al crear la colección');
                }
            } else {
                toast.error('Error al crear la colección');
            }
        }
    };

    const handleDeleteCollection = async (collectionId: string): Promise<void> => {
        if (!isReader) {
            toast.error('Solo los lectores pueden eliminar colecciones');
            return;
        }

        try {
            await deleteCollection(collectionId);

            // Remove from context
            removeCollectionFromContext(collectionId);

            toast.success('Colección eliminada correctamente');
        } catch (error: unknown) {
            console.error('Error al eliminar colección:', error);

            if (error && typeof error === 'object' && 'response' in error) {
                const apiError = error as { response?: { data?: { message?: string } } };
                if (apiError.response?.data?.message) {
                    toast.error(apiError.response.data.message);
                } else {
                    toast.error('Error al eliminar la colección');
                }
            } else {
                toast.error('Error al eliminar la colección');
            }
        }
    };

    const categoriesFilters: FilterConfig[] = [
        { type: 'menu-item', label: 'Mi Biblioteca', items: menuItems },
        ...(collectionsItems.length > 0
            ? [{ type: 'collection-list' as const, label: 'Colecciones', items: collectionsItems, onDeleteCollection: handleDeleteCollection }]
            : [{ type: 'empty-collections' as const, label: 'No tienes colecciones aún' }]),
        { type: 'new-collection', label: 'Nueva Colección', onAddCollection: handleAddCollection },
        {
            type: 'radio',
            label: 'Ordernar Por',
            items: orderByItems,
            onChange: handleSortChange,
        },
    ];

    return (
        <MyLibraryLayout
            title={title}
            sidebar={<FilterSideBar filters={categoriesFilters} isLoading={isLoadingCollections} />}
        >
            <Outlet context={{ selectedSort }} />
        </MyLibraryLayout>
    );
};
