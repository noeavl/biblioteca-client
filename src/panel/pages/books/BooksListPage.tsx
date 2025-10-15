import { Icon } from '@/components/custom/Icon';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { books } from '@/mocks/books.mock';

export const BooksListPage = () => {
    return (
        <div>
            <Table>
                <TableCaption>Una lista de los libros recientes.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Portada</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Autor</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {books.map((book) => (
                        <TableRow>
                            <TableCell className="font-medium">
                                <img
                                    width={100}
                                    src={book.img}
                                    alt={book.title}
                                />
                            </TableCell>
                            <TableCell className="font-medium">
                                {book.title}
                            </TableCell>
                            <TableCell>{book.author}</TableCell>
                            <TableCell>{book.category}</TableCell>
                            <TableCell>Activo</TableCell>
                            <TableCell className="flex items-center justify-center">
                                <div className="flex gap-3">
                                    <Button>
                                        <Icon icon="edit" />
                                    </Button>
                                    <Button>
                                        <Icon icon="delete" />
                                    </Button>
                                    <Button>
                                        <Icon icon="menu_book" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
