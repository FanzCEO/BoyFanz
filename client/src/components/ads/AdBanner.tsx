import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

// Ad Network Types
type AdNetwork = "trafficstars" | "inhouse" | "affiliate";
type AdSize = "leaderboard" | "banner" | "rectangle" | "skyscraper" | "mobile" | "inline" | "sidebar" | "native" | "sticky-footer";
type AdPosition = "feed" | "sidebar" | "header" | "footer" | "inline" | "interstitial" | "native" | "sticky";

interface AdConfig {
  network: AdNetwork;
  slotId?: string;
  spotId?: string; // TrafficStars spot ID (from publisher dashboard)
  fallback?: boolean;
}

interface AdBannerProps {
  size?: AdSize;
  position?: AdPosition;
  className?: string;
  dismissible?: boolean;
  config?: AdConfig;
  premium?: boolean; // Premium styling for upscale look
}

// Standard IAB ad sizes
const adSizeConfig: Record<AdSize, { width: string; height: string; label: string }> = {
  leaderboard: { width: "728px", height: "90px", label: "728x90" },
  banner: { width: "468px", height: "60px", label: "468x60" },
  rectangle: { width: "300px", height: "250px", label: "300x250" },
  skyscraper: { width: "160px", height: "600px", label: "160x600" },
  mobile: { width: "320px", height: "50px", label: "320x50" },
  inline: { width: "100%", height: "90px", label: "Responsive" },
  sidebar: { width: "100%", height: "250px", label: "Sidebar" },
  native: { width: "100%", height: "auto", label: "Native" },
  "sticky-footer": { width: "100%", height: "50px", label: "Sticky" }
};

// In-house affiliate/promotional ads
const inhouseAds = [
  {
    id: "promo-premium",
    title: "Join Starz Program",
    description: "Earn tier badges • Unlock AI tools • Get exclusive perks",
    cta: "View Tiers",
    gradient: "from-amber-600/90 via-amber-500/80 to-orange-600/90",
    link: "/starz-studio"
  },
  {
    id: "promo-fanzcoins",
    title: "FanzCoins",
    description: "Our native cryptocurrency for instant, private transactions",
    cta: "Learn More",
    gradient: "from-violet-600/90 via-purple-600/80 to-indigo-700/90",
    link: "/fanz-money-center"
  },
  {
    id: "promo-referral",
    title: "Refer Creators, Earn $50",
    description: "Share your link and earn for every creator who joins",
    cta: "Get Your Link",
    gradient: "from-emerald-600/90 via-teal-600/80 to-cyan-700/90",
    link: "/settings?tab=referrals"
  },
  {
    id: "promo-verify",
    title: "Get Verified",
    description: "Boost visibility with the verified creator badge",
    cta: "Apply Now",
    gradient: "from-blue-600/90 via-blue-500/80 to-sky-600/90",
    link: "/compliance"
  },
  {
    id: "promo-live",
    title: "Go Live Tonight",
    description: "Earn tips in real-time with live streaming",
    cta: "Start Stream",
    gradient: "from-rose-600/90 via-pink-600/80 to-red-600/90",
    link: "/streams/create"
  }
];

