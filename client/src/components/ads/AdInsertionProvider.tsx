/**
 * AdInsertionProvider
 *
 * Context provider that manages ad insertion logic for content feeds.
 * Wraps the feed and provides helper functions to determine when and
 * which ads should be shown between posts.
 *
 * Usage:
 *   <AdInsertionProvider frequency={5} placement="feed">
 *     <YourFeedComponent />
 *   </AdInsertionProvider>
 *
 * Then inside the feed:
 *   const { shouldShowAd, getAdForPosition } = useAdInsertionContext();
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AdUnitData } from "./AdUnit";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AdConfig {
  frequency: number;
  enabled: boolean;
  placements: string[];
  maxAdsPerPage: number;
  refreshIntervalMs: number;
}

interface AdInsertionContextValue {
  /** Check if an ad should be shown after the post at this index */
  shouldShowAd: (index: number) => boolean;
  /** Get the ad unit to display at a given position */
  getAdForPosition: (index: number) => AdUnitData | null;
  /** Whether the ad system is enabled and has loaded */
  isReady: boolean;
  /** Whether ad data is currently loading */
  isLoading: boolean;
  /** Current ad configuration */
  config: AdConfig | null;
  /** All available ad units for this placement */
  adUnits: AdUnitData[];
  /** Set of dismissed ad IDs */
  dismissedAds: Set<string>;
  /** Dismiss an ad by ID */
  dismissAd: (adId: string) => void;
}

const defaultConfig: AdConfig = {
  frequency: 5,
  enabled: true,
  placements: ["feed"],
  maxAdsPerPage: 10,
  refreshIntervalMs: 300000,
};

const AdInsertionContext = createContext<AdInsertionContextValue | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

interface AdInsertionProviderProps {
  children: ReactNode;
  /** Show an ad every N posts (default: uses server config, fallback 5) */
  frequency?: number;
  /** Placement filter - only show ads tagged for this placement */
  placement?: string;
  /** Override: disable ads entirely */
  disabled?: boolean;
}

export function AdInsertionProvider({
  children,
  frequency: frequencyOverride,
  placement = "feed",
  disabled = false,
}: AdInsertionProviderProps) {
  const [dismissedAds, setDismissedAds] = useState<Set<string>>(new Set());

  // Fetch ad config from server
  const { data: configData, isLoading: configLoading } = useQuery<{ success: boolean; config: AdConfig }>({
    queryKey: ["/api/ads/config"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !disabled,
  });

  // Fetch ad units for this placement
  const { data: unitsData, isLoading: unitsLoading } = useQuery<{ success: boolean; units: AdUnitData[]; total: number }>({
    queryKey: ["/api/ads/units", placement],
    queryFn: async () => {
      const res = await fetch(`/api/ads/units?placement=${encodeURIComponent(placement)}`);
      if (!res.ok) throw new Error("Failed to fetch ad units");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    enabled: !disabled,
  });

  const config = configData?.config || null;
  const adUnits = unitsData?.units || [];
  const isLoading = configLoading || unitsLoading;
  const isEnabled = !disabled && (config?.enabled ?? true);
  const frequency = frequencyOverride ?? config?.frequency ?? defaultConfig.frequency;
  const maxAdsPerPage = config?.maxAdsPerPage ?? defaultConfig.maxAdsPerPage;

  // Filter out dismissed ads
  const availableAds = adUnits.filter((ad) => !dismissedAds.has(ad.id));

  /**
   * Determine if an ad should be shown after the post at `index`.
   * Returns true every `frequency` posts (0-indexed).
   * E.g., with frequency=5: after posts at index 4, 9, 14, 19...
   */
  const shouldShowAd = useCallback(
    (index: number): boolean => {
      if (!isEnabled || availableAds.length === 0) return false;

      // 0-indexed: show ad after every Nth post
      const positionInFeed = index + 1;
      if (positionInFeed % frequency !== 0) return false;

      // Check max ads per page
      const adSlotNumber = Math.floor(positionInFeed / frequency);
      if (adSlotNumber > maxAdsPerPage) return false;

      return true;
    },
    [isEnabled, availableAds.length, frequency, maxAdsPerPage]
  );

  /**
   * Get the ad unit for a given post index position.
   * Rotates through available ads based on position to avoid repetition.
   */
  const getAdForPosition = useCallback(
    (index: number): AdUnitData | null => {
      if (!isEnabled || availableAds.length === 0) return null;

      // Calculate which ad to show (rotate through available ads)
      const positionInFeed = index + 1;
      const adSlotNumber = Math.floor(positionInFeed / frequency);
      const adIndex = (adSlotNumber - 1) % availableAds.length;

      return availableAds[adIndex] || null;
    },
    [isEnabled, availableAds, frequency]
  );

  const dismissAd = useCallback((adId: string) => {
    setDismissedAds((prev) => {
      const next = new Set(prev);
      next.add(adId);
      return next;
    });
  }, []);

  const contextValue: AdInsertionContextValue = {
    shouldShowAd,
    getAdForPosition,
    isReady: !isLoading && isEnabled,
    isLoading,
    config,
    adUnits: availableAds,
    dismissedAds,
    dismissAd,
  };

  return (
    <AdInsertionContext.Provider value={contextValue}>
      {children}
    </AdInsertionContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Access the ad insertion context.
 * Must be used inside an <AdInsertionProvider>.
 */
export function useAdInsertionContext(): AdInsertionContextValue {
  const context = useContext(AdInsertionContext);
  if (!context) {
    // Return a no-op context if used outside provider (graceful degradation)
    return {
      shouldShowAd: () => false,
      getAdForPosition: () => null,
      isReady: false,
      isLoading: false,
      config: null,
      adUnits: [],
      dismissedAds: new Set(),
      dismissAd: () => {},
    };
  }
  return context;
}

export default AdInsertionProvider;
