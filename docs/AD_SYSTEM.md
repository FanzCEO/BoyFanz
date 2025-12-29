# BoyFanz Creator Ad System

## Overview

The BoyFanz Creator Ad System is a comprehensive advertising platform that allows creators to monetize their profiles through optional ad placements. The system is designed with charity at its core - 30% of all ad revenue goes directly to the **Wittle Bear Foundation**, which supports homeless youth and animal shelters.

## Key Features

- **100% Content Revenue**: Creators keep 100% of subscriptions, tips, and PPV sales
- **70/30 Ad Revenue Split**: Creators get 70% of ad revenue, 30% goes to charity
- **Optional Charity Donation**: Creators can donate part or all of their 70% share
- **Charity Badges**: Supporters earn tiered badges displayed on their profiles
- **Multiple Ad Formats**: Banner, feed inline, video, sidebar, and story ads
- **Privacy-First**: IP addresses are hashed, no personal data tracking

---

## Architecture

### Database Schema

Located in `shared/schema.ts`:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   advertisers   │     │      ads        │     │ creatorAdSettings│
│                 │────▶│                 │◀────│                 │
│ - id            │     │ - id            │     │ - userId        │
│ - name          │     │ - advertiserId  │     │ - enableBanner  │
│ - contactEmail  │     │ - headline      │     │ - enableFeed    │
│ - budgetLimit   │     │ - imageUrl      │     │ - donationPct   │
│ - status        │     │ - clickUrl      │     │ - charityId     │
└─────────────────┘     │ - cpmRate       │     └─────────────────┘
                        │ - cpcRate       │
                        │ - targeting     │
                        └─────────────────┘
                               │
                               ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  adImpressions  │     │    adClicks     │     │creatorAdRevenue │
│                 │     │                 │     │                 │
│ - id            │     │ - id            │     │ - creatorId     │
│ - adId          │     │ - adId          │     │ - date          │
│ - creatorId     │     │ - impressionId  │     │ - impressions   │
│ - viewerId      │     │ - creatorId     │     │ - clicks        │
│ - ipHash        │     │ - viewerId      │     │ - grossRevenue  │
│ - viewDuration  │     │ - ipHash        │     │ - creatorShare  │
└─────────────────┘     └─────────────────┘     │ - charityShare  │
                                                │ - donationAmt   │
                                                └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    charities    │     │charityDonations │     │  charityBadges  │
│                 │────▶│                 │────▶│                 │
│ - id            │     │ - id            │     │ - userId        │
│ - name          │     │ - userId        │     │ - charityId     │
│ - description   │     │ - charityId     │     │ - tier          │
│ - causes        │     │ - amount        │     │ - totalDonated  │
│ - logoUrl       │     │ - source        │     │ - badgeName     │
└─────────────────┘     └─────────────────┘     │ - badgeIcon     │
                                                └─────────────────┘
```

### Service Layer

Located in `server/services/creatorAdService.ts`:

- **`getCreatorAdSettings(userId)`**: Get creator's ad configuration
- **`updateCreatorAdSettings(userId, settings)`**: Update opt-in preferences
- **`selectAd(params)`**: Algorithm to select best ad for placement
- **`recordImpression(data)`**: Track ad views with privacy hashing
- **`recordClick(data)`**: Track ad clicks for revenue
- **`checkAndUpdateBadge(userId)`**: Auto-upgrade charity badges
- **`getCharityLeaderboard(charityId, limit)`**: Top donors ranking

### API Routes

Located in `server/routes/creatorAdRoutes.ts`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/creator-ads/settings` | Get creator's ad settings |
| PUT | `/api/creator-ads/settings` | Update ad settings |
| GET | `/api/creator-ads/stats` | Get revenue statistics |
| GET | `/api/creator-ads/serve/:creatorId/:type` | Get ad for placement |
| POST | `/api/creator-ads/impression` | Record ad impression |
| POST | `/api/creator-ads/click` | Record ad click |
| GET | `/api/creator-ads/badges` | Get user's charity badges |
| GET | `/api/creator-ads/badges/:userId` | Get user's public badges |
| GET | `/api/creator-ads/charity/wittle-bear` | Get foundation leaderboard |
| GET | `/api/creator-ads/badge-tiers` | Get badge tier info |
| GET | `/api/creator-ads/revenue-split` | Get revenue split info |

---

## Ad Placement Types

### 1. Profile Banner (`profile_banner`)
Full-width banner at the top of creator profiles.

```tsx
import { ProfileBannerAd } from '@/components/ads';

<ProfileBannerAd creatorId={creatorId} />
```

### 2. Feed Inline (`feed_inline`)
Native-style ads that blend into content feeds.

```tsx
import { FeedInlineAd } from '@/components/ads';

<FeedInlineAd creatorId={creatorId} position={0} />
```

### 3. Video Preroll (`video_preroll`)
Skippable video ads before content videos.

