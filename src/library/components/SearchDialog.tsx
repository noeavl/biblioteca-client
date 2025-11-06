import { useState, useEffect } from 'react';
import { Search, X, Loader2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useSearch } from '../hooks/useSearch';
import { SearchResultItem } from './SearchResultItem';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Diálogo modal para búsqueda global en la biblioteca
 * Permite buscar libros, autores y categorías en tiempo real
 */
export const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { results, isLoading, error, search, clearResults, hasSearched } = useSearch({
    limit: 15,
    debounceDelay: 300,
  });

  // Ejecuta la búsqueda cuando cambia el término
  useEffect(() => {
    search(searchTerm);
  }, [searchTerm, search]);

  // Limpia los resultados cuando se cierra el diálogo
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      clearResults();
    }
  }, [open, clearResults]);

  const handleClearSearch = () => {
    setSearchTerm('');
    clearResults();
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const hasResults = results && (results.books.length > 0 || results.authors.length > 0 || results.categories.length > 0);
  const noResults = hasSearched && !isLoading && !hasResults && !error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Buscar en la biblioteca</DialogTitle>
        </DialogHeader>

        {/* Input de búsqueda */}
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar libros, autores o categorías..."
              className="pl-10 pr-10"
              autoFocus
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Resultados */}
        <div className="flex-1 overflow-y-auto px-2 pb-6">
          {/* Estado de carga */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Buscando...</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="px-4 pt-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Error al realizar la búsqueda. Por favor, intenta nuevamente.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Sin resultados */}
          {noResults && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No se encontraron resultados</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                No encontramos libros, autores o categorías que coincidan con tu búsqueda.
              </p>
            </div>
          )}

          {/* Mensaje inicial */}
          {!hasSearched && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Comienza a buscar</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Escribe el título de un libro, nombre de un autor o categoría que te interese.
              </p>
            </div>
          )}

          {/* Resultados encontrados */}
          {hasResults && !isLoading && (
            <div className="space-y-6 pt-4">
              {/* Libros */}
              {results.books.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground px-4 mb-2">
                    Libros ({results.books.length})
                  </h3>
                  <div className="space-y-1">
                    {results.books.map((book) => (
                      <SearchResultItem
                        key={book._id}
                        type="book"
                        data={book}
                        onSelect={handleClose}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Autores */}
              {results.authors.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground px-4 mb-2">
                    Autores ({results.authors.length})
                  </h3>
                  <div className="space-y-1">
                    {results.authors.map((author) => (
                      <SearchResultItem
                        key={author._id}
                        type="author"
                        data={author}
                        onSelect={handleClose}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Categorías */}
              {results.categories.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground px-4 mb-2">
                    Categorías ({results.categories.length})
                  </h3>
                  <div className="space-y-1">
                    {results.categories.map((category) => (
                      <SearchResultItem
                        key={category._id}
                        type="category"
                        data={category}
                        onSelect={handleClose}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Total de resultados */}
              {results.total > 0 && (
                <div className="px-4 pt-2">
                  <p className="text-xs text-muted-foreground text-center">
                    {results.total} {results.total === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
