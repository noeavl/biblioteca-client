import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getCollectionsByReader } from '@/library/api/collections.api';
import { getReaderIdFromToken } from '@/auth/utils/jwt.utils';
import { useAuth } from '@/auth/hooks/useAuth';
import { toast } from 'sonner';

interface CollectionItem {
    name: string;
    url: string;
    icon: string;
    id: string;
}

interface CollectionsContextType {
    collections: CollectionItem[];
    isLoading: boolean;
    refreshCollections: () => Promise<void>;
    updateCollectionName: (id: string, name: string) => void;
    addCollection: (collection: CollectionItem) => void;
    removeCollection: (id: string) => void;
}

const CollectionsContext = createContext<CollectionsContextType | undefined>(undefined);

export const CollectionsProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [collections, setCollections] = useState<CollectionItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const isReader = user?.role?.name === 'reader';

    const loadCollections = async (): Promise<void> => {
        if (!isReader) return;

        const readerId = getReaderIdFromToken();
        if (!readerId) return;

        try {
            setIsLoading(true);
            const collectionsData = await getCollectionsByReader(readerId);

            const mappedCollections = collectionsData.map((collection) => ({
                name: collection.name,
                url: `/mi-biblioteca/colecciones/${collection._id}`,
                icon: 'collections_bookmark',
                id: collection._id,
            }));

            setCollections(mappedCollections);
        } catch (error) {
            console.error('Error al cargar colecciones:', error);
            toast.error('Error al cargar las colecciones');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCollections();
    }, [isReader]);

    const refreshCollections = async (): Promise<void> => {
        await loadCollections();
    };

    const updateCollectionName = (id: string, name: string): void => {
        setCollections((prev) =>
            prev.map((collection) =>
                collection.id === id
                    ? { ...collection, name }
                    : collection
            )
        );
    };

    const addCollection = (collection: CollectionItem): void => {
        setCollections((prev) => [...prev, collection]);
    };

    const removeCollection = (id: string): void => {
        setCollections((prev) => prev.filter((c) => c.id !== id));
    };

    return (
        <CollectionsContext.Provider
            value={{
                collections,
                isLoading,
                refreshCollections,
                updateCollectionName,
                addCollection,
                removeCollection,
            }}
        >
            {children}
        </CollectionsContext.Provider>
    );
};

export const useCollections = (): CollectionsContextType => {
    const context = useContext(CollectionsContext);
    if (context === undefined) {
        throw new Error('useCollections must be used within a CollectionsProvider');
    }
    return context;
};