```tsx
import { VideoAdOverlay } from '@/components/ads';

<VideoAdOverlay
  creatorId={creatorId}
  placementType="video_preroll"
  skipAfterSeconds={5}
  onAdComplete={() => playMainVideo()}
/>
```

### 4. Video Overlay (`video_overlay`)
Non-intrusive ads at bottom of video player.

```tsx
import { VideoBottomAd } from '@/components/ads';

<VideoBottomAd creatorId={creatorId} />
```

### 5. Sidebar (`sidebar`)
Vertical ads in desktop sidebar.

```tsx
import { SidebarAd } from '@/components/ads';

<SidebarAd creatorId={creatorId} variant="expanded" />
```

### 6. Story Interstitial (`story_interstitial`)
Full-screen ads between stories.

```tsx
import { StoryAd } from '@/components/ads';

<StoryAd
  creatorId={creatorId}
  duration={10}
  onComplete={() => showNextStory()}
  onSkip={() => showNextStory()}
/>
```

---

## Standard Ad Sizes

Use the `AdSpace` component for standard IAB ad sizes:

| Size Name | Dimensions | Use Case |
|-----------|------------|----------|
| `leaderboard` | 728x90 | Page headers |
| `medium-rectangle` | 300x250 | Feed/sidebar |
| `large-rectangle` | 336x280 | Featured content |
| `skyscraper` | 120x600 | Narrow sidebar |
| `wide-skyscraper` | 160x600 | Wide sidebar |
| `half-page` | 300x600 | Premium sidebar |
| `billboard` | 970x250 | Large header |
| `mobile-banner` | 320x50 | Mobile header |
| `mobile-large` | 320x100 | Mobile footer |
| `square` | 250x250 | Flexible placement |
| `full-width` | 100%x200 | Responsive banner |
| `native` | Auto | Content-matched |

```tsx
import { AdSpace } from '@/components/ads';

<AdSpace
  creatorId={creatorId}
  size="medium-rectangle"
  showLabel={true}
  showCharity={true}
  allowDismiss={true}
/>
```

---

## Feed Integration

Automatically inject ads into content feeds:

```tsx
import { FeedWithAds } from '@/components/ads';

<FeedWithAds
  creatorId={creatorId}
  adFrequency={5}      // Show ad every 5 items
  startAfter={3}       // Start after 3rd item
  maxAds={10}          // Maximum 10 ads total
  adTypes={['inline', 'native', 'shoutout']}
  featuredCreators={featuredCreators}
>
  {posts.map(post => <PostCard key={post.id} post={post} />)}
</FeedWithAds>
```

### Responsive Ads

```tsx
import { ResponsiveAdContainer } from '@/components/ads';

<ResponsiveAdContainer
  creatorId={creatorId}
  mobileSize="mobile-banner"
  tabletSize="medium-rectangle"
  desktopSize="leaderboard"
/>
```

### Sticky Sidebar

```tsx
import { StickySidebarAds } from '@/components/ads';

<StickySidebarAds creatorId={creatorId} position="right" />
```

---

## Landing Page Ads

### Hero Ad

Premium full-width placement for homepage:

```tsx
import { HeroAd } from '@/components/ads';

<HeroAd className="mb-8" />
```

### Creator Shoutouts

Promoted creator cards:

```tsx
import { CreatorShoutout, CreatorShoutoutRow } from '@/components/ads';

// Single shoutout
<CreatorShoutout
  creatorId={creator.id}
  creatorName={creator.name}
  creatorAvatar={creator.avatar}
  creatorBio={creator.bio}
  subscriberCount={creator.subscriberCount}
  isVerified={creator.isVerified}
  previewImages={creator.previewImages}
/>

// Horizontal scrolling row
<CreatorShoutoutRow
  creators={featuredCreators}
  title="Featured Creators"
/>
```

### Between Content Ads

```tsx
import { BetweenContentAd } from '@/components/ads';

<BetweenContentAd creatorId={creatorId} />
```

---

## Charity Badge System

### Badge Tiers

| Tier | Min Donation | Max Donation | Icon | Color |
|------|--------------|--------------|------|-------|
| Supporter | $1 | $49 | 🐻 | Purple |
| Bronze | $50 | $199 | 🥉 | Bronze |
| Silver | $200 | $499 | 🥈 | Silver |
| Gold | $500 | $999 | 🥇 | Gold |
| Diamond | $1,000 | $4,999 | 💎 | Cyan |
| Champion | $5,000+ | ∞ | 👑 | Rainbow |

### Displaying Badges

```tsx
import { CharityBadge, CharityBadgesRow } from '@/components/ads';

// Single badge
<CharityBadge
  tier="gold"
  badgeName="Animal Hero"
  badgeIcon="🐾"
  totalDonated="750.00"
  causes={['homeless_youth', 'animal_shelters']}
  size="md"
  showTooltip={true}
/>

// Multiple badges in a row
<CharityBadgesRow
  badges={userBadges}
  size="sm"
  maxDisplay={3}
/>
```

---

## Creator Settings UI

The `AdSettings` page (`client/src/pages/Creator/AdSettings.tsx`) provides:

