/**
 * Ad Components Index
 *
 * All ad placement components for the creator ad system.
 * Each component handles its own impression/click tracking.
 *
 * Revenue Split:
 * - Creators get 70% of ad revenue
 * - 30% goes directly to Wittle Bear Foundation
 * - Creators can optionally donate their 70% to charity too
 */

// Core ad placements
export { ProfileBannerAd } from './ProfileBannerAd';
export { FeedInlineAd } from './FeedInlineAd';
export { VideoAdOverlay, VideoBottomAd } from './VideoAdOverlay';
export { SidebarAd } from './SidebarAd';
export { StoryAd } from './StoryAd';

// Multi-size ad spaces
export { AdSpace, AD_DIMENSIONS, type AdSize } from './AdSpace';

// Landing page and premium placements
export {
  HeroAd,
  CreatorShoutout,
  CreatorShoutoutRow,
  BetweenContentAd,
} from './LandingPageAds';

// Feed integration helpers
export {
  FeedWithAds,
  AdSlot,
  ResponsiveAdContainer,
  StickySidebarAds,
} from './FeedWithAds';

// Re-export charity badge for profile display
export { CharityBadge, CharityBadgesRow } from '../CharityBadge';
