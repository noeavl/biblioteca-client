import { BooksGrid } from '@/library/components/BooksGrid';
import { books } from '@/mocks/books.mock';

export const CollectionsPage = () => {
    const handleToggleFavorite = (id: string) => {
        console.log('Toggle favorite:', id);
        // Implementar lógica para añadir/remover de favoritos
    };

    const handleToggleRead = (id: string) => {
        console.log('Toggle read:', id);
        // Implementar lógica para marcar como leído/no leído
    };

    const handleAddToCollection = (id: string) => {
        console.log('Add to collection:', id);
        //Implementar lógica para añadir a otra colección
    };

    const handleRemoveFromCollection = (id: string) => {
        console.log('Remove from collection:', id);
        // Implementar lógica para remover de colección actual
    };

    return (
        <BooksGrid
            books={books}
            withMenu
            collectionName="Colección"
            onToggleFavorite={handleToggleFavorite}
            onToggleRead={handleToggleRead}
            onAddToCollection={handleAddToCollection}
            onRemoveFromCollection={handleRemoveFromCollection}
        />
    );
};
