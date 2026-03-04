/**
 * useAdInsertion Hook
 *
 * Convenience hook for consuming the ad insertion system in feed components.
 * Provides everything needed to insert ads between posts in a content feed.
 *
 * Usage:
 *   // Wrap your feed with AdInsertionProvider first, then:
 *   const { shouldShowAd, getAdForPosition, AdUnit } = useAdInsertion();
 *
 *   // In your render:
 *   {posts.map((post, index) => (
 *     <div key={post.id}>
 *       <PostCard post={post} />
 *       {shouldShowAd(index) && (
 *         <AdUnit
 *           ad={getAdForPosition(index)!}
 *           size="native"
 *           className="mt-4"
 *         />
 *       )}
 *     </div>
 *   ))}
 *
 * If used outside an AdInsertionProvider, all functions are no-ops
 * and AdUnit renders nothing - this ensures graceful degradation.
 */

import { useCallback } from "react";
import { useAdInsertionContext } from "@/components/ads/AdInsertionProvider";
import { AdUnit as AdUnitComponent } from "@/components/ads/AdUnit";
import type { AdUnitData, AdSize } from "@/components/ads/AdUnit";

interface UseAdInsertionReturn {
  /** Check if an ad should be shown after the post at this index */
  shouldShowAd: (index: number) => boolean;

  /** Get the ad unit data for a given position (null if no ad) */
  getAdForPosition: (index: number) => AdUnitData | null;

  /** The AdUnit component - pass an ad from getAdForPosition() */
  AdUnit: typeof AdUnitComponent;

  /** Whether the ad system is loaded and ready */
  isReady: boolean;

  /** Whether ad data is currently loading */
  isLoading: boolean;

  /** Number of available ad units */
  adCount: number;

  /** Dismiss an ad by ID so it won't be shown again this session */
  dismissAd: (adId: string) => void;

  /**
   * Helper: render an ad for a position if one should be shown.
   * Returns the JSX element or null. Simplifies the common pattern.
   */
  renderAdAtPosition: (index: number, size?: AdSize, className?: string) => JSX.Element | null;
}

export function useAdInsertion(): UseAdInsertionReturn {
  const {
    shouldShowAd,
    getAdForPosition,
    isReady,
    isLoading,
    adUnits,
    dismissAd,
  } = useAdInsertionContext();

  /**
   * Helper that combines shouldShowAd + getAdForPosition + rendering.
   * Returns a rendered AdUnit or null.
   */
  const renderAdAtPosition = useCallback(
    (index: number, size: AdSize = "native", className?: string): JSX.Element | null => {
      if (!shouldShowAd(index)) return null;

      const ad = getAdForPosition(index);
      if (!ad) return null;

      return (
        <AdUnitComponent
          key={`ad-${ad.id}-${index}`}
          ad={ad}
          size={size}
          className={className}
          onDismiss={dismissAd}
        />
      );
    },
    [shouldShowAd, getAdForPosition, dismissAd]
  );

  return {
    shouldShowAd,
    getAdForPosition,
    AdUnit: AdUnitComponent,
    isReady,
    isLoading,
    adCount: adUnits.length,
    dismissAd,
    renderAdAtPosition,
  };
}

export default useAdInsertion;
