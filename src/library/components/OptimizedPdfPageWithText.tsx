import { useEffect, useRef, useState, memo } from 'react';
import { Spinner } from '@/components/ui/spinner';

interface OptimizedPdfPageWithTextProps {
  pageNumber: number;
  imageUrl: string | null;
  loading: boolean;
  error: string | null;
  width: number;
  height: number;
  onVisible?: () => void;
  className?: string;
  // Nuevo: para renderizar text layer
  pdfDocument?: any; // PDFDocumentProxy
  scale?: number;
}

/**
 * Componente optimizado que muestra el canvas Y permite selección de texto
 * Inspirado en Apple Books y Google Books
 */
const OptimizedPdfPageWithTextComponent = ({
  pageNumber,
  imageUrl,
  loading,
  error,
  width,
  height,
  onVisible,
  className = '',
  pdfDocument,
  scale = 1.5,
}: OptimizedPdfPageWithTextProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [textLayerRendered, setTextLayerRendered] = useState(false);

  // Intersection Observer para detectar visibilidad
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            onVisible?.();
          }
        });
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.01,
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isVisible, onVisible]);

  // Renderizar text layer cuando la imagen está cargada
  useEffect(() => {
    const renderTextLayer = async () => {
      if (!pdfDocument || !textLayerRef.current || !imageLoaded || textLayerRendered) {
        return;
      }

      try {
        const page = await pdfDocument.getPage(pageNumber);

        // Limpiar contenido anterior
        textLayerRef.current.innerHTML = '';

        // Obtener contenido de texto
        const textContent = await page.getTextContent();

        // Renderizar text layer manualmente
        textContent.items.forEach((item: any) => {
          const textDiv = document.createElement('span');
          textDiv.textContent = item.str;
          textDiv.style.position = 'absolute';
          textDiv.style.left = `${item.transform[4]}px`;
          textDiv.style.top = `${item.transform[5]}px`;
          textDiv.style.fontSize = `${Math.sqrt(item.transform[0] * item.transform[0] + item.transform[1] * item.transform[1])}px`;
          textDiv.style.fontFamily = item.fontName;
          textLayerRef.current!.appendChild(textDiv);
        });

        setTextLayerRendered(true);

        // Limpiar página para liberar memoria
        page.cleanup();
      } catch (error) {
        console.error(`Error rendering text layer for page ${pageNumber}:`, error);
      }
    };

    renderTextLayer();
  }, [pdfDocument, pageNumber, scale, imageLoaded, textLayerRendered]);

  // Resetear estado cuando cambia la página
  useEffect(() => {
    setImageLoaded(false);
    setTextLayerRendered(false);
  }, [imageUrl, pageNumber]);

  return (
    <div
      ref={containerRef}
      className={`relative bg-white shadow-2xl flex items-center justify-center overflow-hidden ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        minWidth: `${width}px`,
        minHeight: `${height}px`,
      }}
    >
      {/* Estado: Error */}
      {error && (
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <span className="material-symbols-outlined text-4xl text-destructive mb-2">
            error
          </span>
          <p className="text-sm text-destructive">{error}</p>
          <p className="text-xs text-muted-foreground mt-1">Página {pageNumber}</p>
        </div>
      )}

      {/* Estado: Cargando */}
      {!error && (loading || !imageUrl || !imageLoaded) && (
        <div className="flex flex-col items-center justify-center">
          <Spinner />
          <p className="text-xs text-muted-foreground mt-2">
            Cargando página {pageNumber}...
          </p>
        </div>
      )}

      {/* Canvas: Imagen visual del PDF - VISIBLE (z-index: 1) */}
      {!error && imageUrl && isVisible && (
        <img
          src={imageUrl}
          alt={`Página ${pageNumber}`}
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            zIndex: 1,
          }}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            console.error(`Error loading image for page ${pageNumber}`);
          }}
          loading="lazy"
          decoding="async"
        />
      )}

      {/* Text Layer: INVISIBLE pero seleccionable encima del canvas (z-index: 2) */}
      {!error && imageUrl && isVisible && pdfDocument && (
        <div
          ref={textLayerRef}
          className="textLayer absolute inset-0 overflow-hidden"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            zIndex: 2,
          }}
        />
      )}

      {/* Número de página */}
      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded pointer-events-none">
        {pageNumber}
      </div>

      <style>{`
        /* Text layer: invisible pero seleccionable */
        .textLayer {
          position: absolute;
          text-align: initial;
          inset: 0;
          overflow: hidden;
          line-height: 1;
          -webkit-text-size-adjust: none;
          text-size-adjust: none;
          forced-color-adjust: none;
          transform-origin: 0 0;
          z-index: 2;
          caret-color: CanvasText;
          opacity: 1; /* Visible pero con texto transparente */
        }

        .textLayer :is(span, br) {
          color: transparent; /* Texto invisible */
          position: absolute;
          white-space: pre;
          cursor: text;
          transform-origin: 0% 0%;
          user-select: text;
        }

        /* Selección de texto VISIBLE con fondo azul */
        .textLayer ::selection {
          background: rgba(74, 144, 226, 0.4) !important;
          color: transparent !important;
        }

        .textLayer ::-moz-selection {
          background: rgba(74, 144, 226, 0.4) !important;
          color: transparent !important;
        }

        .textLayer span::selection {
          background: rgba(74, 144, 226, 0.4) !important;
          color: transparent !important;
        }

        .textLayer span::-moz-selection {
          background: rgba(74, 144, 226, 0.4) !important;
          color: transparent !important;
        }

        .textLayer br::selection {
          background: transparent;
        }

        .textLayer br::-moz-selection {
          background: transparent;
        }

        .textLayer .highlight {
          margin: -1px;
          padding: 1px;
          background-color: rgba(180, 0, 170, 0.25);
          border-radius: 4px;
        }

        /* Asegurar que el texto sea seleccionable */
        .textLayer * {
          user-select: text !important;
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
        }
      `}</style>
    </div>
  );
};

// Memorizar el componente
export const OptimizedPdfPageWithText = memo(
  OptimizedPdfPageWithTextComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.pageNumber === nextProps.pageNumber &&
      prevProps.imageUrl === nextProps.imageUrl &&
      prevProps.loading === nextProps.loading &&
      prevProps.error === nextProps.error &&
      prevProps.width === nextProps.width &&
      prevProps.height === nextProps.height &&
      prevProps.pdfDocument === nextProps.pdfDocument
    );
  }
);

OptimizedPdfPageWithText.displayName = 'OptimizedPdfPageWithText';
