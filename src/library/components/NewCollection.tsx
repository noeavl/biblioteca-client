import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NewCollectionProps {
    onAddCollection: (name: string) => Promise<void>;
}

export const NewCollection = ({ onAddCollection }: NewCollectionProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [collectionName, setCollectionName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddClick = () => {
        setIsEditing(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCollectionName(e.target.value);
    };

    const handleSubmit = async () => {
        if (collectionName.trim() === '' || isSubmitting) return;

        try {
            setIsSubmitting(true);
            await onAddCollection(collectionName.trim());
            setCollectionName('');
            setIsEditing(false);
        } catch (error) {
            console.error('Error al crear colección:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
        if (e.key === 'Escape') {
            setCollectionName('');
            setIsEditing(false);
        }
    };

    const handleBlur = () => {
        // Solo cerrar si no está enviando y el campo está vacío
        if (!isSubmitting && collectionName.trim() === '') {
            setIsEditing(false);
        }
    };

    return (
        <div>
            {isEditing ? (
                <Input
                    type="text"
                    placeholder="Nueva colección"
                    value={collectionName}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    autoFocus
                />
            ) : (
                <Button variant="ghost" onClick={handleAddClick} className="w-full justify-start">
                    <span className="material-symbols-outlined mr-2">add</span>
                    Nueva colección
                </Button>
            )}
        </div>
    );
};
