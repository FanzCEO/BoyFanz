/**
 * F2-F3: PERFORMANCE - Core Web Vitals & Error Tracking
 *
 * Features:
 * - F2: Track Core Web Vitals (LCP, FID/INP, CLS)
 * - F3: Error tracking and reporting
 * - Admin-only metrics dashboard
 * - No impact on end-user experience
 */

// Core Web Vitals metrics
export interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'INP' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay (deprecated, use INP)
  cls?: number; // Cumulative Layout Shift
  inp?: number; // Interaction to Next Paint
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte

  // Additional metrics
  domLoad?: number;
  windowLoad?: number;
  firstPaint?: number;

  // Page metadata
  url: string;
  timestamp: number;
  userAgent: string;
  connection?: string;
}

export interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  line?: number;
  column?: number;
  timestamp: number;
  userAgent: string;
  userId?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    url: window.location.href,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    connection: (navigator as any).connection?.effectiveType || 'unknown',
  };

  private errors: ErrorReport[] = [];
  private isAdmin = false;

  constructor() {
    this.checkAdminStatus();
    this.initCoreWebVitals();
    this.initErrorTracking();
    this.initPerformanceObserver();
  }

  private async checkAdminStatus() {
    try {
      const response = await fetch('/api/auth/check-admin');
      const data = await response.json();
      this.isAdmin = data.isAdmin || data.isSuperAdmin;
    } catch {
      this.isAdmin = false;
    }
  }

  // F2: Core Web Vitals tracking
  private initCoreWebVitals() {
    // Use web-vitals library if available, otherwise use PerformanceObserver
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
          this.reportMetric('LCP', this.metrics.lcp);
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {
        console.warn('LCP observation not supported');
      }

      // First Input Delay (FID) - deprecated but still tracked
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.metrics.fid = entry.processingStart - entry.startTime;
            this.reportMetric('FID', this.metrics.fid);
          });
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
      } catch (e) {
        console.warn('FID observation not supported');
      }

      // Interaction to Next Paint (INP) - replacement for FID
      try {
        const inpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.metrics.inp = entry.duration;
            this.reportMetric('INP', this.metrics.inp);
          });
        });
        inpObserver.observe({ type: 'event', buffered: true, durationThreshold: 40 });
      } catch (e) {
        console.warn('INP observation not supported');
      }

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      try {
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              this.metrics.cls = clsValue;
              this.reportMetric('CLS', clsValue);
            }
          }
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        console.warn('CLS observation not supported');
      }
    }
  }

  // F2: Additional performance metrics
  private initPerformanceObserver() {
    if ('performance' in window) {
      // Wait for page load
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0] as any;
          if (perfData) {
            this.metrics.domLoad = perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart;
            this.metrics.windowLoad = perfData.loadEventEnd - perfData.loadEventStart;
            this.metrics.ttfb = perfData.responseStart - perfData.requestStart;
          }

          // First Contentful Paint
          const fcp = performance.getEntriesByName('first-contentful-paint')[0] as any;
          if (fcp) {
            this.metrics.fcp = fcp.startTime;
            this.reportMetric('FCP', fcp.startTime);
          }

          // Report all metrics after load
          this.sendMetrics();
        }, 0);
      });
    }
  }

  // F3: Error tracking
  private initErrorTracking() {
    // Global error handler
    window.addEventListener('error', (event) => {
      const error: ErrorReport = {
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        line: event.lineno,
        column: event.colno,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
      };
      this.errors.push(error);
      this.reportError(error);
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error: ErrorReport = {
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        url: window.location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
      };
      this.errors.push(error);
      this.reportError(error);
    });
  }

  private reportMetric(name: string, value: number) {
    // Only send to server if admin (to reduce overhead)
    if (!this.isAdmin) return;

    // Log locally for debugging
    console.debug(`[Performance] ${name}: ${value.toFixed(2)}ms`);
  }

  private reportError(error: ErrorReport) {
    // Send error to server (always, not just for admins)
    fetch('/api/monitoring/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(error),
    }).catch(() => {
      // Silently fail to avoid error loops
    });
  }

  private sendMetrics() {
    // Only send metrics if admin
    if (!this.isAdmin) return;

    fetch('/api/monitoring/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.metrics),
    }).catch(() => {
      // Silently fail
    });
  }

  // Public API
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getErrors(): ErrorReport[] {
    return [...this.errors];
  }
}

// Singleton instance
let monitorInstance: PerformanceMonitor | null = null;

export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;
  if (monitorInstance) return monitorInstance;

  monitorInstance = new PerformanceMonitor();
  return monitorInstance;
}

export function getPerformanceMonitor(): PerformanceMonitor | null {
  return monitorInstance;
}
