/**
 * AdUnit Component
 *
 * Renders a single ad unit in the feed, sidebar, or other placement.
 * Supports banner, native, and interstitial ad formats.
 * Tracks impressions via IntersectionObserver and clicks via the ads API.
 *
 * Usage:
 *   <AdUnit ad={adData} size="native" className="mt-4" />
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { X, ExternalLink, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ─── Types ───────────────────────────────────────────────────────────────────

export type AdType = "banner" | "native" | "interstitial";

export type AdSize =
  | "leaderboard"    // 728x90
  | "medium-rectangle" // 300x250
  | "native"         // full-width, auto height (in-feed)
  | "sidebar"        // 300px wide, flexible height
  | "mobile-banner"; // 320x50

export interface AdUnitData {
  id: string;
  type: AdType;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  cta?: string;
  sponsored: boolean;
  gradient?: string;
  priority?: number;
  placement?: string[];
}

interface AdUnitProps {
  ad: AdUnitData;
  size?: AdSize;
  className?: string;
  dismissible?: boolean;
  onDismiss?: (adId: string) => void;
  onImpression?: (adId: string) => void;
  onClick?: (adId: string) => void;
}

// ─── Size Config ─────────────────────────────────────────────────────────────

const sizeStyles: Record<AdSize, string> = {
  "leaderboard": "w-full max-w-[728px] h-[90px]",
  "medium-rectangle": "w-[300px] h-[250px]",
  "native": "w-full",
  "sidebar": "w-full max-w-[300px]",
  "mobile-banner": "w-full max-w-[320px] h-[50px]",
};

// ─── Impression Tracker ──────────────────────────────────────────────────────

function useImpressionTracker(
  adId: string,
  onImpression?: (adId: string) => void
) {
  const ref = useRef<HTMLDivElement>(null);
  const tracked = useRef(false);

  useEffect(() => {
    if (!ref.current || tracked.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !tracked.current) {
            tracked.current = true;

            // Fire impression tracking
            if (onImpression) {
              onImpression(adId);
            }

            // Also fire server-side impression tracking
            fetch("/api/ads/impression", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ adId }),
            }).catch(() => {
              // Silently fail - ad tracking should not break the app
            });

            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 } // 50% visible triggers impression
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [adId, onImpression]);

  return ref;
}

// ─── Click Handler ───────────────────────────────────────────────────────────

function useClickTracker(adId: string, onClick?: (adId: string) => void) {
  return useCallback(() => {
    if (onClick) {
      onClick(adId);
    }

    // Fire server-side click tracking
    fetch("/api/ads/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adId }),
    }).catch(() => {
      // Silently fail
    });
  }, [adId, onClick]);
}

// ─── Native Ad (In-Feed) ────────────────────────────────────────────────────

function NativeAdUnit({
  ad,
  className,
  dismissible,
  onDismiss,
  impressionRef,
  handleClick,
}: {
  ad: AdUnitData;
  className?: string;
  dismissible?: boolean;
  onDismiss?: (adId: string) => void;
  impressionRef: React.RefObject<HTMLDivElement>;
  handleClick: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div ref={impressionRef} data-ad-id={ad.id} data-ad-type="native">
      <Card
        className={cn(
          "overflow-hidden border-red-900/20 bg-black/40 backdrop-blur-xl",
          "hover:border-red-500/30 transition-all duration-300",
          className
        )}
      >
        <CardContent className="p-0">
          {/* Sponsored Label */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <div className="flex items-center gap-2">
              <Megaphone className="h-3 w-3 text-gray-500" />
              <span className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">
                Sponsored
              </span>
            </div>
            {dismissible && (
              <button
                onClick={() => {
                  setDismissed(true);
                  onDismiss?.(ad.id);
                }}
                className="text-gray-600 hover:text-gray-400 transition-colors p-1"
                aria-label="Dismiss ad"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Ad Content */}
          <Link href={ad.targetUrl} onClick={handleClick}>
            <div className="cursor-pointer group">
              {/* Gradient Banner */}
              <div
                className={cn(
                  "relative mx-4 rounded-lg overflow-hidden",
                  "bg-gradient-to-r",
                  ad.gradient || "from-red-600/90 via-red-500/80 to-orange-600/90"
                )}
              >
                {/* Image if available */}
                {ad.imageUrl && (
                  <div className="relative aspect-[16/7] overflow-hidden">
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      loading="lazy"
                      onError={(e) => {
                        // Hide broken image, let gradient show
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    {/* Overlay gradient for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  </div>
                )}

                {/* Text overlay when image present, or standalone text */}
                <div
                  className={cn(
                    "p-5",
                    ad.imageUrl ? "absolute bottom-0 left-0 right-0" : ""
                  )}
                >
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-red-200 transition-colors">
                    {ad.title}
                  </h3>
                  <p className="text-sm text-white/80 line-clamp-2">
                    {ad.description}
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  {ad.description.length > 60
                    ? ad.description.substring(0, 60) + "..."
                    : ""}
                </span>
                {ad.cta && (
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white text-xs px-4"
                  >
                    {ad.cta}
                    <ExternalLink className="h-3 w-3 ml-1.5" />
                  </Button>
                )}
              </div>
            </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Banner Ad ───────────────────────────────────────────────────────────────

function BannerAdUnit({
  ad,
  size,
  className,
  dismissible,
  onDismiss,
  impressionRef,
  handleClick,
}: {
  ad: AdUnitData;
  size: AdSize;
  className?: string;
  dismissible?: boolean;
  onDismiss?: (adId: string) => void;
  impressionRef: React.RefObject<HTMLDivElement>;
  handleClick: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      ref={impressionRef}
      data-ad-id={ad.id}
      data-ad-type="banner"
      className={cn(
        "relative overflow-hidden rounded-lg border border-red-900/20",
        "bg-gradient-to-r",
        ad.gradient || "from-gray-900 via-gray-800 to-gray-900",
        sizeStyles[size],
        className
      )}
    >
      <Link href={ad.targetUrl} onClick={handleClick}>
        <div className="flex items-center h-full px-4 py-2 cursor-pointer group">
          {/* Sponsored tag */}
          <Badge
            variant="outline"
            className="absolute top-1.5 left-1.5 text-[9px] text-gray-500 border-gray-700 bg-black/50 px-1.5 py-0"
          >
            Ad
          </Badge>

          {/* Content */}
          <div className="flex-1 pr-3">
            <h4 className="text-sm font-semibold text-white group-hover:text-red-300 transition-colors truncate">
              {ad.title}
            </h4>
            {size !== "mobile-banner" && (
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                {ad.description}
              </p>
            )}
          </div>

          {/* CTA */}
          {ad.cta && (
            <span className="text-xs text-red-400 font-medium whitespace-nowrap group-hover:text-red-300 transition-colors">
              {ad.cta} &rarr;
            </span>
          )}
        </div>
      </Link>

      {dismissible && (
        <button
          onClick={() => {
            setDismissed(true);
            onDismiss?.(ad.id);
          }}
          className="absolute top-1 right-1 text-gray-600 hover:text-gray-400 transition-colors p-0.5"
          aria-label="Dismiss ad"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

// ─── Main AdUnit Component ───────────────────────────────────────────────────

export function AdUnit({
  ad,
  size = "native",
  className,
  dismissible = true,
  onDismiss,
  onImpression,
  onClick,
}: AdUnitProps) {
  const impressionRef = useImpressionTracker(ad.id, onImpression);
  const handleClick = useClickTracker(ad.id, onClick);

  // Select renderer based on ad type and size
  if (ad.type === "native" || size === "native") {
    return (
      <NativeAdUnit
        ad={ad}
        className={className}
        dismissible={dismissible}
        onDismiss={onDismiss}
        impressionRef={impressionRef}
        handleClick={handleClick}
      />
    );
  }

  return (
    <BannerAdUnit
      ad={ad}
      size={size}
      className={className}
      dismissible={dismissible}
      onDismiss={onDismiss}
      impressionRef={impressionRef}
      handleClick={handleClick}
    />
  );
}

export default AdUnit;
