import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

export const CustomPagination = () => {
    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious className="text-blue-400" href="#" />
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
                    <PaginationNext className="text-blue-400" href="#" />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};
