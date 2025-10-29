import type { Book } from '@/library/interfaces/book.interface';
import { Link } from 'react-router';
import { useState, useEffect } from 'react';

type SpineDesignType =
    | 'classic'
    | 'modern'
    | 'elegant'
    | 'vintage'
    | 'minimalist';

interface InteractiveBookProps {
    book: Book;
    index: number;
    isOpen: boolean;
    onToggle: () => void;
    designType?: SpineDesignType;
    onColorLoaded?: () => void;
    preloadedColor?: string;
}

export const InteractiveBook = ({
    book,
    index,
    isOpen,
    onToggle,
    designType = 'minimalist',
    onColorLoaded,
    preloadedColor,
}: InteractiveBookProps) => {
    const [spineColor, setSpineColor] = useState<string>(
        preloadedColor || '#3b82f6'
    );

    // Extraer color dominante de la imagen de la portada (solo si no viene pre-cargado)
    useEffect(() => {
        // Si ya viene un color pre-cargado, no hace falta extraerlo
        if (preloadedColor) {
            return;
        }

        if (!book.coverImage) {
            // Si no hay imagen, notificar que está listo inmediatamente
            if (onColorLoaded) onColorLoaded();
            return;
        }

        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = `${import.meta.env.VITE_API_URL}/files/cover/${
            book.coverImage
        }`;

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    if (onColorLoaded) onColorLoaded();
                    return;
                }

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

                let r = 0,
                    g = 0,
                    b = 0;
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

                setSpineColor(`rgb(${r}, ${g}, ${b})`);

                // Notificar que el color está listo
                if (onColorLoaded) onColorLoaded();
            } catch (error) {
                console.error('Error extracting color:', error);
                if (onColorLoaded) onColorLoaded();
            }
        };

        img.onerror = () => {
            console.error('Error loading image');
            if (onColorLoaded) onColorLoaded();
        };
    }, [book.coverImage, onColorLoaded, preloadedColor]);

    // Texturas para el lomo
    const textureStyles = [
        // Azul primary
        {
            background: '#3b82f6',
            texture:
                'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, transparent 50%)',
            textureSize: '4px 4px',
        },
        // Azul medio
        {
            background: '#2563eb',
            texture:
                'linear-gradient(45deg, rgba(0,0,0,0.15) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.15) 75%)',
            textureSize: '2px 2px',
        },
        // Azul sky
        {
            background: '#0284c7',
            texture:
                'radial-gradient(circle, rgba(0,0,0,0.2) 1px, transparent 1px)',
            textureSize: '6px 6px',
        },
        // Azul cyan
        {
            background: '#0891b2',
            texture:
                'repeating-linear-gradient(90deg, rgba(0,0,0,0.1) 0px, transparent 1px, transparent 2px)',
            textureSize: '3px 3px',
        },
        // Azul indigo
        {
            background: '#6366f1',
            texture:
                'radial-gradient(ellipse at top, rgba(255,255,255,0.15) 0%, transparent 60%)',
            textureSize: '8px 8px',
        },
        // Azul brillante
        {
            background: '#0ea5e9',
            texture:
                'linear-gradient(0deg, rgba(0,0,0,0.12) 50%, transparent 50%)',
            textureSize: '1px 2px',
        },
        // Azul profundo
        {
            background: '#1d4ed8',
            texture:
                'radial-gradient(circle at center, rgba(0,0,0,0.25) 0%, transparent 70%)',
            textureSize: '5px 5px',
        },
        // Azul teal
        {
            background: '#06b6d4',
            texture:
                'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%)',
            textureSize: '3px 3px',
        },
    ];

    // Renderizar diseño del lomo según el tipo especificado
    const renderSpineDesign = () => {
        const texture = textureStyles[index % textureStyles.length];
        const baseClasses = `
            h-[200px] w-28 flex-shrink-0
            cursor-pointer
            transition-all duration-300 ease-out
            hover:brightness-110
            shadow-lg
            ${isOpen ? 'rounded-l-lg' : 'rounded-lg'}
            relative
        `;

        const combinedStyle = {
            backgroundImage: `${texture.texture}, linear-gradient(${spineColor}, ${spineColor})`,
            backgroundSize: `${texture.textureSize}, 100%`,
        };

        switch (designType) {
            case 'classic':
                // Diseño 1: Clásico
                return (
                    <div
                        className={`${baseClasses} flex flex-row items-center justify-center gap-2 px-2 py-2`}
                        style={combinedStyle}
                        onClick={onToggle}
                    >
                        <div className="writing-mode-vertical transform rotate-180 overflow-hidden">
                            <p className="text-sm font-bold text-white truncate max-w-[140px]">
                                {book.title}
                            </p>
                        </div>
                        <div className="writing-mode-vertical transform rotate-180 overflow-hidden">
                            <p className="text-xs text-white/80 font-light truncate max-w-[140px]">{`${book.author.person.firstName} ${book.author.person.lastName}`}</p>
                        </div>
                    </div>
                );

            case 'modern':
                // Diseño 2: Moderno
                return (
                    <div
                        className={`${baseClasses} flex flex-row items-center justify-center gap-2 px-2 py-2`}
                        style={combinedStyle}
                        onClick={onToggle}
                    >
                        <div className="writing-mode-vertical transform rotate-180 overflow-hidden">
                            <p className="text-sm font-bold text-white truncate max-w-[140px]">
                                {book.title}
                            </p>
                        </div>
                        <div className="writing-mode-vertical transform rotate-180 overflow-hidden">
                            <p className="text-xs text-white/90 truncate max-w-[140px]">{`${book.author.person.firstName} ${book.author.person.lastName}`}</p>
                        </div>
                    </div>
                );

            case 'elegant':
                // Diseño 3: Elegante
                return (
                    <div
                        className={`${baseClasses} flex flex-row items-center justify-center gap-2 px-2 py-2`}
                        style={combinedStyle}
                        onClick={onToggle}
                    >
                        <div className="writing-mode-vertical transform rotate-180 overflow-hidden">
                            <p className="text-sm font-bold text-white tracking-wide truncate max-w-[140px]">
                                {book.title}
                            </p>
                        </div>
                        <div className="writing-mode-vertical transform rotate-180 overflow-hidden">
                            <p className="text-xs text-white/80 uppercase tracking-wider truncate max-w-[140px]">{`${book.author.person.firstName} ${book.author.person.lastName}`}</p>
                        </div>
                    </div>
                );

            case 'vintage':
                // Diseño 4: Vintage
                return (
                    <div
                        className={`${baseClasses} flex flex-row items-center justify-center gap-2 px-2 py-2`}
                        style={combinedStyle}
                        onClick={onToggle}
                    >
                        <div className="writing-mode-vertical transform rotate-180 overflow-hidden">
                            <p className="text-sm font-bold text-white truncate max-w-[140px]">
                                {book.title}
                            </p>
                        </div>
                        <div className="writing-mode-vertical transform rotate-180 overflow-hidden">
                            <p className="text-xs text-white/75 font-light italic truncate max-w-[140px]">{`${book.author.person.firstName} ${book.author.person.lastName}`}</p>
                        </div>
                    </div>
                );

            case 'minimalist':
            default:
                // Diseño 5: Minimalista - Título izquierda, autor derecha
                return (
                    <div
                        className={`${baseClasses} flex flex-row items-center justify-center gap-2 px-2 py-2`}
                        style={combinedStyle}
                        onClick={onToggle}
                    >
                        <div className="writing-mode-vertical transform rotate-180 overflow-hidden">
                            <p className="text-sm font-bold text-white tracking-tight truncate max-w-[140px]">
                                {book.title}
                            </p>
                        </div>
                        <div className="writing-mode-vertical transform rotate-180 overflow-hidden">
                            <p className="text-xs text-white/80 font-light truncate max-w-[140px]">{`${book.author.person.firstName} ${book.author.person.lastName}`}</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div
            className="min-h-book transition-all duration-300 ease-out flex-shrink-0 flex hover:-translate-y-2 hover:shadow-2xl group"
            style={{
                width: isOpen ? '332px' : '112px',
                zIndex: isOpen ? 40 : 10 - index,
            }}
        >
            {/* Lomo del libro con diseño personalizado */}
            {renderSpineDesign()}

            {/* Portada desplegable */}
            <Link
                to={`/libros/detalle/${book._id}`}
                className={`
                    h-[200px]
                    shadow-2xl
                    transition-all duration-300 ease-in-out
                    overflow-hidden
                    rounded-r-lg
                    group-hover:brightness-105
                    relative
                    ${
                        isOpen
                            ? 'w-56 opacity-100'
                            : 'w-0 opacity-0 pointer-events-none'
                    }
                `}
                style={{ zIndex: isOpen ? '1' : 'auto' }}
            >
                {/* Imagen de fondo que ocupa toda la portada */}
                {book.coverImage ? (
                    <img
                        src={`${import.meta.env.VITE_API_URL}/files/cover/${
                            book.coverImage
                        }`}
                        alt={book.title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-slate-400 dark:bg-slate-600 flex items-center justify-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-16 w-16 text-blue-500 dark:text-blue-400"
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
                )}

                {/* Overlay oscuro para mejor legibilidad del texto */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                {/* Información del libro superpuesta */}
                <div className="absolute inset-0 p-3 flex flex-col justify-end">
                    <h3 className="font-bold text-sm text-white mb-1 line-clamp-2 drop-shadow-lg">
                        {book.title}
                    </h3>
                    <p className="text-xs text-white/90 mb-0.5 drop-shadow-md">
                        {`${book.author.person.firstName} ${book.author.person.lastName}`}
                    </p>
                    <p className="text-xs text-white/80 drop-shadow-md">
                        {book.publicationYear} • {book.category.name}
                    </p>
                </div>

                {/* Botón de cierre (X) en la esquina superior derecha */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggle();
                    }}
                    className="
                        absolute top-2 right-2
                        w-8 h-8
                        bg-white/20 backdrop-blur-sm
                        hover:bg-white/30
                        rounded-full
                        flex items-center justify-center
                        text-white
                        transition-colors duration-200
                        z-20
                    "
                    aria-label="Cerrar"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </Link>
        </div>
    );
};
