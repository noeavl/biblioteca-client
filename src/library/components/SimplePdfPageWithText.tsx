import { memo } from 'react';
import { Page } from 'react-pdf';
import { Spinner } from '@/components/ui/spinner';

interface SimplePdfPageWithTextProps {
  pageNumber: number;
  width: number;
  height: number;
  className?: string;
}

/**
 * Componente simple que muestra página con canvas Y text layer
 * Canvas visible + Text layer invisible encima
 */
const SimplePdfPageWithTextComponent = ({
  pageNumber,
  width,
  height,
  className = '',
}: SimplePdfPageWithTextProps) => {
  return (
    <div
      className={`relative bg-white shadow-2xl flex items-center justify-center overflow-hidden ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        minWidth: `${width}px`,
        minHeight: `${height}px`,
      }}
    >
      <Page
        pageNumber={pageNumber}
        width={width}
        renderAnnotationLayer={false}
        renderTextLayer={true}
        renderMode="canvas"
        loading={
          <div className="flex flex-col items-center justify-center">
            <Spinner />
            <p className="text-xs text-muted-foreground mt-2">
              Cargando página {pageNumber}...
            </p>
          </div>
        }
      />

      {/* Número de página */}
      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded pointer-events-none z-10">
        {pageNumber}
      </div>

      <style jsx>{`
        /* Canvas visible */
        :global(.react-pdf__Page__canvas) {
          display: block !important;
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        /* Text layer invisible pero seleccionable */
        :global(.react-pdf__Page__textContent) {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          overflow: hidden !important;
          opacity: 1 !important;
          line-height: 1 !important;
          z-index: 2 !important;
        }

        :global(.react-pdf__Page__textContent span) {
          color: transparent !important;
          position: absolute !important;
          white-space: pre !important;
          cursor: text !important;
          transform-origin: 0% 0% !important;
          user-select: text !important;
          -webkit-user-select: text !important;
        }

        /* Selección de texto VISIBLE */
        :global(.react-pdf__Page__textContent span::selection) {
          background: rgba(74, 144, 226, 0.5) !important;
          color: transparent !important;
        }

        :global(.react-pdf__Page__textContent span::-moz-selection) {
          background: rgba(74, 144, 226, 0.5) !important;
          color: transparent !important;
        }

        :global(.react-pdf__Page__textContent::selection) {
          background: rgba(74, 144, 226, 0.5) !important;
        }

        :global(.react-pdf__Page__textContent::-moz-selection) {
          background: rgba(74, 144, 226, 0.5) !important;
        }
      `}</style>
    </div>
  );
};

export const SimplePdfPageWithText = memo(
  SimplePdfPageWithTextComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.pageNumber === nextProps.pageNumber &&
      prevProps.width === nextProps.width &&
      prevProps.height === nextProps.height
    );
  }
);

SimplePdfPageWithText.displayName = 'SimplePdfPageWithText';
