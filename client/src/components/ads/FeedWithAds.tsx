/**
 * Feed With Ads Component
 *
 * A wrapper component that intelligently injects ads into content feeds.
 * Supports configurable ad frequency and multiple ad formats.
 */

import { Fragment, ReactNode, useMemo } from 'react';
import { FeedInlineAd } from './FeedInlineAd';
import { AdSpace, AdSize } from './AdSpace';
import { CreatorShoutout } from './LandingPageAds';
import { cn } from '@/lib/utils';

interface FeedWithAdsProps {
  children: ReactNode[];
  creatorId?: string;
  // Insert an ad every N items
  adFrequency?: number;
  // Start inserting ads after N items
  startAfter?: number;
  // Maximum number of ads to show
  maxAds?: number;
  // Types of ads to show in the feed
  adTypes?: ('inline' | 'native' | 'shoutout')[];
  // Featured creators for shoutouts (if enabled)
  featuredCreators?: Array<{
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
    subscriberCount?: number;
    isVerified?: boolean;
    previewImages?: string[];
  }>;
  className?: string;
}

export function FeedWithAds({
  children,
  creatorId,
  adFrequency = 5,
  startAfter = 3,
  maxAds = 10,
  adTypes = ['inline'],
  featuredCreators = [],
  className,
}: FeedWithAdsProps) {
  const itemsWithAds = useMemo(() => {
    const result: ReactNode[] = [];
    let adCount = 0;
    let shoutoutIndex = 0;

    children.forEach((child, index) => {
      result.push(
        <Fragment key={`content-${index}`}>
          {child}
        </Fragment>
      );

      // Check if we should insert an ad after this item
      const itemNumber = index + 1;
      if (
        itemNumber >= startAfter &&
        (itemNumber - startAfter) % adFrequency === 0 &&
        adCount < maxAds
      ) {
        // Determine ad type to show
        const adTypeIndex = adCount % adTypes.length;
        const adType = adTypes[adTypeIndex];

        if (adType === 'inline') {
          result.push(
            <div key={`ad-${index}`} className="my-4">
              <FeedInlineAd
                creatorId={creatorId || 'global'}
                position={adCount}
              />
            </div>
          );
        } else if (adType === 'native') {
          result.push(
            <div key={`ad-${index}`} className="my-4">
              <AdSpace
                creatorId={creatorId}
                size="native"
                placementId={`feed-native-${adCount}`}
              />
            </div>
          );
        } else if (adType === 'shoutout' && featuredCreators.length > 0) {
          const creator = featuredCreators[shoutoutIndex % featuredCreators.length];
          result.push(
            <div key={`shoutout-${index}`} className="my-4">
              <CreatorShoutout
                creatorId={creator.id}
                creatorName={creator.name}
                creatorAvatar={creator.avatar}
                creatorBio={creator.bio}
                subscriberCount={creator.subscriberCount}
                isVerified={creator.isVerified}
                previewImages={creator.previewImages}
              />
            </div>
          );
          shoutoutIndex++;
        }

        adCount++;
      }
    });

    return result;
  }, [children, creatorId, adFrequency, startAfter, maxAds, adTypes, featuredCreators]);

  return (
    <div className={cn('space-y-4', className)}>
      {itemsWithAds}
    </div>
  );
}

// ============================================================
// AD SLOT - Placeholder component for specific ad positions
// ============================================================

interface AdSlotProps {
  creatorId?: string;
  size?: AdSize;
  position: 'top' | 'middle' | 'bottom' | 'sidebar';
  className?: string;
}

export function AdSlot({ creatorId, size, position, className }: AdSlotProps) {
  // Determine best size for position if not specified
  const defaultSize = useMemo((): AdSize => {
    if (size) return size;
    switch (position) {
      case 'top':
        return 'leaderboard';
      case 'middle':
        return 'medium-rectangle';
      case 'bottom':
        return 'leaderboard';
      case 'sidebar':
        return 'wide-skyscraper';
      default:
        return 'medium-rectangle';
    }
  }, [size, position]);

  return (
    <div className={cn('flex justify-center', className)}>
      <AdSpace
        creatorId={creatorId}
        size={defaultSize}
        placementId={`slot-${position}`}
      />
    </div>
  );
}

// ============================================================
// RESPONSIVE AD CONTAINER - Shows different sizes based on viewport
// ============================================================

interface ResponsiveAdContainerProps {
  creatorId?: string;
  mobileSize?: AdSize;
  tabletSize?: AdSize;
  desktopSize?: AdSize;
  className?: string;
}

export function ResponsiveAdContainer({
  creatorId,
  mobileSize = 'mobile-banner',
  tabletSize = 'medium-rectangle',
  desktopSize = 'leaderboard',
  className,
}: ResponsiveAdContainerProps) {
  return (
    <div className={cn('flex justify-center', className)}>
      {/* Mobile */}
      <div className="block sm:hidden">
        <AdSpace
          creatorId={creatorId}
          size={mobileSize}
          placementId="responsive-mobile"
        />
      </div>

      {/* Tablet */}
      <div className="hidden sm:block lg:hidden">
        <AdSpace
          creatorId={creatorId}
          size={tabletSize}
          placementId="responsive-tablet"
        />
      </div>

      {/* Desktop */}
      <div className="hidden lg:block">
        <AdSpace
          creatorId={creatorId}
          size={desktopSize}
          placementId="responsive-desktop"
        />
      </div>
    </div>
  );
}

// ============================================================
// STICKY SIDEBAR ADS - Sticky positioned sidebar ads
// ============================================================

interface StickySidebarAdsProps {
  creatorId?: string;
  position?: 'left' | 'right';
  className?: string;
}

export function StickySidebarAds({
  creatorId,
  position = 'right',
  className,
}: StickySidebarAdsProps) {
  return (
    <div
      className={cn(
        'hidden xl:block fixed top-24 w-[160px]',
        position === 'left' ? 'left-4' : 'right-4',
        className
      )}
    >
      <div className="sticky top-24 space-y-4">
        <AdSpace
          creatorId={creatorId}
          size="wide-skyscraper"
          placementId={`sticky-sidebar-${position}`}
        />
      </div>
    </div>
  );
}

export default FeedWithAds;
