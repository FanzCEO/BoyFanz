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
// NOTE: Keep at least 8 unique ads to avoid duplication in 4-block carousels (P1 #8 fix)
const inhouseAds = [
  {
    id: "promo-premium",
    title: "Upgrade to Creator Pro",
    description: "Keep 100% of your earnings • We charge fans, not you • Priority support",
    cta: "Upgrade Now",
    gradient: "from-amber-600/90 via-amber-500/80 to-orange-600/90",
    link: "/settings?tab=subscription"
  },
  {
    id: "promo-starz-tiers",
    title: "Starz Membership",
    description: "Unlock FanzAI, FanzMeet, Starz Studio & More - Exclusive Access Awaits",
    cta: "Get Hard 🍆",
    gradient: "from-pink-600/90 via-rose-600/80 to-red-700/90",
    link: "/starz-elite",
    isStarzPromo: true
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
  },
  {
    id: "promo-custom-content",
    title: "Custom Requests",
    description: "Earn more with personalized content for your biggest fans",
    cta: "Enable Requests",
    gradient: "from-purple-600/90 via-violet-600/80 to-indigo-600/90",
    link: "/creator/custom-requests"
  },
  {
    id: "promo-analytics",
    title: "Track Your Growth",
    description: "Powerful analytics to understand what your fans love",
    cta: "View Stats",
    gradient: "from-cyan-600/90 via-teal-600/80 to-emerald-600/90",
    link: "/creator/analytics"
  },
  {
    id: "promo-messaging",
    title: "Mass Messaging",
    description: "Reach all your subscribers at once with targeted campaigns",
    cta: "Start Campaign",
    gradient: "from-orange-600/90 via-red-600/80 to-rose-600/90",
    link: "/creator/messages/broadcast"
  },
  {
    id: "promo-vault",
    title: "Content Vault",
    description: "Store and organize your content securely in the cloud",
    cta: "Open Vault",
    gradient: "from-slate-600/90 via-zinc-600/80 to-neutral-600/90",
    link: "/creator/vault"
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

// 4-Block Rotating Carousel Ad Banner - TOP (sticky at top of page)
export function StickyTopAd({ className }: { className?: string }) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [currentSet, setCurrentSet] = useState(0);

  // Create sets of 4 ads to rotate through
  const adSets = [];
  for (let i = 0; i < inhouseAds.length; i += 4) {
    adSets.push(inhouseAds.slice(i, i + 4));
  }

  useEffect(() => {
    // Auto-rotate every 8 seconds
    const interval = setInterval(() => {
      setCurrentSet((prev) => (prev + 1) % adSets.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [adSets.length]);

  if (isDismissed) return null;

  const currentAds = adSets[currentSet] || [];

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50",
      className
    )}>
      <div className="relative bg-black/40 backdrop-blur-lg border-b border-white/10">
        {/* Dismiss button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute top-2 right-2 z-50 p-1.5 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>

        {/* 4-block carousel grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
          {currentAds.map((ad, index) => (
            <a
              key={`${ad.id}-${index}`}
              href={ad.link}
              className={cn(
                "group relative flex items-center gap-3 px-4 py-3 transition-all duration-300 hover:brightness-110",
                "border-r border-white/5 last:border-r-0",
                "sm:border-b-0 border-b lg:border-b-0"
              )}
              style={{
                background: `linear-gradient(135deg, ${ad.gradient.replace('from-', '').replace(' via-', ', ').replace(' to-', ', ')})`
              }}
            >
              {/* Sponsored label */}
              <span className="absolute top-1 left-2 text-[8px] text-white/30 uppercase tracking-wider">
                Ad
              </span>

              {/* Ad content */}
              <div className="flex-1 min-w-0 mt-3">
                <h4 className="text-xs font-bold text-white truncate mb-0.5">
                  {ad.title}
                </h4>
                <p className="text-[10px] text-white/60 truncate">
                  {ad.description}
                </p>
              </div>

              {/* CTA */}
              <div className="shrink-0">
                <span className="inline-block px-3 py-1 bg-white/15 hover:bg-white/25 rounded-full text-[10px] text-white font-medium transition-colors group-hover:scale-105">
                  {ad.cta}
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Carousel indicators */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
          {adSets.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSet(index)}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all",
                currentSet === index ? "bg-white/80 w-4" : "bg-white/30"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// 4-Block Rotating Carousel Ad Banner - BOTTOM (sticky footer)
export function StickyFooterAd({ className }: { className?: string }) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [currentSet, setCurrentSet] = useState(0);

  // Create sets of 4 ads to rotate through
  const adSets = [];
  for (let i = 0; i < inhouseAds.length; i += 4) {
    adSets.push(inhouseAds.slice(i, i + 4));
  }

  useEffect(() => {
    // Show after 5 seconds of page load
    const timer = setTimeout(() => setIsVisible(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-rotate every 8 seconds
    const interval = setInterval(() => {
      setCurrentSet((prev) => (prev + 1) % adSets.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [adSets.length]);

  if (isDismissed || !isVisible) return null;

  const currentAds = adSets[currentSet] || [];

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-40 transition-transform duration-500",
      isVisible ? "translate-y-0" : "translate-y-full",
      className
    )}>
      <div> {/* Sidebar margin handled by parent MainContent */}
        <div className="relative bg-black/40 backdrop-blur-lg border-t border-white/10">
          {/* Dismiss button */}
          <button
            onClick={() => setIsDismissed(true)}
            className="absolute top-2 right-2 z-50 p-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>

          {/* 4-block carousel grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
            {currentAds.map((ad, index) => (
              <a
                key={`${ad.id}-${index}`}
                href={ad.link}
                className={cn(
                  "group relative flex items-center gap-3 px-4 py-3 transition-all duration-300 hover:brightness-110",
                  "border-r border-white/5 last:border-r-0",
                  "sm:border-b-0 border-b lg:border-b-0"
                )}
                style={{
                  background: `linear-gradient(135deg, ${ad.gradient.replace('from-', '').replace(' via-', ', ').replace(' to-', ', ')})`
                }}
              >
                {/* Sponsored label */}
                <span className="absolute top-1 left-2 text-[8px] text-white/30 uppercase tracking-wider">
                  Ad
                </span>

                {/* Ad content */}
                <div className="flex-1 min-w-0 mt-3">
                  <h4 className="text-xs font-bold text-white truncate mb-0.5">
                    {ad.title}
                  </h4>
                  <p className="text-[10px] text-white/60 truncate">
                    {ad.description}
                  </p>
                </div>

                {/* CTA */}
                <div className="shrink-0">
                  <span className="inline-block px-3 py-1 bg-white/15 hover:bg-white/25 rounded-full text-[10px] text-white font-medium transition-colors group-hover:scale-105">
                    {ad.cta}
                  </span>
                </div>
              </a>
            ))}
          </div>

          {/* Carousel indicators */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
            {adSets.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSet(index)}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  currentSet === index ? "bg-white/80 w-4" : "bg-white/30"
                )}
              />
            ))}
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

// ========================================
// STARZ TIERS PROMO - Sexy Membership Tiers
// ========================================

const SEXY_STARZ_TIERS = [
  {
    id: 'curious-cock',
    name: 'Curious Cock',
    price: 9.99,
    color: '#CD7F32',
    gradient: 'from-amber-700 to-amber-900',
    glow: 'rgba(205, 127, 50, 0.4)',
    icon: '🍆',
    tagline: 'Just getting started',
    features: ['FanzAI Chat Bot', 'Basic Analytics', 'Priority Support']
  },
  {
    id: 'hungry-hole',
    name: 'Hungry Hole',
    price: 19.99,
    color: '#C0C0C0',
    gradient: 'from-gray-400 to-gray-600',
    glow: 'rgba(192, 192, 192, 0.4)',
    icon: '🕳️',
    tagline: 'Ready for more',
    features: ['All Curious Cock +', 'FanzMeet Access', 'Advanced Analytics', 'Co-Star Network']
  },
  {
    id: 'toyboy',
    name: 'ToyBoy',
    price: 29.99,
    color: '#FF6B9D',
    gradient: 'from-pink-500 to-rose-600',
    glow: 'rgba(255, 107, 157, 0.5)',
    icon: '🧸',
    tagline: 'Play time premium',
    features: ['All Hungry Hole +', 'Breeding Zone Access', 'Custom Watermarks', 'AI Content Tools']
  },
  {
    id: 'cum-guzzler',
    name: 'Cum Guzzler',
    price: 49.99,
    color: '#FFD700',
    gradient: 'from-yellow-500 to-amber-600',
    glow: 'rgba(255, 215, 0, 0.5)',
    icon: '💦',
    tagline: 'Swallow it all',
    features: ['All ToyBoy +', 'Starz Studio Pro', 'Mass Messaging', 'Revenue Boost 2x']
  },
  {
    id: 'premium-pump',
    name: 'Premium Pump',
    price: 99.99,
    color: '#E5E4E2',
    gradient: 'from-gray-200 to-gray-400',
    glow: 'rgba(229, 228, 226, 0.5)',
    icon: '🍑',
    tagline: 'Maximum thrust',
    features: ['All Cum Guzzler +', 'FanzRadio Podcast', 'White Label Options', 'Dedicated Manager']
  },
  {
    id: 'big-dick-rick',
    name: 'Big Dick Rick',
    price: 149.99,
    color: '#DC143C',
    gradient: 'from-red-600 to-rose-700',
    glow: 'rgba(220, 20, 60, 0.6)',
    icon: '🔥',
    tagline: 'The real powerhouse',
    features: ['All Premium Pump +', 'BunnyCDN Storage', 'FanzCloud Vault', 'Revenue Boost 3x', 'Premium Analytics']
  },
  {
    id: 'ultimate-stud',
    name: 'Ultimate Stud',
    price: 249.99,
    color: '#B9F2FF',
    gradient: 'from-cyan-300 via-blue-400 to-purple-500',
    glow: 'rgba(185, 242, 255, 0.6)',
    icon: '👑',
    tagline: 'The alpha king',
    features: ['EVERYTHING Unlocked', 'FanzVault Storage', 'Custom Domain', 'Revenue Boost 5x', 'VIP Events']
  }
];

export function StarzTiersPromo({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl", className)}>
      {/* Sexy gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 0, 50, 0.95) 0%, rgba(20, 5, 15, 0.98) 50%, rgba(80, 0, 40, 0.95) 100%)'
        }}
      />

      {/* Animated glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full animate-pulse"
          style={{ background: 'radial-gradient(circle, rgba(255, 50, 100, 0.3) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full animate-pulse"
          style={{ background: 'radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%)', animationDelay: '1s' }}
        />
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest text-pink-400 bg-pink-500/20 rounded-full mb-3">
            Exclusive Access
          </span>
          <h3
            className="text-3xl md:text-4xl font-black uppercase mb-2"
            style={{
              background: 'linear-gradient(135deg, #ff6b9d 0%, #ffd700 50%, #ff6b9d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(255, 107, 157, 0.5)'
            }}
          >
            Starz Membership
          </h3>
          <p className="text-gray-400 text-sm">
            Unlock FanzAI, FanzMeet, Starz Studio & More Premium Platforms
          </p>
        </div>

        {/* Tier Cards - Horizontal scroll on mobile */}
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {SEXY_STARZ_TIERS.map((tier, index) => (
            <a
              key={tier.id}
              href="/starz-elite"
              className="flex-shrink-0 w-[160px] snap-center group cursor-pointer"
            >
              <div
                className="relative p-4 rounded-xl border transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${tier.gradient.replace('from-', '').replace(' to-', ', ')})`,
                  borderColor: tier.color,
                  boxShadow: `0 4px 20px ${tier.glow}, inset 0 1px 0 rgba(255,255,255,0.1)`
                }}
              >
                {/* Popular badge for Gold tier */}
                {tier.id === 'cum-guzzler' && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold uppercase rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="text-center">
                  <span className="text-3xl mb-2 block">{tier.icon}</span>
                  <h4 className="font-bold text-white text-sm mb-1">{tier.name}</h4>
                  <p className="text-[10px] text-white/60 mb-2">{tier.tagline}</p>
                  <div className="text-lg font-black text-white">
                    ${tier.price}
                    <span className="text-xs font-normal text-white/50">/mo</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center mt-4">
          <a
            href="/starz-elite"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-bold rounded-full transition-all duration-300 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 hover:scale-105"
          >
            <span>Get Hard Now</span>
            <span className="text-xl">🍆💦</span>
          </a>
        </div>
      </div>
    </div>
  );
}

// Compact Starz Promo for Sidebar
export function StarzSidebarPromo({ className }: { className?: string }) {
  return (
    <a
      href="/starz-elite"
      className={cn(
        "block relative overflow-hidden rounded-xl transition-all duration-300 group hover:scale-[1.02] hover:shadow-xl",
        className
      )}
    >
      <div
        className="p-4"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 0, 50, 0.95) 0%, rgba(80, 0, 40, 0.95) 100%)',
          border: '1px solid rgba(255, 107, 157, 0.3)'
        }}
      >
        <span className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-pink-400 bg-pink-500/20 rounded mb-2">
          Premium
        </span>

        <h4 className="font-bold text-white text-lg mb-1 flex items-center gap-2">
          <span>🔥</span> Starz Tiers
        </h4>

        <p className="text-xs text-gray-400 mb-3">
          Unlock FanzAI, FanzMeet, Starz Studio & more exclusive platforms
        </p>

        {/* Mini tier preview */}
        <div className="flex justify-center gap-1 mb-3">
          {SEXY_STARZ_TIERS.slice(0, 5).map((tier) => (
            <div
              key={tier.id}
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
              style={{ background: tier.color }}
              title={tier.name}
            >
              {tier.icon}
            </div>
          ))}
        </div>

        <span className="inline-flex items-center gap-1 text-xs text-pink-400 font-medium group-hover:gap-2 transition-all">
          Get Hard 🍆
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </a>
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