1. **Revenue Overview**
   - Total earnings display
   - 70/30 split visualization
   - Monthly/lifetime stats

2. **Ad Placement Toggles**
   - Profile banner ads
   - Feed inline ads
   - Video preroll/overlay
   - Sidebar ads
   - Story interstitials

3. **Content Controls**
   - Allowed categories
   - Blocked advertisers

4. **Charity Donation**
   - Donation percentage slider (0-100%)
   - Real-time preview of split
   - Wittle Bear Foundation info

5. **Leaderboard**
   - Top donors list
   - Current badge tier
   - Progress to next tier

---

## Revenue Calculation

### Impression Revenue (CPM)
```
impression_revenue = cpm_rate / 1000
```

### Click Revenue (CPC)
```
click_revenue = cpc_rate
```

### Daily Revenue Aggregation
```
gross_revenue = sum(impression_revenue) + sum(click_revenue)
platform_share = gross_revenue × 0.30  → Always to charity
creator_share = gross_revenue × 0.70
creator_donation = creator_share × (donation_percentage / 100)
charity_total = platform_share + creator_donation
creator_net = creator_share - creator_donation
```

---

## Privacy & Compliance

### IP Address Handling
All IP addresses are hashed with SHA-256 before storage:
```typescript
hashIP(ip: string): string {
  return createHash('sha256').update(ip + SALT).digest('hex').substring(0, 16);
}
```

### Data Retention
- Impression data: 90 days
- Click data: 90 days
- Revenue aggregates: Indefinite
- Badge data: Indefinite

### Fraud Prevention
- Rate limiting on impressions per IP
- Minimum view duration (1 second)
- Click deduplication
- Bot detection via user agent

---

## Integration Checklist

### Server Setup

1. **Register Routes**
```typescript
// In server/index.ts or server/routes.ts
import creatorAdRoutes from './routes/creatorAdRoutes';
app.use('/api/creator-ads', creatorAdRoutes);
```

2. **Run Database Migrations**
```bash
npm run db:push
```

3. **Initialize Wittle Bear Foundation**
```bash
curl -X POST https://boy.fanz.website/api/creator-ads/charity/init-wittle-bear \
  -H "Authorization: Bearer <admin_token>"
```

### Client Setup

1. **Import Ad Components**
```tsx
import {
  ProfileBannerAd,
  FeedInlineAd,
  VideoAdOverlay,
  SidebarAd,
  AdSpace,
  FeedWithAds,
  CharityBadge,
} from '@/components/ads';
```

2. **Add to Profile Page**
```tsx
<ProfileBannerAd creatorId={creatorId} />
<CharityBadgesRow badges={creatorBadges} />
```

3. **Add to Feed**
```tsx
<FeedWithAds creatorId={creatorId} adFrequency={5}>
  {posts.map(post => <PostCard key={post.id} post={post} />)}
</FeedWithAds>
```

4. **Add to Video Player**
```tsx
{showPreroll ? (
  <VideoAdOverlay
    creatorId={creatorId}
    placementType="video_preroll"
    onAdComplete={() => setShowPreroll(false)}
  />
) : (
  <VideoPlayer src={videoUrl}>
    <VideoBottomAd creatorId={creatorId} />
  </VideoPlayer>
)}
```

---

## Wittle Bear Foundation

The Wittle Bear Foundation is the designated charity partner, supporting:

- **Homeless Youth**: Housing, education, and support services
- **Animal Shelters**: Rescue operations, veterinary care, adoption programs

### Foundation Info
- Name: Wittle Bear Foundation
- Causes: `homeless_youth`, `animal_shelters`
- Logo: Bear mascot
- Website: https://wittlebear.org (planned)

### How It Works
1. Platform automatically contributes 30% of all ad revenue
2. Creators can optionally donate part or all of their 70%
3. Donations are tracked and badges are awarded
4. Monthly payouts to foundation
5. Transparent reporting on platform

---

## Troubleshooting

### Ads Not Showing
1. Check if creator has opted into ads in settings
2. Verify ad inventory exists in database
3. Check browser ad blockers
4. Verify API routes are registered

### Impressions Not Recording
1. Check IntersectionObserver support
2. Verify minimum view duration (1 second)
3. Check network requests in dev tools
4. Look for CORS issues

### Badge Not Updating
1. Badges update on donation threshold crossing
2. Run `checkAndUpdateBadge(userId)` manually
3. Check `charity_donations` table for records

---

## Future Enhancements

1. **Programmatic Ads**: RTB integration with ad exchanges
2. **A/B Testing**: Automated ad creative optimization
3. **Brand Safety**: Enhanced content categorization
4. **More Charities**: Support for additional charity partners
5. **Creator Referrals**: Bonus for referring advertisers
6. **Analytics Dashboard**: Detailed reporting for creators

---

## Support

For technical issues with the ad system:
- Check server logs for API errors
- Review browser console for client-side issues
- Contact platform support for revenue questions

---

*Last Updated: December 2024*
*Version: 1.0.0*
