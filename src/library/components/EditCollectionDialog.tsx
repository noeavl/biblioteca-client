import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { updateCollection } from '@/library/api/collections.api';

interface EditCollectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    collectionId: string;
    currentName: string;
    currentDescription?: string;
    onSuccess: () => void;
}

export const EditCollectionDialog = ({
    open,
    onOpenChange,
    collectionId,
    currentName,
    currentDescription,
    onSuccess,
}: EditCollectionDialogProps) => {
    const [name, setName] = useState(currentName);
    const [description, setDescription] = useState(currentDescription || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Actualizar valores cuando cambian las props
    useEffect(() => {
        if (open) {
            setName(currentName);
            setDescription(currentDescription || '');
        }
    }, [open, currentName, currentDescription]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('El nombre de la colección es requerido');
            return;
        }

        if (name.trim().length < 3) {
            toast.error('El nombre debe tener al menos 3 caracteres');
            return;
        }

        if (name.trim().length > 50) {
            toast.error('El nombre no debe superar los 50 caracteres');
            return;
        }

        if (description.length > 200) {
            toast.error('La descripción no debe superar los 200 caracteres');
            return;
        }

        try {
            setIsSubmitting(true);

            const updateData: { name?: string; description?: string } = {};

            // Solo enviar campos que han cambiado
            if (name.trim() !== currentName) {
                updateData.name = name.trim();
            }

            if (description.trim() !== (currentDescription || '')) {
                updateData.description = description.trim();
            }

            // Si no hay cambios, solo cerrar el diálogo
            if (Object.keys(updateData).length === 0) {
                toast.info('No hay cambios que guardar');
                onOpenChange(false);
                return;
            }

            await updateCollection(collectionId, updateData);
            toast.success('Colección actualizada exitosamente');
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error('Error al actualizar colección:', error);
            if (error?.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Error al actualizar la colección');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Editar colección</DialogTitle>
                        <DialogDescription>
                            Actualiza el nombre y descripción de tu colección
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Nombre{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="Ej: Mis libros favoritos"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={50}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                {name.length}/50 caracteres
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">
                                Descripción (opcional)
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Describe tu colección..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                maxLength={200}
                                rows={3}
                                className="resize-none overflow-y-auto break-all overflow-x-hidden"
                            />
                            <p className="text-xs text-muted-foreground">
                                {description.length}/200 caracteres
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
