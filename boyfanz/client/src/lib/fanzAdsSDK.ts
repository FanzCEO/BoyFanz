// @ts-nocheck
/**
 * FanzFiliate Ads SDK
 *
 * Cross-platform SDK for displaying FanzFiliate ads across all Fanz ecosystem platforms.
 * This SDK can be embedded in any Fanz platform to request and display ads.
 *
 * Usage:
 * 1. Include this SDK in your platform
 * 2. Call FanzAds.render() with your placement config
 * 3. Track impressions and clicks automatically
 *
 * Example:
 * ```javascript
 * import { FanzAds } from '@/lib/fanzAdsSDK';
 *
 * FanzAds.render({
 *   placement: 'sidebar-1',
 *   format: 'native',
 *   container: 'ad-container-1',
 *   platform: 'boyfanz',
 * });
 * ```
 */

interface AdConfig {
  placement: string;       // Placement ID from FanzFiliate
  format: 'native' | 'banner' | 'rectangle' | 'sidebar' | 'sticky_footer' | 'interstitial';
  container: string;       // DOM element ID to render into
  platform?: string;       // Which Fanz platform is requesting
  viewerData?: {           // Optional viewer data for targeting
    userId?: string;
    interests?: string[];
    geoCountry?: string;
    deviceType?: 'mobile' | 'desktop' | 'tablet';
  };
  onImpression?: (data: AdResponse) => void;
  onClick?: (data: AdResponse) => void;
  onError?: (error: Error) => void;
}

interface AdResponse {
  requestId: string;
  creative: {
    id: string;
    type: string;
    title?: string;
    description?: string;
    ctaText?: string;
    clickUrl: string;
    assetUrl?: string;
    gradient?: string;
  };
  trackingUrls: {
    impression: string;
    click: string;
  };
  isInhouse: boolean;
}

// Default in-house ads when network is unavailable
const FALLBACK_ADS: AdResponse[] = [
  {
    requestId: 'fallback-1',
    creative: {
      id: 'inhouse-creator-pro',
      type: 'native',
      title: 'Upgrade to Creator Pro',
      description: 'Keep 100% of your earnings. We charge fans, not you.',
      ctaText: 'Upgrade Now',
      clickUrl: '/settings?tab=subscription',
      gradient: 'from-amber-600 to-orange-600',
    },
    trackingUrls: {
      impression: '/api/fanzfiliate/track/impression/fallback-1',
      click: '/api/fanzfiliate/track/click/fallback-1',
    },
    isInhouse: true,
  },
  {
    requestId: 'fallback-2',
    creative: {
      id: 'inhouse-referral',
      type: 'native',
      title: 'Refer Creators, Earn Rewards',
      description: 'Get ecosystem access for every creator who joins.',
      ctaText: 'Get Your Link',
      clickUrl: '/settings?tab=referrals',
      gradient: 'from-emerald-600 to-cyan-600',
    },
    trackingUrls: {
      impression: '/api/fanzfiliate/track/impression/fallback-2',
      click: '/api/fanzfiliate/track/click/fallback-2',
    },
    isInhouse: true,
  },
  {
    requestId: 'fallback-3',
    creative: {
      id: 'inhouse-fanzcoins',
      type: 'native',
      title: 'FanzCoins',
      description: 'Instant, private transactions with our native currency.',
      ctaText: 'Learn More',
      clickUrl: '/fanz-money-center',
      gradient: 'from-violet-600 to-purple-600',
    },
    trackingUrls: {
      impression: '/api/fanzfiliate/track/impression/fallback-3',
      click: '/api/fanzfiliate/track/click/fallback-3',
    },
    isInhouse: true,
  },
];

// SDK Configuration
const SDK_CONFIG = {
  apiEndpoint: '/api/fanzfiliate',
  trackingEnabled: true,
  fallbackEnabled: true,
  retryAttempts: 2,
  timeout: 5000,
};

/**
 * FanzFiliate Ads SDK
 */
export class FanzAdsSDK {
  private config = SDK_CONFIG;
  private loadedAds: Map<string, AdResponse> = new Map();
  private impressionsSent: Set<string> = new Set();

  constructor() {
    // Detect platform
    this.detectPlatform();
  }

