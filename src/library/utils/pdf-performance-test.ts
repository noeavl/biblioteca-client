/**
 * Utilidades para medir performance del lector de PDF
 * Útil para comparar versión antigua vs optimizada
 */

export class PdfPerformanceMonitor {
  private startTimes: Map<string, number> = new Map();
  private metrics: Map<string, number[]> = new Map();

  /**
   * Inicia medición de tiempo
   */
  start(label: string): void {
    this.startTimes.set(label, performance.now());
  }

  /**
   * Termina medición y guarda resultado
   */
  end(label: string): number {
    const startTime = this.startTimes.get(label);
    if (!startTime) {
      console.warn(`No start time found for: ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;

    // Guardar en array de métricas
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label)!.push(duration);

    this.startTimes.delete(label);
    return duration;
  }

  /**
   * Obtiene estadísticas de una métrica
   */
  getStats(label: string): {
    count: number;
    min: number;
    max: number;
    avg: number;
    total: number;
  } | null {
    const values = this.metrics.get(label);
    if (!values || values.length === 0) return null;

    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      total: values.reduce((a, b) => a + b, 0),
    };
  }

  /**
   * Imprime reporte de todas las métricas
   */
  report(): void {
    console.group('📊 PDF Reader Performance Report');

    for (const [label] of this.metrics.entries()) {
      const stats = this.getStats(label);
      if (!stats) continue;

      console.group(`📈 ${label}`);
      console.log(`Count: ${stats.count}`);
      console.log(`Min: ${stats.min.toFixed(2)}ms`);
      console.log(`Max: ${stats.max.toFixed(2)}ms`);
      console.log(`Avg: ${stats.avg.toFixed(2)}ms`);
      console.log(`Total: ${stats.total.toFixed(2)}ms`);
      console.groupEnd();
    }

    console.groupEnd();
  }

  /**
   * Limpia todas las métricas
   */
  clear(): void {
    this.startTimes.clear();
    this.metrics.clear();
  }

  /**
   * Mide uso de memoria (si está disponible)
   */
  getMemoryUsage(): {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null {
    // @ts-ignore - performance.memory no está en todos los navegadores
    if (performance.memory) {
      // @ts-ignore
      return {
        // @ts-ignore
        usedJSHeapSize: performance.memory.usedJSHeapSize / 1048576, // MB
        // @ts-ignore
        totalJSHeapSize: performance.memory.totalJSHeapSize / 1048576, // MB
        // @ts-ignore
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit / 1048576, // MB
      };
    }
    return null;
  }

  /**
   * Reporta uso de memoria
   */
  reportMemory(): void {
    const memory = this.getMemoryUsage();
    if (!memory) {
      console.warn('Memory API not available in this browser');
      return;
    }

    console.group('💾 Memory Usage');
    console.log(`Used: ${memory.usedJSHeapSize.toFixed(2)} MB`);
    console.log(`Total: ${memory.totalJSHeapSize.toFixed(2)} MB`);
    console.log(`Limit: ${memory.jsHeapSizeLimit.toFixed(2)} MB`);
    console.log(`Usage: ${((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2)}%`);
    console.groupEnd();
  }
}

// Exportar instancia singleton
export const pdfPerformanceMonitor = new PdfPerformanceMonitor();

// Ejemplo de uso:
// import { pdfPerformanceMonitor } from '@/library/utils/pdf-performance-test';
//
// pdfPerformanceMonitor.start('page-render');
// // ... renderizar página
// pdfPerformanceMonitor.end('page-render');
//
// pdfPerformanceMonitor.report();
// pdfPerformanceMonitor.reportMemory();
