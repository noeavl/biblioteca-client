import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { BooksGrid } from '@/library/components/BooksGrid';
import { MainLayout } from '@/library/layouts/MainLayout';
import { books } from '@/mocks/books.mock';

export const BooksPage = () => {
    return (
        <MainLayout>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">Catálogo de Libros</h2>
            <div className="space-y-6 sm:space-y-8">
                <BooksGrid books={books}></BooksGrid>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                className="text-blue-400"
                                href="#"
                            />
                        </PaginationItem>
                        <PaginationItem className="text-blue-400">
                            <PaginationLink href="#">1</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink
                                className="bg-blue-400 text-white rounded-full"
                                href="#"
                                isActive
                            >
                                2
                            </PaginationLink>
                        </PaginationItem>
                        <PaginationItem className="text-blue-400">
                            <PaginationLink href="#">3</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationEllipsis className="text-blue-400" />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext
                                className="text-blue-400"
                                href="#"
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </MainLayout>
    );
};
