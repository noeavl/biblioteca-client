import { useState, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getCollectionsByReader, addBookToCollectionDirect } from '@/library/api/collections.api';
import type { Collection } from '@/library/api/collections.api';
import { getReaderIdFromToken } from '@/auth/utils/jwt.utils';
import { Skeleton } from '@/components/ui/skeleton';

interface AddToCollectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bookId: string;
    bookTitle: string;
}

export const AddToCollectionDialog = ({
    open,
    onOpenChange,
    bookId,
    bookTitle,
}: AddToCollectionDialogProps) => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        if (open) {
            loadCollections();
        }
    }, [open]);

    const loadCollections = async (): Promise<void> => {
        const readerId = getReaderIdFromToken();
        if (!readerId) {
            toast.error('No se pudo obtener el ID del lector');
            return;
        }

        try {
            setLoading(true);
            const collectionsData = await getCollectionsByReader(readerId);
            setCollections(collectionsData);
        } catch (error) {
            console.error('Error al cargar colecciones:', error);
            toast.error('Error al cargar las colecciones');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCollection = async (): Promise<void> => {
        if (!selectedCollectionId) {
            toast.error('Debes seleccionar una colección');
            return;
        }

        try {
            setSubmitting(true);
            await addBookToCollectionDirect(bookId, selectedCollectionId);
            toast.success('Libro agregado a la colección');
            setSelectedCollectionId(null);
            onOpenChange(false);
        } catch (error: unknown) {
            console.error('Error al agregar libro a colección:', error);
            if (error && typeof error === 'object' && 'response' in error) {
                const apiError = error as { response?: { data?: { message?: string } } };
                if (apiError.response?.data?.message) {
                    toast.error(apiError.response.data.message);
                } else {
                    toast.error('Error al agregar el libro a la colección');
                }
            } else {
                toast.error('Error al agregar el libro a la colección');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = (): void => {
        setSelectedCollectionId(null);
        onOpenChange(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[500px]">
                <SheetHeader>
                    <SheetTitle>Agregar a colección</SheetTitle>
                    <SheetDescription>
                        Selecciona la colección donde quieres agregar "{bookTitle}"
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-4">
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-3 p-3">
                                    <Skeleton className="h-5 w-5 rounded" />
                                    <Skeleton className="h-4 flex-1" />
                                </div>
                            ))}
                        </div>
                    ) : collections.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <span className="material-symbols-outlined text-muted-foreground mb-3" style={{ fontSize: '3rem' }}>
                                collections_bookmark
                            </span>
                            <p className="text-sm text-muted-foreground mb-1">
                                No tienes colecciones creadas
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Crea una colección desde "Mi Biblioteca"
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                            {collections.map((collection) => (
                                <button
                                    key={collection._id}
                                    type="button"
                                    onClick={() => setSelectedCollectionId(collection._id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all hover:border-primary/50 ${
                                        selectedCollectionId === collection._id
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border bg-background'
                                    }`}
                                >
                                    <div
                                        className={`flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all ${
                                            selectedCollectionId === collection._id
                                                ? 'border-primary bg-primary'
                                                : 'border-muted-foreground/30'
                                        }`}
                                    >
                                        {selectedCollectionId === collection._id && (
                                            <span className="material-symbols-outlined text-primary-foreground" style={{ fontSize: '1rem' }}>
                                                check
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-medium">{collection.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {collection.books.length} {collection.books.length === 1 ? 'libro' : 'libros'}
                                        </p>
                                    </div>
                                    <span className="material-symbols-outlined text-muted-foreground">
                                        collections_bookmark
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <SheetFooter className="flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={submitting}
                        className="flex-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleAddToCollection}
                        disabled={!selectedCollectionId || submitting || collections.length === 0}
                        className="flex-1"
                    >
                        {submitting ? 'Agregando...' : 'Agregar'}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};
