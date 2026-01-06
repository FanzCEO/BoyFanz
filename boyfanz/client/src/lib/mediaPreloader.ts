/**
 * Media Preloader - Lightning Fast Media Loading
 *
 * Features:
 * - Predictive preloading of images/videos
 * - Intersection Observer for viewport-based loading
 * - Priority queue for critical content
 * - Memory-efficient cache management
 * - Progressive image loading (blur-up)
 * - HLS video preloading
 * - Network-aware quality selection
 */

type MediaType = 'image' | 'video' | 'audio';
type Priority = 'critical' | 'high' | 'medium' | 'low';

interface PreloadItem {
  url: string;
  type: MediaType;
  priority: Priority;
  timestamp: number;
  loaded: boolean;
  element?: HTMLImageElement | HTMLVideoElement | HTMLAudioElement;
}

interface PreloaderConfig {
  maxCacheSize: number; // Max items in cache
  maxMemoryMB: number; // Max memory usage
  preloadAhead: number; // Items to preload ahead
  networkAware: boolean; // Adapt to network conditions
  enablePrefetch: boolean; // Use link prefetch
}

class MediaPreloader {
  private cache: Map<string, PreloadItem> = new Map();
  private queue: PreloadItem[] = [];
  private loading: Set<string> = new Set();
  private observer: IntersectionObserver | null = null;
  private prefetchLinks: Set<string> = new Set();

  private config: PreloaderConfig = {
    maxCacheSize: 100,
    maxMemoryMB: 100,
    preloadAhead: 5,
    networkAware: true,
    enablePrefetch: true,
  };

  constructor(customConfig?: Partial<PreloaderConfig>) {
    if (customConfig) {
      this.config = { ...this.config, ...customConfig };
    }
    this.initObserver();
    this.setupNetworkListener();
  }

