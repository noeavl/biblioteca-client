import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { CategoriesGrid } from '@/library/components/CategoriesGrid';
import { AuthorsGrid } from '@/library/components/AuthorsGrid';
import { InteractiveBook } from '@/library/components/InteractiveBook';
import { getBooks } from '@/panel/api/books.api';
import { getAuthors } from '@/panel/api/authors.api';
import { getCategories } from '@/panel/api/categories.api';
import type { Book, BookCategory } from '@/library/interfaces/book.interface';
import type { Author, AuthorCard } from '@/library/interfaces/author.interface';
import type { Category } from '@/mocks/categories.mock';
import { useAuth } from '@/auth/hooks/useAuth';

export const HomePage = () => {
    const { user } = useAuth();
    const [books, setBooks] = useState<Book[]>([]);
    const [authors, setAuthors] = useState<AuthorCard[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [booksLoading, setBooksLoading] = useState(true);
    const [authorsLoading, setAuthorsLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [preloadedColors, setPreloadedColors] = useState<Record<string, string>>({});
    const [colorsLoading, setColorsLoading] = useState(true);

    const isLoading = booksLoading || authorsLoading || categoriesLoading || colorsLoading;

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const data = await getBooks({ limit: 24 });
                setBooks(data.books);
            } catch (error) {
                console.error('Error al cargar los libros:', error);
            } finally {
                setBooksLoading(false);
            }
        };

        fetchBooks();
    }, []);

    useEffect(() => {
        const fetchAuthors = async () => {
            try {
                const response = await getAuthors();
                // Transformar Author[] a AuthorCard[]
                const authorsCards: AuthorCard[] = response.authors.map(
                    (author: Author) => ({
                        _id: author._id,
                        firstName: author.person.firstName,
                        lastName: author.person.lastName,
                        img: author.fileName,
                        quantityBooks: author.books?.length || 0,
                    })
                );
                setAuthors(authorsCards);
            } catch (error) {
                console.error('Error al cargar los autores:', error);
            } finally {
                setAuthorsLoading(false);
            }
        };

        fetchAuthors();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategories();
                const categoriesCards: Category[] = response.categories.map(
                    (category: BookCategory) => ({
                        name: category.name,
                        img: category.featuredBookCover
                            ? `${import.meta.env.VITE_API_URL}/files/cover/${
                                  category.featuredBookCover
                              }`
                            : '',
                        quantityBooks: category.books?.length || 0,
                    })
                );
                setCategories(categoriesCards);
            } catch (error) {
                console.error('Error al cargar las categorías:', error);
            } finally {
                setCategoriesLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Pre-cargar imágenes y extraer colores
    useEffect(() => {
        if (books.length === 0) {
            setColorsLoading(false);
            return;
        }

        const extractColorFromImage = (img: HTMLImageElement): string => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return '#3b82f6';

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                // Obtener color dominante del centro de la imagen
                const imageData = ctx.getImageData(
                    img.width / 4,
                    img.height / 4,
                    img.width / 2,
                    img.height / 2
                );
                const data = imageData.data;

                let r = 0, g = 0, b = 0;
                const pixelCount = data.length / 4;

                for (let i = 0; i < data.length; i += 4) {
                    r += data[i];
                    g += data[i + 1];
                    b += data[i + 2];
                }

                r = Math.floor(r / pixelCount);
                g = Math.floor(g / pixelCount);
                b = Math.floor(b / pixelCount);

                // Oscurecer un poco el color para el lomo
                const darkenFactor = 0.7;
                r = Math.floor(r * darkenFactor);
                g = Math.floor(g * darkenFactor);
                b = Math.floor(b * darkenFactor);

                return `rgb(${r}, ${g}, ${b})`;
            } catch (error) {
                console.error('Error extracting color:', error);
                return '#3b82f6';
            }
        };

        const preloadImages = async () => {
            const colors: Record<string, string> = {};
            const imagePromises = books.map((book) => {
                return new Promise<void>((resolve) => {
                    if (!book.coverImage) {
                        colors[book._id] = '#3b82f6';
                        resolve();
                        return;
                    }

                    const img = new Image();
                    img.crossOrigin = 'Anonymous';
                    img.src = `${import.meta.env.VITE_API_URL}/files/cover/${book.coverImage}`;

                    img.onload = () => {
                        colors[book._id] = extractColorFromImage(img);
                        resolve();
                    };

                    img.onerror = () => {
                        colors[book._id] = '#3b82f6';
                        resolve();
                    };
                });
            });

            await Promise.all(imagePromises);
            setPreloadedColors(colors);
            setColorsLoading(false);
        };

        preloadImages();
    }, [books]);

    // Crear tres filas de 8 libros cada una (24 total)
    const row1Books = books.slice(0, 8);
    const row2Books = books.slice(8, 16);
    const row3Books = books.slice(16, 24);

    // Estado para controlar qué libro está abierto (formato: "fila-indice")
    const [openBookId, setOpenBookId] = useState<string | null>(null);

    // Mostrar splash screen mientras carga
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
                <div className="text-center">
                    {/* Logo o animación */}
                    <div className="mb-8">
                        <svg
                            className="animate-bounce w-20 h-20 mx-auto text-blue-500 dark:text-blue-400"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Nueva sección interactiva de estante con tres filas */}
            <section className="relative bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 h-screen flex items-center overflow-hidden">
                {books.length === 0 ? (
                    <div className="relative px-4 w-full h-full py-6">
                        <div className="max-w-7xl mx-auto flex flex-col justify-center h-full gap-16">
                            {/* Mensaje de Bienvenida */}
                            <div className="text-center mb-8">
                                <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-2">
                                    ¡Bienvenido, <span className="text-blue-500">{user?.name || 'Usuario'}</span>!
                                </h2>
                                <p className="text-lg text-slate-600 dark:text-slate-300">
                                    Nuestra biblioteca está creciendo
                                </p>
                            </div>

                            {/* Estante 1 */}
                            <div className="overflow-visible flex flex-col justify-end">
                                <div className="text-center py-12">
                                    <p className="text-2xl md:text-3xl font-semibold text-slate-600 dark:text-slate-400">
                                        Próximamente nuevos títulos
                                    </p>
                                </div>
                                {/* Repisa */}
                                <div className="h-3 bg-gradient-to-b from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800 rounded-sm shadow-md w-[85%] mx-auto"></div>
                            </div>

                            {/* Estante 2 */}
                            <div className="overflow-visible flex flex-col justify-end">
                                <div className="text-center py-12">
                                    <p className="text-2xl md:text-3xl font-semibold text-slate-600 dark:text-slate-400">
                                        Grandes obras en camino
                                    </p>
                                </div>
                                {/* Repisa */}
                                <div className="h-3 bg-gradient-to-b from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800 rounded-sm shadow-md w-[85%] mx-auto"></div>
                            </div>

                            {/* Estante 3 */}
                            <div className="overflow-visible flex flex-col justify-end">
                                <div className="text-center py-12">
                                    <p className="text-2xl md:text-3xl font-semibold text-slate-600 dark:text-slate-400">
                                        ¡Espera lo mejor!
                                    </p>
                                </div>
                                {/* Repisa */}
                                <div className="h-3 bg-gradient-to-b from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800 rounded-sm shadow-md w-[85%] mx-auto"></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="relative px-4 w-full h-full py-6">
                        <div className="max-w-7xl mx-auto flex flex-col justify-center h-full gap-8">
                            {/* Mensaje de Bienvenida */}
                            <div className="text-center mb-4">
                                <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-2">
                                    ¡Bienvenido, <span className="text-blue-500">{user?.name || 'Usuario'}</span>!
                                </h2>
                                <p className="text-lg text-slate-600 dark:text-slate-300">
                                    Descubre tu próxima gran lectura
                                </p>
                            </div>

                            {/* Fila 1 - Diseño Classic */}
                            {row1Books.length > 0 && (
                                <div className="overflow-visible flex flex-col justify-end relative">
                                    <div className="flex gap-3 justify-center items-end">
                                        {row1Books.map((book, index) => (
                                            <InteractiveBook
                                                key={book._id}
                                                book={book}
                                                index={index + 0}
                                                isOpen={
                                                    openBookId ===
                                                    `row1-${index}`
                                                }
                                                designType="classic"
                                                onToggle={() => {
                                                    setOpenBookId(
                                                        openBookId ===
                                                            `row1-${index}`
                                                            ? null
                                                            : `row1-${index}`
                                                    );
                                                }}
                                                preloadedColor={preloadedColors[book._id]}
                                            />
                                        ))}
                                    </div>
                                    {/* Repisa */}
                                    <div className="h-3 bg-gradient-to-b from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800 rounded-sm shadow-md w-[85%] mx-auto"></div>
                                    {/* Postit - Call to Action 1 */}
                                    <div className="absolute bottom-0 left-[8%] bg-yellow-200 dark:bg-yellow-300 shadow-lg px-4 py-2 rounded-sm transform -rotate-2 z-10">
                                        <span className="text-sm text-gray-800 font-medium">
                                            ¡Léeme!
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Fila 2 - Diseño Elegant */}
                            {row2Books.length > 0 && (
                                <div className="overflow-visible flex flex-col justify-end relative">
                                    <div className="flex gap-3 justify-center items-end">
                                        {row2Books.map((book, index) => (
                                            <InteractiveBook
                                                key={book._id}
                                                book={book}
                                                index={index + 3}
                                                isOpen={
                                                    openBookId ===
                                                    `row2-${index}`
                                                }
                                                designType="elegant"
                                                onToggle={() => {
                                                    setOpenBookId(
                                                        openBookId ===
                                                            `row2-${index}`
                                                            ? null
                                                            : `row2-${index}`
                                                    );
                                                }}
                                                preloadedColor={preloadedColors[book._id]}
                                            />
                                        ))}
                                    </div>
                                    {/* Repisa */}
                                    <div className="h-3 bg-gradient-to-b from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800 rounded-sm shadow-md w-[85%] mx-auto"></div>
                                    {/* Postit - Call to Action 2 */}
                                    <div className="absolute bottom-0 right-[8%] bg-pink-200 dark:bg-pink-300 shadow-lg px-4 py-2 rounded-sm transform -rotate-1 z-10">
                                        <span className="text-sm text-gray-800 font-medium">
                                            Descúbrelo
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Fila 3 - Diseño Minimalist */}
                            {row3Books.length > 0 && (
                                <div className="overflow-visible flex flex-col justify-end relative">
                                    <div className="flex gap-3 justify-center items-end">
                                        {row3Books.map((book, index) => (
                                            <InteractiveBook
                                                key={book._id}
                                                book={book}
                                                index={index + 5}
                                                isOpen={
                                                    openBookId ===
                                                    `row3-${index}`
                                                }
                                                designType="minimalist"
                                                onToggle={() => {
                                                    setOpenBookId(
                                                        openBookId ===
                                                            `row3-${index}`
                                                            ? null
                                                            : `row3-${index}`
                                                    );
                                                }}
                                                preloadedColor={preloadedColors[book._id]}
                                            />
                                        ))}
                                    </div>
                                    {/* Repisa */}
                                    <div className="h-3 bg-gradient-to-b from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800 rounded-sm shadow-md w-[85%] mx-auto"></div>
                                    {/* Postit - Call to Action 3 */}
                                    <div className="absolute bottom-0 left-[8%] bg-green-200 dark:bg-green-300 shadow-lg px-4 py-2 rounded-sm transform -rotate-1 z-10">
                                        <span className="text-sm text-gray-800 font-medium">
                                            ¡Empieza ya!
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </section>
            <section className="bg-background-light p-16 sm:pb-24 dark:bg-background-dark/50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Autores Populares
                        </h3>
                        <Link
                            className="text-sm font-medium hover:underline text-blue-500"
                            to={'autores'}
                        >
                            Ver todo
                        </Link>
                    </div>
                    {authors.length === 0 ? (
                        <div className="mt-8">
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                                {[
                                    "Grandes autores",
                                    "Próximamente",
                                    "Escritores famosos",
                                    "Nuevos talentos",
                                    "Pronto aquí",
                                    "Esperando..."
                                ].map((text, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col items-center gap-3 p-4 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border border-slate-300 dark:border-slate-700 hover:shadow-lg transition-shadow"
                                    >
                                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 dark:from-blue-600 dark:to-purple-700 flex items-center justify-center shadow-md">
                                            <svg
                                                className="w-12 h-12 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                />
                                            </svg>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                {text}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Muy pronto
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <AuthorsGrid authors={authors} />
                    )}
                </div>
            </section>
            <section className="bg-background-light pb-16 sm:pb-24 dark:bg-background-dark/50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Explorar por categoría
                        </h3>
                        <Link
                            className="text-sm font-medium hover:underline text-blue-500"
                            to={'categorias'}
                        >
                            Ver todo
                        </Link>
                    </div>
                    {categories.length === 0 ? (
                        <div className="mt-8">
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                {[
                                    { name: "Ficción", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
                                    { name: "No Ficción", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
                                    { name: "Ciencia", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" },
                                    { name: "Historia", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
                                    { name: "Infantil", icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
                                    { name: "Poesía", icon: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" },
                                    { name: "Próximamente", icon: "M12 4v16m8-8H4" },
                                    { name: "Más...", icon: "M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" }
                                ].map((category, index) => (
                                    <div
                                        key={index}
                                        className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow group"
                                    >
                                        <div className="aspect-[4/3] bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 relative">
                                            <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <svg
                                                    className="w-16 h-16 text-white opacity-70"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1.5}
                                                        d={category.icon}
                                                    />
                                                </svg>
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                                <h4 className="text-lg font-bold text-white">
                                                    {category.name}
                                                </h4>
                                                <p className="text-sm text-white/80">
                                                    Próximamente
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <CategoriesGrid categories={categories} />
                    )}
                </div>
            </section>
        </>
    );
};
