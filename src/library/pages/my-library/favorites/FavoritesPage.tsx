import { BookCardWithMenu } from '@/library/components/BookCardWithMenu';
import { books } from '@/mocks/books.mock';

export const FavoritesPage = () => {
    const handleToggleFavorite = (id: string) => {
        console.log('Toggle favorite:', id);
        // TODO: Implementar lógica para remover de favoritos
    };

    const handleToggleRead = (id: string) => {
        console.log('Toggle read:', id);
        // TODO: Implementar lógica para marcar como leído
    };

    const handleAddToCollection = (id: string) => {
        console.log('Add to collection:', id);
        // TODO: Implementar lógica para añadir a colección
    };

    const handleRemoveFromCollection = (id: string) => {
        console.log('Remove from collection:', id);
        // TODO: Implementar lógica para remover de favoritos
    };

    return (
        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
            {books.map((book) => (
                <BookCardWithMenu
                    key={book.id}
                    id={book.id}
                    img={book.img}
                    title={book.title}
                    category={book.category}
                    author={book.author}
                    publicationYear={book.publicationYear}
                    isFavorite={true}
                    collectionName="Favoritos"
                    onToggleFavorite={handleToggleFavorite}
                    onToggleRead={handleToggleRead}
                    onAddToCollection={handleAddToCollection}
                    onRemoveFromCollection={handleRemoveFromCollection}
                />
            ))}
        </div>
    );
};