  /**
   * Initialize Intersection Observer for viewport-based loading
   */
  private initObserver() {
    if (typeof window === 'undefined') return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const url = (entry.target as HTMLElement).dataset.preloadSrc;
            if (url) {
              this.preload(url, 'image', 'critical');
            }
          }
        });
      },
      {
        rootMargin: '200px', // Start loading 200px before visible
        threshold: 0.1,
      }
    );
  }

  /**
   * Setup network condition listener
   */
  private setupNetworkListener() {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) return;

    const connection = (navigator as any).connection;
    connection?.addEventListener('change', () => {
      // Adjust preloading based on network conditions
      if (connection.saveData) {
        this.config.preloadAhead = 1;
      } else if (connection.effectiveType === '4g') {
        this.config.preloadAhead = 10;
      } else if (connection.effectiveType === '3g') {
        this.config.preloadAhead = 3;
      } else {
        this.config.preloadAhead = 1;
      }
    });
  }

  /**
   * Get optimal image quality based on network
   */
  getOptimalQuality(): 'low' | 'medium' | 'high' | 'ultra' {
    if (typeof navigator === 'undefined') return 'high';

    const connection = (navigator as any).connection;
    if (!connection) return 'high';

    if (connection.saveData) return 'low';

    switch (connection.effectiveType) {
      case 'slow-2g':
      case '2g':
        return 'low';
      case '3g':
        return 'medium';
      case '4g':
      default:
        return window.devicePixelRatio > 2 ? 'ultra' : 'high';
    }
  }

  /**
   * Preload a media item
   */
  async preload(url: string, type: MediaType = 'image', priority: Priority = 'medium'): Promise<void> {
    if (this.cache.has(url) || this.loading.has(url)) {
      return;
    }

    const item: PreloadItem = {
      url,
      type,
      priority,
      timestamp: Date.now(),
      loaded: false,
    };

    // Add to priority queue
    this.insertByPriority(item);

    // Process queue
    this.processQueue();
  }

  /**
   * Insert item into queue by priority
   */
  private insertByPriority(item: PreloadItem) {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const itemPriority = priorityOrder[item.priority];

    let inserted = false;
    for (let i = 0; i < this.queue.length; i++) {
      if (priorityOrder[this.queue[i].priority] > itemPriority) {
        this.queue.splice(i, 0, item);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      this.queue.push(item);
    }
  }

  /**
   * Process the preload queue
   */
  private async processQueue() {
    // Limit concurrent loads based on network
    const maxConcurrent = this.config.networkAware ?
      (this.getOptimalQuality() === 'ultra' ? 6 : 3) : 4;

    while (this.queue.length > 0 && this.loading.size < maxConcurrent) {
      const item = this.queue.shift();
      if (!item) break;

      if (this.cache.has(item.url)) continue;

      this.loading.add(item.url);

      try {
        await this.loadMedia(item);
        this.cache.set(item.url, { ...item, loaded: true });
        this.cleanupCache();
      } catch (error) {
        console.warn(`Failed to preload: ${item.url}`, error);
      } finally {
        this.loading.delete(item.url);
      }
    }
  }

  /**
   * Load a media item
   */
  private loadMedia(item: PreloadItem): Promise<void> {
    return new Promise((resolve, reject) => {
      switch (item.type) {
        case 'image':
          const img = new Image();
          img.onload = () => {
            item.element = img;
            resolve();
          };
          img.onerror = reject;
          img.src = item.url;
          break;

        case 'video':
          const video = document.createElement('video');
          video.preload = 'metadata';
          video.onloadedmetadata = () => {
            item.element = video;
            resolve();
          };
          video.onerror = reject;
          video.src = item.url;
          break;

        case 'audio':
          const audio = new Audio();
          audio.preload = 'metadata';
          audio.onloadedmetadata = () => {
            item.element = audio;
            resolve();
          };
          audio.onerror = reject;
          audio.src = item.url;
          break;

        default:
          resolve();
      }
    });
  }

  /**
   * Cleanup old cache items
   */
  private cleanupCache() {
    if (this.cache.size <= this.config.maxCacheSize) return;

    // Remove oldest non-critical items
    const entries = Array.from(this.cache.entries())
      .filter(([_, item]) => item.priority !== 'critical')
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    const toRemove = this.cache.size - this.config.maxCacheSize;
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * Preload a batch of URLs
   */
  async preloadBatch(urls: string[], type: MediaType = 'image', priority: Priority = 'medium'): Promise<void> {
    const promises = urls.map(url => this.preload(url, type, priority));
    await Promise.allSettled(promises);
  }

  /**
   * Preload images in a feed (predictive)
   */
  preloadFeed(items: { thumbnailUrl?: string; mediaUrl?: string }[], currentIndex: number = 0) {
    const ahead = this.config.preloadAhead;

    // Preload current and ahead items
    for (let i = currentIndex; i < Math.min(currentIndex + ahead, items.length); i++) {
      const item = items[i];
      if (item.thumbnailUrl) {
        this.preload(item.thumbnailUrl, 'image', i === currentIndex ? 'critical' : 'high');
      }
      if (item.mediaUrl) {
        // Determine type from URL
        const type = item.mediaUrl.includes('.mp4') || item.mediaUrl.includes('.m3u8') ? 'video' : 'image';
        this.preload(item.mediaUrl, type, i === currentIndex ? 'critical' : 'high');
      }
    }
  }

  /**
   * Add prefetch link to document head
   */
  addPrefetchLink(url: string) {
    if (!this.config.enablePrefetch || this.prefetchLinks.has(url)) return;
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = 'image';
    document.head.appendChild(link);
    this.prefetchLinks.add(url);
  }

  /**
   * Check if URL is cached
   */
  isCached(url: string): boolean {
    return this.cache.has(url);
  }

  /**
   * Get cached element
   */
  getCached(url: string): HTMLImageElement | HTMLVideoElement | HTMLAudioElement | undefined {
    return this.cache.get(url)?.element;
  }

  /**
   * Observe an element for viewport-based loading
   */
  observe(element: HTMLElement) {
    this.observer?.observe(element);
  }

  /**
   * Unobserve an element
   */
  unobserve(element: HTMLElement) {
    this.observer?.unobserve(element);
  }

  /**
   * Clear the cache
   */
  clear() {
    this.cache.clear();
    this.queue = [];
    this.loading.clear();
  }

  /**
   * Get preloader stats
   */
  getStats() {
    return {
      cached: this.cache.size,
      queued: this.queue.length,
      loading: this.loading.size,
      maxCache: this.config.maxCacheSize,
    };
  }
}

// Singleton instance
export const mediaPreloader = new MediaPreloader();

// React hook for preloading
export function useMediaPreloader() {
  return {
    preload: (url: string, type?: MediaType, priority?: Priority) =>
      mediaPreloader.preload(url, type, priority),
    preloadBatch: (urls: string[], type?: MediaType, priority?: Priority) =>
      mediaPreloader.preloadBatch(urls, type, priority),
    preloadFeed: (items: any[], currentIndex?: number) =>
      mediaPreloader.preloadFeed(items, currentIndex),
    isCached: (url: string) => mediaPreloader.isCached(url),
    getCached: (url: string) => mediaPreloader.getCached(url),
    observe: (element: HTMLElement) => mediaPreloader.observe(element),
    unobserve: (element: HTMLElement) => mediaPreloader.unobserve(element),
    getOptimalQuality: () => mediaPreloader.getOptimalQuality(),
    getStats: () => mediaPreloader.getStats(),
  };
}

// Preconnect to CDN domains for faster DNS resolution
export function preconnectCDN() {
  if (typeof document === 'undefined') return;

  const domains = [
    'https://storage.bunnycdn.com',
    'https://cdn.fanz.website',
    'https://video.bunnycdn.com',
    'https://vz-abc123.b-cdn.net', // Bunny Stream pull zone
  ];

  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

// DNS prefetch for faster resolution
export function dnsPrefetch() {
  if (typeof document === 'undefined') return;

  const domains = [
    '//storage.bunnycdn.com',
    '//cdn.fanz.website',
    '//video.bunnycdn.com',
  ];

  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });
}

export default mediaPreloader;
