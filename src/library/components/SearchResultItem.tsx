import { Book, User, Tag } from 'lucide-react';
import { Link } from 'react-router';
import type { SearchBook, SearchAuthor, SearchCategory } from '../interfaces/search.interface';

interface SearchResultItemProps {
  type: 'book' | 'author' | 'category';
  data: SearchBook | SearchAuthor | SearchCategory;
  onSelect?: () => void;
}

/**
 * Componente para mostrar un item individual en los resultados de búsqueda
 */
export const SearchResultItem = ({ type, data, onSelect }: SearchResultItemProps) => {
  const renderContent = () => {
    switch (type) {
      case 'book': {
        const book = data as SearchBook;
        const authorName =
          typeof book.author === 'object' && 'person' in book.author
            ? `${book.author.person.firstName} ${book.author.person.lastName}`
            : 'Autor desconocido';

        const categoryName =
          typeof book.category === 'object' && 'name' in book.category
            ? book.category.name
            : 'Sin categoría';

        return (
          <Link
            to={`/libros/detalle/${book._id}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-accent rounded-md transition-colors"
            onClick={onSelect}
          >
            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
              <Book className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{book.title}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate">{authorName}</span>
                <span>•</span>
                <span className="truncate">{categoryName}</span>
              </div>
            </div>
            {book.publicationYear && (
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {book.publicationYear}
              </span>
            )}
          </Link>
        );
      }

      case 'author': {
        const author = data as SearchAuthor;
        const fullName = `${author.person.firstName} ${author.person.lastName}`;

        return (
          <Link
            to={`/autores/detalle/${author._id}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-accent rounded-md transition-colors"
            onClick={onSelect}
          >
            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{fullName}</p>
              <p className="text-xs text-muted-foreground">Autor</p>
            </div>
          </Link>
        );
      }

      case 'category': {
        const category = data as SearchCategory;

        return (
          <Link
            to={`/categorias/detalle/${category._id}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-accent rounded-md transition-colors"
            onClick={onSelect}
          >
            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
              <Tag className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{category.name}</p>
              <p className="text-xs text-muted-foreground">Categoría</p>
            </div>
          </Link>
        );
      }

      default:
        return null;
    }
  };

  return renderContent();
};
