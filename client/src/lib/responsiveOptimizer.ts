/**
 * MOBILE & RESPONSIVE OPTIMIZATION
 *
 * Ensures optimal experience across all screen sizes
 * - No loss of quality
 * - No loss of features
 * - Adaptive resource loading
 * - Touch-optimized interactions
 */

export type ScreenSize = 'mobile' | 'tablet' | 'desktop' | 'large';
export type Orientation = 'portrait' | 'landscape';

export interface DeviceCapabilities {
  screenSize: ScreenSize;
  orientation: Orientation;
  pixelRatio: number;
  touchEnabled: boolean;
  connectionSpeed: 'slow' | 'medium' | 'fast';
  reducedMotion: boolean;
  darkMode: boolean;
}

export class ResponsiveOptimizer {
  private capabilities: DeviceCapabilities;
  private listeners: Set<(capabilities: DeviceCapabilities) => void> = new Set();

  constructor() {
    this.capabilities = this.detectCapabilities();
    this.setupListeners();
  }

  /**
   * Detect device capabilities
   */
  private detectCapabilities(): DeviceCapabilities {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Screen size detection
    let screenSize: ScreenSize;
    if (width < 768) {
      screenSize = 'mobile';
    } else if (width < 1024) {
      screenSize = 'tablet';
    } else if (width < 1920) {
      screenSize = 'desktop';
    } else {
      screenSize = 'large';
    }

    // Orientation
    const orientation: Orientation = width > height ? 'landscape' : 'portrait';

    // Pixel ratio for retina displays
    const pixelRatio = window.devicePixelRatio || 1;

    // Touch capability
    const touchEnabled = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Connection speed
    const connection = (navigator as any).connection;
    let connectionSpeed: 'slow' | 'medium' | 'fast' = 'medium';
    if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        connectionSpeed = 'slow';
      } else if (effectiveType === '4g') {
        connectionSpeed = 'fast';
      }
    }

    // User preferences
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    return {
      screenSize,
      orientation,
      pixelRatio,
      touchEnabled,
      connectionSpeed,
      reducedMotion,
      darkMode,
    };
  }

  /**
   * Setup listeners for capability changes
   */
  private setupListeners(): void {
    // Resize listener (debounced)
    let resizeTimeout: NodeJS.Timeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.capabilities = this.detectCapabilities();
        this.notifyListeners();
      }, 250);
    });

    // Orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.capabilities = this.detectCapabilities();
        this.notifyListeners();
      }, 100);
    });

    // Connection change
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', () => {
        this.capabilities = this.detectCapabilities();
        this.notifyListeners();
      });
    }

    // Media query listeners
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionQuery.addEventListener('change', () => {
      this.capabilities.reducedMotion = reducedMotionQuery.matches;
      this.notifyListeners();
    });

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeQuery.addEventListener('change', () => {
      this.capabilities.darkMode = darkModeQuery.matches;
      this.notifyListeners();
    });
  }

  /**
   * Notify listeners of capability changes
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.capabilities));
  }

  /**
   * Subscribe to capability changes
   */
  onChange(callback: (capabilities: DeviceCapabilities) => void): () => void {
    this.listeners.add(callback);
    // Return unsubscribe function
    return () => this.listeners.delete(callback);
  }

  /**
   * Get current capabilities
   */
  getCapabilities(): DeviceCapabilities {
    return { ...this.capabilities };
  }

  /**
   * Get optimal image size for current device
   */
  getOptimalImageSize(): { width: number; quality: number } {
    const { screenSize, pixelRatio, connectionSpeed } = this.capabilities;

    let baseWidth: number;
    switch (screenSize) {
      case 'mobile':
        baseWidth = 640;
        break;
      case 'tablet':
        baseWidth = 1024;
        break;
      case 'desktop':
        baseWidth = 1920;
        break;
      case 'large':
        baseWidth = 2560;
        break;
    }

    // Adjust for pixel ratio (retina)
    const width = Math.min(baseWidth * pixelRatio, 3840); // Max 4K

    // Adjust quality based on connection
    let quality: number;
    switch (connectionSpeed) {
      case 'slow':
        quality = 0.6;
        break;
      case 'medium':
        quality = 0.8;
        break;
      case 'fast':
        quality = 0.9;
        break;
    }

    return { width, quality };
  }

  /**
   * Get optimal video quality for current device
   */
  getOptimalVideoQuality(): '360p' | '480p' | '720p' | '1080p' | '1440p' {
    const { screenSize, connectionSpeed } = this.capabilities;

    // Slow connection: prioritize playback over quality
    if (connectionSpeed === 'slow') {
      return screenSize === 'mobile' ? '360p' : '480p';
    }

    // Medium connection: balance quality and bandwidth
    if (connectionSpeed === 'medium') {
      switch (screenSize) {
        case 'mobile':
          return '480p';
        case 'tablet':
          return '720p';
        default:
          return '720p';
      }
    }

    // Fast connection: maximize quality
    switch (screenSize) {
      case 'mobile':
        return '720p';
      case 'tablet':
        return '1080p';
      case 'desktop':
        return '1080p';
      case 'large':
        return '1440p';
    }
  }

  /**
   * Should enable feature based on device capabilities
   */
  shouldEnableFeature(feature: string): boolean {
    const { screenSize, connectionSpeed, reducedMotion } = this.capabilities;

    switch (feature) {
      case 'animations':
        return !reducedMotion;

      case 'autoplay-video':
        // Only autoplay on fast connections
        return connectionSpeed === 'fast';

      case 'high-quality-images':
        // High quality on tablet+ with medium+ connection
        return screenSize !== 'mobile' && connectionSpeed !== 'slow';

      case 'lazy-loading':
        // Always enable lazy loading on mobile
        return screenSize === 'mobile' || connectionSpeed === 'slow';

      case 'infinite-scroll':
        // Enable on all devices (better UX than pagination)
        return true;

      case 'background-effects':
        // Disable on slow connections
        return connectionSpeed !== 'slow';

      default:
        return true;
    }
  }

  /**
   * Get touch target size (minimum 44x44px for accessibility)
   */
  getTouchTargetSize(): number {
    const { touchEnabled, screenSize } = this.capabilities;

    if (!touchEnabled) return 32; // Smaller for mouse

    // Mobile needs larger touch targets
    return screenSize === 'mobile' ? 48 : 44;
  }

  /**
   * Get font scaling factor
   */
  getFontScale(): number {
    const { screenSize } = this.capabilities;

    switch (screenSize) {
      case 'mobile':
        return 0.9; // Slightly smaller on mobile
      case 'tablet':
        return 1.0;
      case 'desktop':
        return 1.0;
      case 'large':
        return 1.1; // Slightly larger on large screens
    }
  }
}

// Singleton instance
let optimizerInstance: ResponsiveOptimizer | null = null;

export function getResponsiveOptimizer(): ResponsiveOptimizer {
  if (!optimizerInstance && typeof window !== 'undefined') {
    optimizerInstance = new ResponsiveOptimizer();
  }
  return optimizerInstance!;
}

export default ResponsiveOptimizer;
