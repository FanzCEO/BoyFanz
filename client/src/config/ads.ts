/**
 * Ad Network Configuration
 *
 * TrafficStars Spot IDs - Get these from your TrafficStars publisher dashboard
 * https://admin.trafficstars.com/ -> Sites -> Your Site -> Codes
 *
 * Documentation: https://docs.trafficstars.com/#/_banners
 *
 * How to get Spot IDs:
 * 1. Log into TrafficStars publisher dashboard
 * 2. Go to Sites -> Add your site (if not already added)
 * 3. Wait for site approval
 * 4. Go to Spots -> Create new spot for each placement
 * 5. Copy the spot ID from the generated code
 *
 * Spot Types/Sizes:
 * - 300x250: Rectangle ads for sidebars (most common)
 * - 728x90: Leaderboard ads for headers/footers
 * - 160x600: Skyscraper ads for wide sidebars
 * - 320x50: Mobile banner ads
 * - Native: Native ads that blend with content
 */

export const adConfig = {
  // Enable/disable ad networks
  networks: {
    trafficstars: {
      enabled: false, // Set to true when you have spot IDs
      publisherId: "", // Your TrafficStars publisher ID (optional, for tracking)
    },
    inhouse: {
      enabled: true, // In-house affiliate/promotional ads (always on as fallback)
    }
  },

  // TrafficStars Spot IDs - Replace with your actual spot IDs from dashboard
  // Format: alphanumeric string like "abc123xyz789"
  trafficstars: {
    // Sidebar placements (300x250)
    sidebar_rectangle: "", // Spot ID for sidebar rectangle ads
    sidebar_rectangle_2: "", // Second sidebar spot

    // Feed placements (300x250 or native)
    feed_native: "", // Spot ID for in-feed native ads
    feed_rectangle: "", // Spot ID for in-feed rectangle ads

    // Header/Footer (728x90)
    header_leaderboard: "", // Spot ID for header leaderboard
    footer_leaderboard: "", // Spot ID for footer leaderboard
    sticky_footer: "", // Spot ID for sticky footer banner

    // Mobile placements (320x50)
    mobile_banner: "", // Spot ID for mobile banner
    mobile_interstitial: "", // Spot ID for mobile interstitial

    // Skyscraper (160x600)
    skyscraper: "", // Spot ID for skyscraper ads

    // Popunder (use sparingly - can affect UX)
    popunder: "", // Spot ID for popunder ads
  },

  // Ad placement settings
  placements: {
    // Feed settings
    feed: {
      postsPerAd: 4, // Show ad every N posts
      enabled: true,
    },

    // Sidebar settings
    sidebar: {
      maxAds: 3, // Maximum ads in sidebar
      enabled: true,
    },

    // Sticky footer
    stickyFooter: {
      delayMs: 5000, // Show after 5 seconds
      enabled: true,
    },

    // Interstitial ads (between page transitions)
    interstitial: {
      enabled: false, // Disabled by default - can be intrusive
      frequencyCap: 3, // Max per session
    },

    // Mobile banner
    mobileBanner: {
      enabled: true,
    }
  },

  // Pages where ads are disabled (premium experience)
  disabledPages: [
    "/messages", // Keep messaging clean
    "/streams/create", // Don't distract during stream setup
    "/compliance", // Keep compliance forms clean
    "/admin", // Admin pages ad-free
  ],

  // User tiers that don't see ads
  adFreeUserTiers: [
    "creator_pro", // Premium creators
    "vip_subscriber", // VIP subscribers
  ],
};

// Helper to check if ads should show
export function shouldShowAds(pathname: string, userTier?: string): boolean {
  // Check if page is disabled
  if (adConfig.disabledPages.some(page => pathname.startsWith(page))) {
    return false;
  }

  // Check if user tier is ad-free
  if (userTier && adConfig.adFreeUserTiers.includes(userTier)) {
    return false;
  }

  return true;
}

// Get TrafficStars spot ID for a placement
export function getTrafficStarsSpot(placement: keyof typeof adConfig.trafficstars): string | null {
  if (!adConfig.networks.trafficstars.enabled) {
    return null;
  }

  const spotId = adConfig.trafficstars[placement];
  return spotId || null;
}

export default adConfig;
