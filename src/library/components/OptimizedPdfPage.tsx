import { memo, useState, useEffect } from 'react';
import { Page } from 'react-pdf';
import { PdfPageSkeleton } from './PdfPageSkeleton';

interface OptimizedPdfPageProps {
  pageNumber: number;
  width: number;
  height: number;
  isVisible?: boolean;
}

/**
 * Componente optimizado para renderizar páginas PDF
 * - Usa skeleton loading
 * - Memorizado para evitar re-renders innecesarios
 * - Canvas visible + Text layer seleccionable
 */
const OptimizedPdfPageComponent = ({
  pageNumber,
  width,
  height,
  isVisible = true,
}: OptimizedPdfPageProps) => {
  const [isRendered, setIsRendered] = useState(false);

  // Resetear el estado cuando cambia el número de página
  useEffect(() => {
    setIsRendered(false);
  }, [pageNumber]);

  if (!isVisible) {
    return <PdfPageSkeleton width={width} height={height} pageNumber={pageNumber} />;
  }

  return (
    <div
      className="relative shadow-2xl flex-shrink-0"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        minWidth: `${width}px`,
        minHeight: `${height}px`,
      }}
    >
      {/* Mostrar skeleton hasta que la página esté renderizada */}
      {!isRendered && (
        <div className="absolute inset-0 z-10">
          <PdfPageSkeleton width={width} height={height} pageNumber={pageNumber} />
        </div>
      )}

      {/* Página PDF */}
      <div className={`transition-opacity duration-300 ${isRendered ? 'opacity-100' : 'opacity-0'}`}>
        <Page
          pageNumber={pageNumber}
          width={width}
          renderAnnotationLayer={false}
          renderTextLayer={true}
          renderMode="canvas"
          onRenderSuccess={() => setIsRendered(true)}
          loading={<div />} // Sin loading prop, usamos skeleton
          error={
            <div
              className="flex items-center justify-center bg-destructive/10"
              style={{ width: `${width}px`, height: `${height}px` }}
            >
              <p className="text-sm text-destructive">
                Error al cargar página {pageNumber}
              </p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export const OptimizedPdfPage = memo(
  OptimizedPdfPageComponent,
  (prev, next) =>
    prev.pageNumber === next.pageNumber &&
    prev.width === next.width &&
    prev.height === next.height &&
    prev.isVisible === next.isVisible
);

OptimizedPdfPage.displayName = 'OptimizedPdfPage';
