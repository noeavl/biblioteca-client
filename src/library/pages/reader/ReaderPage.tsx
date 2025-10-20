import { Button } from '@/components/ui/button';

import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
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
import { Input } from '@/components/ui/input';
import type { Book } from '@/mocks/books.mock';
import { useLoaderData } from 'react-router';
import { useState, useRef, useEffect } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import { Spinner } from '@/components/ui/spinner';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

export const ReaderPage = () => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [sliderValue, setSliderValue] = useState<number>(1);
    const [numPages, setNumPages] = useState<number>(100);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);
    const book = useLoaderData<Book>();

    // Auto-focus cuando se abre el popover de búsqueda
    useEffect(() => {
        if (searchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [searchOpen]);

    if (!book) {
        return <div>Libro no encontrado</div>;
    }

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
    }

    const nextPage = () => {
        if (currentPage + 2 > numPages) return;
        const newPage = currentPage + 2;
        setCurrentPage(newPage);
        setSliderValue(newPage);
    };

    const prevPage = () => {
        if (currentPage === 1) return;
        const newPage = currentPage - 2;
        setCurrentPage(newPage);
        setSliderValue(newPage);
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
                    <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                        <PopoverTrigger asChild>
                            <Button className="bg-blue-50 text-blue-400 hover:bg-blue-50">
                                <span className="material-symbols-outlined">
                                    search
                                </span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-4 m-3 z-10 rounded-2xl border-blue-400/30 w-80">
                            <div className="space-y-3">
                                <h3 className="font-bold text-lg">
                                    Buscar en el libro
                                </h3>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        search
                                    </span>
                                    <Input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Escribe para buscar..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="pl-10 border-blue-400/30 focus-visible:ring-blue-400"
                                    />
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
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
            <div>
                <Document
                    className={'py-8'}
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
                <Slider
                    className="[&>span]:bg-blue-100  [&>span>span]:bg-blue-400"
                    value={[sliderValue]}
                    min={1}
                    max={numPages - 1}
                    step={2}
                    onValueChange={(value) => setSliderValue(value[0])}
                    onValueCommit={(value) => setCurrentPage(value[0])}
                />
                <div className="mt-3 flex justify-center">
                    <span className="font-normal text-gray-400">
                        Page{' '}
                        <span className="font-bold text-blue-400">
                            {sliderValue}
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
