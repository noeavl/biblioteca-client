import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

interface CustomPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const CustomPagination = ({ currentPage, totalPages, onPageChange }: CustomPaginationProps) => {
    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        className="text-blue-400 cursor-pointer"
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) {
                                onPageChange(currentPage - 1);
                            }
                        }}
                        aria-disabled={currentPage === 1}
                    />
                </PaginationItem>

                {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // Mostrar solo algunas páginas alrededor de la actual
                    if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                        return (
                            <PaginationItem key={pageNumber}>
                                <PaginationLink
                                    className={
                                        currentPage === pageNumber
                                            ? 'bg-blue-400 text-white rounded-full cursor-pointer'
                                            : 'text-blue-400 cursor-pointer'
                                    }
                                    href="#"
                                    isActive={currentPage === pageNumber}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onPageChange(pageNumber);
                                    }}
                                >
                                    {pageNumber}
                                </PaginationLink>
                            </PaginationItem>
                        );
                    } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                    ) {
                        return (
                            <PaginationItem key={pageNumber}>
                                <PaginationEllipsis className="text-blue-400" />
                            </PaginationItem>
                        );
                    }
                    return null;
                })}

                <PaginationItem>
                    <PaginationNext
                        className="text-blue-400 cursor-pointer"
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) {
                                onPageChange(currentPage + 1);
                            }
                        }}
                        aria-disabled={currentPage === totalPages}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};