// TrafficStars integration component
// Documentation: https://docs.trafficstars.com/#/_banners
// Uses spot ID from your TrafficStars publisher dashboard
function TrafficStarsAd({
  spotId,
  size,
  className,
  subId,
  subId1,
  subId2
}: {
  spotId: string;
  size: AdSize;
  className?: string;
  subId?: string;
  subId1?: string;
  subId2?: string;
}) {
  const adRef = useRef<HTMLDivElement>(null);
  const config = adSizeConfig[size];
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!adRef.current || !spotId) return;

    // Clear previous content
    adRef.current.innerHTML = '';

    // Create container for the ad
    const adContainer = document.createElement('div');
    adContainer.id = `ts-ad-${spotId}-${Date.now()}`;
    adRef.current.appendChild(adContainer);

    // TrafficStars banner integration script
    // The spot code is generated in your TrafficStars dashboard under "Codes"
    const script = document.createElement('script');
    script.async = true;
    script.type = 'text/javascript';

    // TrafficStars uses this format for banner ads
    script.innerHTML = `
      (function() {
        var tsConfig = {
          spot: '${spotId}',
          element_id: '${adContainer.id}'
          ${subId ? `, subid: '${subId}'` : ''}
          ${subId1 ? `, subid_1: '${subId1}'` : ''}
          ${subId2 ? `, subid_2: '${subId2}'` : ''}
        };

        // Load TrafficStars SDK
        var s = document.createElement('script');
        s.src = 'https://cdn.tsyndicate.com/sdk/v1/master.spot.js';
        s.async = true;
        s.onload = function() {
          if (typeof TSSpot !== 'undefined') {
            TSSpot(tsConfig);
          }
        };
        document.head.appendChild(s);
      })();
    `;

    adRef.current.appendChild(script);
    setIsLoaded(true);

    return () => {
      if (adRef.current) {
        adRef.current.innerHTML = '';
      }
    };
  }, [spotId, subId, subId1, subId2]);

  return (
    <div
      ref={adRef}
      className={cn(
        "relative overflow-hidden bg-black/20 backdrop-blur-sm rounded-lg border border-white/5",
        className
      )}
      style={{
        minWidth: size === "inline" || size === "sidebar" || size === "native" ? "100%" : config.width,
        minHeight: config.height
      }}
      data-trafficstars-spot={spotId}
    >
      {/* Fallback while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-white/20 text-xs">
          Loading...
        </div>
      )}
    </div>
  );
}

// Premium Native Ad Component - blends with content
function NativeAd({
  ad,
  className,
  premium = true
}: {
  ad: typeof inhouseAds[0];
  className?: string;
  premium?: boolean;
}) {
  return (
    <a
      href={ad.link}
      className={cn(
        "block relative overflow-hidden rounded-xl transition-all duration-300 group",
        premium && "hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.01]",
        className
      )}
    >
      <div className={cn(
        "relative p-5 bg-gradient-to-br backdrop-blur-sm border border-white/10",
        ad.gradient
      )}>
        {/* Subtle pattern for premium look */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }} />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <span className="inline-block px-2 py-0.5 mb-2 text-[10px] font-medium uppercase tracking-wider text-white/50 bg-black/20 rounded">
                Sponsored
              </span>
              <h4 className="font-bebas text-xl text-white mb-1 group-hover:text-white/90 transition-colors">
                {ad.title}
              </h4>
              <p className="text-sm text-white/70 leading-snug">
                {ad.description}
              </p>
            </div>
            <button className="shrink-0 px-4 py-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-lg text-white text-sm font-semibold transition-all border border-white/10">
              {ad.cta}
            </button>
          </div>
        </div>
      </div>
    </a>
  );
}

// Compact Sidebar Ad
function CompactSidebarAd({
  ad,
  className
}: {
  ad: typeof inhouseAds[0];
  className?: string;
}) {
  return (
    <a
      href={ad.link}
      className={cn(
        "block relative overflow-hidden rounded-xl transition-all duration-300 group hover:shadow-lg",
        className
      )}
    >
      <div className={cn(
        "p-4 bg-gradient-to-br border border-white/10",
        ad.gradient
      )}>
        <span className="inline-block px-1.5 py-0.5 mb-2 text-[9px] font-medium uppercase tracking-wider text-white/40 bg-black/20 rounded">
          Ad
        </span>
        <h4 className="font-bebas text-lg text-white mb-1">{ad.title}</h4>
        <p className="text-xs text-white/60 mb-3 line-clamp-2">{ad.description}</p>
        <span className="inline-flex items-center gap-1 text-xs text-white font-medium group-hover:gap-2 transition-all">
          {ad.cta}
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </a>
  );
}

// Main AdBanner Component
export function AdBanner({
  size = "rectangle",
  position = "inline",
  className,
  dismissible = false,
  config = { network: "inhouse" },
  premium = true
}: AdBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [currentAd, setCurrentAd] = useState(inhouseAds[0]);

  useEffect(() => {
    // Rotate in-house ads
    if (config.network === "inhouse" || config.network === "affiliate") {
      const randomAd = inhouseAds[Math.floor(Math.random() * inhouseAds.length)];
      setCurrentAd(randomAd);
    }
  }, [config.network]);

  if (isDismissed) return null;

  // TrafficStars network ad
  if (config.network === "trafficstars" && config.spotId) {
    return (
      <div className={cn("relative", className)}>
        <TrafficStarsAd spotId={config.spotId} size={size} />
        {dismissible && (
          <button
            onClick={() => setIsDismissed(true)}
            className="absolute top-2 right-2 p-1 rounded-full bg-black/40 hover:bg-black/60 transition-colors z-10"
          >
            <X className="w-3 h-3 text-white/60" />
          </button>
        )}
      </div>
    );
  }

  // Native/inline format
  if (size === "native" || size === "inline") {
    return (
      <div className={cn("relative", className)}>
        <NativeAd ad={currentAd} premium={premium} />
        {dismissible && (
          <button
            onClick={() => setIsDismissed(true)}
            className="absolute top-3 right-3 p-1 rounded-full bg-black/40 hover:bg-black/60 transition-colors z-10"
          >
            <X className="w-3 h-3 text-white/60" />
          </button>
        )}
      </div>
    );
  }

  // Sidebar format
  if (size === "sidebar") {
    return (
      <div className={cn("relative", className)}>
        <CompactSidebarAd ad={currentAd} />
        {dismissible && (
          <button
            onClick={() => setIsDismissed(true)}
            className="absolute top-2 right-2 p-1 rounded-full bg-black/40 hover:bg-black/60 transition-colors z-10"
          >
            <X className="w-3 h-3 text-white/60" />
          </button>
        )}
      </div>
    );
  }

  // Default rectangle/banner format
  return (
    <NativeAd ad={currentAd} className={className} premium={premium} />
  );
}

