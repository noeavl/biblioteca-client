import { memo } from 'react';

interface PdfPageSkeletonProps {
  width: number;
  height: number;
  pageNumber?: number;
}

/**
 * Skeleton loader para páginas PDF
 * Muestra un placeholder mientras la página se carga
 */
const PdfPageSkeletonComponent = ({
  width,
  height,
  pageNumber,
}: PdfPageSkeletonProps) => {
  return (
    <div
      className="relative bg-muted/30 shadow-2xl flex-shrink-0 overflow-hidden animate-pulse"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        minWidth: `${width}px`,
        minHeight: `${height}px`,
      }}
    >
      {/* Skeleton lines para simular texto */}
      <div className="absolute inset-0 p-8 flex flex-col gap-3">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-4/5" />

        <div className="mt-4 h-4 bg-muted rounded w-2/3" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-5/6" />

        <div className="mt-4 h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-4/5" />
      </div>

      {/* Número de página */}
      {pageNumber && (
        <div className="absolute bottom-4 right-4 bg-muted/50 text-muted-foreground text-xs px-3 py-1.5 rounded">
          {pageNumber}
        </div>
      )}
    </div>
  );
};

export const PdfPageSkeleton = memo(PdfPageSkeletonComponent);
PdfPageSkeleton.displayName = 'PdfPageSkeleton';