  private detectPlatform(): string {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    if (hostname.includes('boyfanz')) return 'boyfanz';
    if (hostname.includes('fanzelitetube')) return 'fanz_elite_tube';
    if (hostname.includes('fanzwork')) return 'fanz_work';
    if (hostname.includes('fanzradio')) return 'fanz_radio';
    if (hostname.includes('fanzuncut')) return 'fanz_uncut';
    if (hostname.includes('fanzvault')) return 'fanz_vault';
    if (hostname.includes('fanzstudio')) return 'fanz_studio';
    if (hostname.includes('fanzlive')) return 'fanz_live';
    return 'unknown';
  }

  private getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Fetch an ad from the FanzFiliate network
   */
  async fetchAd(config: AdConfig): Promise<AdResponse> {
    try {
      const response = await fetch(`${this.config.apiEndpoint}/serve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          placementId: config.placement,
          platform: config.platform || this.detectPlatform(),
          format: config.format,
          viewerData: {
            ...config.viewerData,
            deviceType: config.viewerData?.deviceType || this.getDeviceType(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ad request failed: ${response.status}`);
      }

      const ad = await response.json();
      this.loadedAds.set(config.placement, ad);
      return ad;
    } catch (error) {
      console.warn('[FanzAds] Failed to fetch ad, using fallback:', error);

      if (this.config.fallbackEnabled) {
        const fallback = FALLBACK_ADS[Math.floor(Math.random() * FALLBACK_ADS.length)];
        this.loadedAds.set(config.placement, fallback);
        return fallback;
      }

      throw error;
    }
  }

  /**
   * Track an ad impression
   */
  async trackImpression(ad: AdResponse): Promise<void> {
    if (!this.config.trackingEnabled) return;
    if (this.impressionsSent.has(ad.requestId)) return;

    try {
      // Use image beacon for reliable tracking
      const img = new Image();
      img.src = ad.trackingUrls.impression + `?t=${Date.now()}`;
      this.impressionsSent.add(ad.requestId);
    } catch (error) {
      console.warn('[FanzAds] Failed to track impression:', error);
    }
  }

  /**
   * Track an ad click
   */
  async trackClick(ad: AdResponse): Promise<void> {
    if (!this.config.trackingEnabled) return;

    try {
      const redirectUrl = `${ad.trackingUrls.click}?redirect=${encodeURIComponent(ad.creative.clickUrl)}`;

      // For internal links, just navigate
      if (ad.creative.clickUrl.startsWith('/')) {
        await fetch(ad.trackingUrls.click);
        window.location.href = ad.creative.clickUrl;
      } else {
        // For external links, use tracking redirect
        window.open(redirectUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.warn('[FanzAds] Failed to track click:', error);
      // Still navigate on error
      window.location.href = ad.creative.clickUrl;
    }
  }

  /**
   * Render an ad into a container
   */
  async render(config: AdConfig): Promise<void> {
    try {
      const container = document.getElementById(config.container);
      if (!container) {
        throw new Error(`Container not found: ${config.container}`);
      }

      // Fetch the ad
      const ad = await this.fetchAd(config);

      // Render based on format
      const html = this.renderAd(ad, config.format);
      container.innerHTML = html;

      // Add click handler
      const adElement = container.querySelector('.fanzads-creative');
      if (adElement) {
        adElement.addEventListener('click', (e) => {
          e.preventDefault();
          this.trackClick(ad);
          config.onClick?.(ad);
        });
      }

      // Track impression when visible
      this.observeVisibility(container, () => {
        this.trackImpression(ad);
        config.onImpression?.(ad);
      });

    } catch (error) {
      console.error('[FanzAds] Render error:', error);
      config.onError?.(error as Error);
    }
  }

  /**
   * Render ad HTML based on format
   */
  private renderAd(ad: AdResponse, format: string): string {
    const { creative } = ad;

    // Native format
    if (format === 'native') {
      return `
        <a href="${creative.clickUrl}" class="fanzads-creative block relative overflow-hidden rounded-xl transition-all duration-300 group hover:shadow-lg hover:scale-[1.01]" style="text-decoration: none;">
          <div class="relative p-5 bg-gradient-to-br ${creative.gradient || 'from-primary to-primary/80'} backdrop-blur-sm border border-white/10" style="background: linear-gradient(135deg, rgba(217, 119, 6, 0.9), rgba(234, 88, 12, 0.9));">
            <div style="position: absolute; inset: 0; opacity: 0.03; background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 24px 24px;"></div>
            <div style="position: relative; z-index: 10;">
              <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;">
                <div style="flex: 1;">
                  <span style="display: inline-block; padding: 2px 8px; margin-bottom: 8px; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(255,255,255,0.5); background: rgba(0,0,0,0.2); border-radius: 4px;">
                    Sponsored
                  </span>
                  <h4 style="font-family: 'Bebas Neue', sans-serif; font-size: 1.25rem; color: white; margin-bottom: 4px;">
                    ${creative.title || 'Featured'}
                  </h4>
                  <p style="font-size: 0.875rem; color: rgba(255,255,255,0.7); line-height: 1.4;">
                    ${creative.description || ''}
                  </p>
                </div>
                <button style="flex-shrink: 0; padding: 8px 16px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; font-size: 0.875rem; font-weight: 600; cursor: pointer;">
                  ${creative.ctaText || 'Learn More'}
                </button>
              </div>
            </div>
          </div>
        </a>
      `;
    }

    // Banner format
    if (format === 'banner' || format === 'rectangle' || format === 'sidebar') {
      const dimensions = {
        banner: { width: '728px', height: '90px' },
        rectangle: { width: '300px', height: '250px' },
        sidebar: { width: '160px', height: '600px' },
      }[format] || { width: '300px', height: '250px' };

      return `
        <a href="${creative.clickUrl}" class="fanzads-creative block" style="text-decoration: none; display: block; width: ${dimensions.width}; height: ${dimensions.height}; background: linear-gradient(135deg, rgba(217, 119, 6, 0.9), rgba(234, 88, 12, 0.9)); border-radius: 8px; overflow: hidden; position: relative;">
          ${creative.assetUrl ? `
            <img src="${creative.assetUrl}" alt="${creative.title || 'Ad'}" style="width: 100%; height: 100%; object-fit: cover;" />
          ` : `
            <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px; text-align: center;">
              <span style="font-size: 10px; color: rgba(255,255,255,0.5); text-transform: uppercase; margin-bottom: 8px;">Ad</span>
              <h4 style="font-size: 1rem; color: white; margin-bottom: 4px;">${creative.title || ''}</h4>
              <p style="font-size: 0.75rem; color: rgba(255,255,255,0.7);">${creative.description || ''}</p>
              <span style="margin-top: 12px; padding: 6px 12px; background: rgba(255,255,255,0.2); border-radius: 4px; color: white; font-size: 0.75rem;">${creative.ctaText || 'Learn More'}</span>
            </div>
          `}
        </a>
      `;
    }

    // Default fallback
    return `<div class="fanzads-creative" style="text-align: center; padding: 16px; color: #666;">Ad</div>`;
  }

  /**
   * Observe element visibility for impression tracking
   */
  private observeVisibility(element: HTMLElement, callback: () => void): void {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
              callback();
              observer.disconnect();
            }
          });
        },
        { threshold: 0.5 }
      );
      observer.observe(element);
    } else {
      // Fallback: track immediately
      callback();
    }
  }

  /**
   * Preload ads for multiple placements
   */
  async preload(placements: string[]): Promise<void> {
    await Promise.all(
      placements.map((placement) =>
        this.fetchAd({
          placement,
          format: 'native',
          container: '',
        }).catch(() => null)
      )
    );
  }

  /**
   * Get a preloaded ad
   */
  getPreloadedAd(placement: string): AdResponse | undefined {
    return this.loadedAds.get(placement);
  }

  /**
   * Clear all preloaded ads
   */
  clearCache(): void {
    this.loadedAds.clear();
    this.impressionsSent.clear();
  }
}

// Export singleton instance
export const FanzAds = new FanzAdsSDK();

// Also export for direct import
export default FanzAds;

// Add to window for external script usage
if (typeof window !== 'undefined') {
  (window as any).FanzAds = FanzAds;
}