// Feed Ad - appears between posts
export function FeedAd({ className }: { className?: string }) {
  return (
    <div className={cn("my-6", className)}>
      <AdBanner size="native" position="feed" dismissible premium />
    </div>
  );
}

// Sidebar Ad Stack - multiple ads for sidebar
export function SidebarAdStack({
  count = 2,
  className
}: {
  count?: number;
  className?: string;
}) {
  const shuffledAds = [...inhouseAds].sort(() => Math.random() - 0.5).slice(0, count);

  return (
    <div className={cn("space-y-4", className)}>
      {shuffledAds.map((ad) => (
        <CompactSidebarAd key={ad.id} ad={ad} />
      ))}
    </div>
  );
}

// Single Sidebar Ad
export function SidebarAd({ className }: { className?: string }) {
  return (
    <div className={cn("", className)}>
      <AdBanner size="sidebar" position="sidebar" />
    </div>
  );
}

// Mobile Banner - subtle, non-intrusive
export function MobileBanner({ className }: { className?: string }) {
  const [isDismissed, setIsDismissed] = useState(false);
  const ad = inhouseAds[Math.floor(Math.random() * inhouseAds.length)];

  if (isDismissed) return null;

  return (
    <div className={cn("md:hidden", className)}>
      <a
        href={ad.link}
        className={cn(
          "flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r border-y border-white/5",
          ad.gradient
        )}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{ad.title}</p>
          <p className="text-xs text-white/60 truncate">{ad.description}</p>
        </div>
        <span className="shrink-0 px-3 py-1 bg-white/15 rounded-full text-xs text-white font-medium">
          {ad.cta}
        </span>
        <button
          onClick={(e) => { e.preventDefault(); setIsDismissed(true); }}
          className="shrink-0 p-1"
        >
          <X className="w-4 h-4 text-white/40" />
        </button>
      </a>
    </div>
  );
}

// Sticky Footer Ad - premium, non-intrusive
export function StickyFooterAd({ className }: { className?: string }) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const ad = inhouseAds[0]; // Use premium upgrade ad

  useEffect(() => {
    // Show after 5 seconds of page load
    const timer = setTimeout(() => setIsVisible(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (isDismissed || !isVisible) return null;

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-40 transition-transform duration-500",
      isVisible ? "translate-y-0" : "translate-y-full",
      className
    )}>
      <div className="md:ml-64"> {/* Account for sidebar */}
        <div className={cn(
          "flex items-center justify-between gap-4 px-4 py-3 bg-gradient-to-r backdrop-blur-lg border-t border-white/10",
          ad.gradient
        )}>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-white/40 uppercase tracking-wider hidden sm:inline">Sponsored</span>
            <span className="text-sm font-semibold text-white">{ad.title}</span>
            <span className="text-sm text-white/70 hidden sm:inline">— {ad.description}</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={ad.link}
              className="px-4 py-1.5 bg-white/15 hover:bg-white/25 rounded-full text-sm text-white font-medium transition-colors"
            >
              {ad.cta}
            </a>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Content Interstitial - shown between major sections
export function ContentInterstitial({ className }: { className?: string }) {
  const ad = inhouseAds[Math.floor(Math.random() * inhouseAds.length)];

  return (
    <div className={cn("py-8 px-4", className)}>
      <div className="max-w-3xl mx-auto">
        <NativeAd ad={ad} premium />
      </div>
    </div>
  );
}

// TrafficStars Spot Component - for direct spot embedding
// Get spot IDs from TrafficStars dashboard: https://admin.trafficstars.com/ -> Sites -> Codes
export function TrafficStarsZone({
  spotId,
  size = "rectangle",
  className
}: {
  spotId: string;
  size?: AdSize;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <span className="absolute top-1 left-2 text-[9px] text-white/30 uppercase tracking-wider z-10">Ad</span>
      <TrafficStarsAd spotId={spotId} size={size} />
    </div>
  );
}

export default AdBanner;
