import { Button } from '@/components/ui/button';

import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import type { Book } from '@/mocks/books.mock';
import { useLoaderData } from 'react-router';
import { useState } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import { Spinner } from '@/components/ui/spinner';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

export const ReaderPage = () => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [numPages, setNumPages] = useState<number>(100);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const book = useLoaderData<Book>();

    if (!book) {
        return <div>Libro no encontrado</div>;
    }

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
    }

    const nextPage = () => {
        if (currentPage + 2 > numPages) return;
        setCurrentPage(currentPage + 2);
    };

    const prevPage = () => {
        if (currentPage === 1) return;
        setCurrentPage(currentPage - 2);
    };
    return (
        <div className="flex flex-col">
            <div className="flex flex-none justify-between items-center p-8 border-b-1">
                <div className="flex gap-3">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button className="bg-blue-50 text-blue-400 hover:bg-blue-50">
                                <span className="material-symbols-outlined">
                                    notes
                                </span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-8 m-3 z-10 rounded-2xl border-blue-400/30"></PopoverContent>
                    </Popover>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button className="bg-blue-50 text-blue-400 hover:bg-blue-50">
                                <span className="material-symbols-outlined">
                                    bookmarks
                                </span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-8 m-3 z-10 rounded-2xl border-blue-400/30"></PopoverContent>
                    </Popover>
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold">{book.title}</h2>
                    <span className="text-gray-500 font-thin text-lg">
                        {book.author} - {book.publicationYear}
                    </span>
                </div>
                <div className="space-x-3">
                    <Button className="bg-blue-50 text-blue-400 hover:bg-blue-50">
                        <span className="material-symbols-outlined">
                            search
                        </span>
                    </Button>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button className="bg-blue-50 text-blue-400 hover:bg-blue-50">
                                <span className="material-symbols-outlined">
                                    custom_typography
                                </span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-8 m-3 z-10 rounded-2xl border-blue-400/30">
                            <div>
                                <div>
                                    <h3 className="font-bold">
                                        Tamaño de letra
                                    </h3>
                                    <div className="flex justify-between space-x-3">
                                        <Button className="bg-blue-50 text-blue-400">
                                            S
                                        </Button>
                                        <Button className="text-white bg-blue-400">
                                            M
                                        </Button>
                                        <Button className="text-blue-400 bg-">
                                            L
                                        </Button>
                                    </div>
                                </div>
                                <Separator className="my-6" />
                                <div>
                                    <h3 className="font-bold">Tema</h3>
                                    <div className="flex justify-between items-center">
                                        <span>Claro</span>
                                        <div>
                                            <Switch />
                                            <span>Oscuro</span>
                                        </div>
                                    </div>
                                </div>
                                <Separator className="my-6" />
                                <div>
                                    <h3 className="font-bold">
                                        Familia de fuente
                                    </h3>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona una fuente"></SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>
                                                    Fuentes
                                                </SelectLabel>
                                                <SelectItem value="apple">
                                                    Apple
                                                </SelectItem>
                                                <SelectItem value="banana">
                                                    Banana
                                                </SelectItem>
                                                <SelectItem value="blueberry">
                                                    Blueberry
                                                </SelectItem>
                                                <SelectItem value="grapes">
                                                    Grapes
                                                </SelectItem>
                                                <SelectItem value="pineapple">
                                                    Pineapple
                                                </SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Button
                        className="bg-blue-50 text-blue-400 hover:bg-blue-50"
                        onClick={() => setIsBookmarked(!isBookmarked)}
                    >
                        <span
                            className={`material-symbols-outlined ${
                                isBookmarked ? 'fill' : ''
                            }`}
                        >
                            bookmark
                        </span>
                    </Button>
                </div>
            </div>
            <div className="">
                <Document
                    className="bg-amber-200"
                    file={book.pdf}
                    loading={
                        <div className="flex justify-center items">
                            <Spinner />
                        </div>
                    }
                    onLoadSuccess={onDocumentLoadSuccess}
                >
                    <div className="flex justify-center items-center">
                        <Page
                            pageNumber={currentPage}
                            renderAnnotationLayer={false}
                            renderTextLayer={false}
                        ></Page>
                        <Page
                            pageNumber={currentPage + 1}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                        />
                    </div>
                </Document>
                <div className="flex justify-center space-x-3 py-3">
                    <Button
                        className="rounded-full bg-blue-100 text-blue-400 hover:bg-blue-400 hover:text-white"
                        onClick={prevPage}
                    >
                        <span className="material-symbols-outlined">
                            chevron_left
                        </span>
                    </Button>
                    <Button
                        className="rounded-full bg-blue-100 text-blue-400 hover:bg-blue-400 hover:text-white"
                        onClick={nextPage}
                    >
                        <span className="material-symbols-outlined">
                            chevron_right
                        </span>
                    </Button>
                </div>
            </div>
            <div className="flex-none p-8">
                <Progress
                    className="bg-blue-100 [&>div]:bg-blue-400"
                    value={currentPage}
                ></Progress>
                <div className="mt-3">
                    <span className="font-normal text-gray-400">
                        Page{' '}
                        <span className="font-bold text-blue-400">
                            {currentPage}
                        </span>{' '}
                        of{' '}
                        <span className="font-bold text-blue-400">
                            {numPages}
                        </span>
                    </span>
                </div>
            </div>
        </div>
    );
};
