# Starz Studio - Platform Rollout Guide

> Comprehensive documentation for deploying Starz Studio across all FANZ platforms

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Integration Points](#integration-points)
5. [Tier Requirements](#tier-requirements)
6. [API Endpoints](#api-endpoints)
7. [Frontend Components](#frontend-components)
8. [Deployment Steps](#deployment-steps)
9. [Platform Checklist](#platform-checklist)

---

## Overview

### What is Starz Studio?

Starz Studio is the AI-powered creator hub for the FANZ ecosystem. Unlike paid memberships, Starz Studio membership is **earned through performance**:

- **Fan Count**: Total and active subscriber count
- **Referrals**: Successfully converted referrals
- **Media Quality**: AI-scored content quality (via FanzMediaHub)
- **Post Volume**: Total and monthly content output

### Tier Levels

| Tier | Display Name | Fan Req | Referral Req | Quality Req | Post Req |
|------|--------------|---------|--------------|-------------|----------|
| none | Non-Member | 0 | 0 | 0 | 0 |
| bronze_star | Bronze Star | 50 | 3 | 40 | 20 |
| silver_star | Silver Star | 250 | 10 | 55 | 75 |
| gold_star | Gold Star | 1,000 | 25 | 70 | 200 |
| platinum_star | Platinum Star | 5,000 | 50 | 80 | 500 |
| diamond_star | Diamond Star | 25,000 | 100 | 90 | 1,000 |

### Benefits Per Tier

- **Bronze Star**: Basic AI tools, FanzCloud Mobile basic access
- **Silver Star**: Enhanced AI features, fan insights, DM templates
- **Gold Star**: Full AI suite, video editor, pricing AI, collaboration finder
- **Platinum Star**: Priority AI processing, custom AI models, API access
- **Diamond Star**: All features, beta access, dedicated support, custom integrations

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        FANZ ECOSYSTEM                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │ BoyFanz     │    │ GirlFanz    │    │ PupFanz     │  ...   │
│  │ boyfanz.    │    │ girlfanz.   │    │ pupfanz.    │        │
│  │ fanz.website│    │ fanz.website│    │ fanz.website│        │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘        │
│         │                  │                  │                │
│         └──────────────────┼──────────────────┘                │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    CENTRAL SERVICES                       │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │                                                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │  │
│  │  │ FanzSSO     │  │ FanzDash    │  │ AI Hub      │      │  │
│  │  │ sso.fanz.   │  │ dash.fanz.  │  │ ai.fanz.    │      │  │
│  │  │ website     │  │ website     │  │ website     │      │  │
│  │  │             │  │             │  │             │      │  │
│  │  │ - Auth      │  │ - Admin     │  │ - AI APIs   │      │  │
│  │  │ - Sessions  │  │ - VIP Mgmt  │  │ - ML Models │      │  │
│  │  │ - Access    │  │ - Email     │  │ - Inference │      │  │
│  │  │   Logging   │  │ - Analytics │  │             │      │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │  │
│  │                                                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │  │
│  │  │ FanzMedia   │  │ FanzHub     │  │ FanzCloud   │      │  │
│  │  │ Hub         │  │ Vault       │  │ Mobile      │      │  │
│  │  │             │  │             │  │             │      │  │
│  │  │ - Quality   │  │ - Tiers     │  │ - iOS App   │      │  │
│  │  │   Scoring   │  │ - Titles    │  │ - Android   │      │  │
│  │  │ - Forensic  │  │ - Achieve-  │  │ - Push      │      │  │
│  │  │   Signatures│  │   ments     │  │             │      │  │
│  │  │ - Watermark │  │ - Upgrades  │  │             │      │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │  │
│  │                                                           │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User creates content** → Platform uploads to FanzMediaHub
2. **FanzMediaHub** → Processes media, generates quality score, forensic signature
3. **Quality score** → Stored and synced to Starz membership metrics
4. **FanzHubVault** → Evaluates tier eligibility, triggers upgrades
5. **FanzSSO** → Logs all Starz tool access for auditing
6. **FanzDash** → Displays VIP status, enables admin communications

---

## Database Schema

### Core Tables

#### starz_memberships
Primary membership tracking for each creator profile.

```sql
- id: UUID
- profile_id: FK to profiles
- current_tier: enum (none, bronze_star, silver_star, gold_star, platinum_star, diamond_star)
- total_fan_count: integer
- active_fan_count: integer
- successful_referrals: integer
- media_quality_score: integer (0-100)
- total_post_count: integer
- monthly_post_count: integer
- fanzcloud_access_enabled: boolean
- fanzcloud_access_level: string (view_only, basic, full)
```

#### starz_tier_requirements
Configurable requirements for each tier.

```sql
- tier: enum
- min_fan_count: integer
- min_active_fan_count: integer
- min_referrals: integer
- min_media_quality_score: integer
- min_total_posts: integer
- min_monthly_posts: integer
- features: jsonb (array of feature slugs)
- ai_tools_unlocked: text[]
- fanzcloud_access_level: string
```

#### starz_access_logs
SSO access logging for all Starz tool usage.

```sql
- profile_id: FK to profiles
- tool_accessed: string
- access_type: enum (view, use, denied)
- tier_at_access: enum
- sso_session_id: string
- device_type: string (web, mobile, fanzcloud_app)
```

### Integration Tables

#### starz_platform_connections
OAuth connections to auxiliary platforms (Twitter, Instagram, etc.)

#### starz_cross_posts
Queue for cross-posting content to connected platforms

#### media_hub_jobs
Processing jobs sent to FanzMediaHub

#### hub_vault_tier_sync
Tier change synchronization with FanzHubVault

#### fanzdash_email_templates / campaigns / sends
Admin communication system

---

## Integration Points

### 1. FanzSSO Integration

All Starz tool access must be authenticated and logged through FanzSSO.

```typescript
// Log tool access
await starzStudioService.logToolAccess({
  profileId: session.profileId,
  toolAccessed: "caption-ai",
  accessType: "use",
  ssoSessionId: session.id,
  ssoClientId: "boyfanz",
  deviceType: "web",
});
```

### 2. FanzMediaHub Integration

Media uploads trigger quality scoring jobs.

```typescript
// On media upload, create quality scoring job
const job = await db.insert(mediaHubJobs).values({
  mediaAssetId: asset.id,
  profileId: asset.ownerId,
  jobType: "quality_score",
  status: "queued",
  mediaHubCallbackUrl: `https://${platform}.fanz.website/api/webhooks/mediahub`,
});
```

### 3. FanzHubVault Integration

Tier changes sync bidirectionally with HubVault.

```typescript
// After tier evaluation
if (tierChanged) {
  await db.insert(hubVaultTierSync).values({
    profileId,
    membershipId: membership.id,
    syncDirection: "to_vault",
    previousTier,
    newTier,
    metricsSnapshot: metrics,
  });
  // HubVault webhook will acknowledge sync
}
```

### 4. FanzDash Integration

Admin dashboard shows Starz members with VIP treatment.

```typescript
// Get Starz members for dashboard
const starzMembers = await db.query.starzMemberships.findMany({
  where: notEq(starzMemberships.currentTier, "none"),
  orderBy: [desc(starzMemberships.currentTier), desc(starzVipSettings.dashboardPriority)],
});
```

### 5. FanzCloud Mobile Integration

Mobile app access is granted based on membership tier.

```typescript
// Check FanzCloud access
if (!membership.fanzcloudAccessEnabled) {
  throw new Error("Earn Starz membership to unlock FanzCloud Mobile");
}
```

---

## API Endpoints

### Membership Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/starz-studio/membership | Get current user's membership dashboard |
| POST | /api/starz-studio/evaluate | Trigger tier evaluation |
| GET | /api/starz-studio/tiers | Get all tier requirements |
| GET | /api/starz-studio/tools | Get available AI tools |
| POST | /api/starz-studio/tools/:slug/access | Request tool access |
| GET | /api/starz-studio/quality-analytics | Get media quality analytics |
| GET | /api/starz-studio/referral-stats | Get referral statistics |

### FanzCloud Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/starz-studio/fanzcloud/register | Register mobile app session |

### Webhook Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/webhooks/mediahub | FanzMediaHub quality score callback |
| POST | /api/webhooks/hubvault | FanzHubVault tier sync callback |

### Admin Endpoints (FanzDash)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/admin/starz/seed-tiers | Seed tier requirements |
| GET | /api/admin/starz/members | List all Starz members |
| POST | /api/admin/starz/thank-you | Send thank you message |
| POST | /api/admin/starz/email-campaign | Create email campaign |

---

## Frontend Components

### Required Pages

1. **StarzStudio/index.tsx** - Main dashboard
   - Tier status and progress
   - Metrics cards (fans, referrals, quality, posts)
   - FanzCloud access status

2. **StarzStudio/Tools.tsx** - AI tools catalog
   - Tool cards with access status
   - Launch buttons (locked/unlocked)

3. **StarzStudio/Platforms.tsx** - Connected platforms
   - OAuth connection buttons
   - Cross-posting settings

4. **StarzStudio/Tiers.tsx** - Tier benefits
   - All tier requirements
   - Feature comparison

### Badge Component

```tsx
const TIER_COLORS = {
  none: 'bg-gray-500',
  bronze_star: 'bg-amber-600',
  silver_star: 'bg-gray-400',
  gold_star: 'bg-yellow-500',
  platinum_star: 'bg-gray-300',
  diamond_star: 'bg-cyan-400',
};

<Badge className={TIER_COLORS[tier]}>
  {tier.replace('_', ' ')}
</Badge>
```

---

## Deployment Steps

### For Each Platform

1. **Database Migration**
   ```bash
   cd /var/www/{platform}
   npm run db:generate
   npm run db:migrate
   ```

2. **Copy Schema Additions**
   ```bash
   # Copy from boyfanz as reference
   cat /var/www/boyfanz/shared/schema.ts | grep -A 1000 "STARZ STUDIO" >> shared/schema.ts
   ```

3. **Copy Services**
   ```bash
   cp /var/www/boyfanz/server/services/starzStudioService.ts server/services/
   cp /var/www/boyfanz/server/services/mediaQualityService.ts server/services/
   ```

4. **Copy Routes**
   ```bash
   cp /var/www/boyfanz/server/routes/starzStudio.ts server/routes/
   ```

5. **Copy Frontend**
   ```bash
   cp -r /var/www/boyfanz/client/src/pages/StarzStudio client/src/pages/
   ```

6. **Register Routes**
   ```typescript
   // In server/index.ts or routes.ts
   import starzStudioRoutes from "./routes/starzStudio";
   app.use("/api/starz-studio", starzStudioRoutes);
   ```

7. **Add Frontend Route**
   ```typescript
   // In client routing
   { path: "/starz-studio", component: StarzStudioPage }
   ```

8. **Seed Tier Requirements**
   ```bash
   curl -X POST https://{platform}.fanz.website/api/starz-studio/seed-tiers
   ```

9. **Restart Service**
   ```bash
   pm2 restart {platform}
   ```

---

## Platform Checklist

### Status: ✅ Deployed | 🟡 Partial | ❌ Not Started | 🔧 Broken

| Platform | Schema | Services | Routes | Frontend | SSO | MediaHub | Vault | Status |
|----------|--------|----------|--------|----------|-----|----------|-------|--------|
| BoyFanz | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ✅ |
| GirlFanz | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 🔧 |
| PupFanz | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| DaddyFanz | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| TabooFanz | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| TransFanz | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| MilfFanz | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 🔧 |
| DaddiesFanz | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 🔧 |
| FansMobile | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Legend
- **Schema**: Database tables created
- **Services**: StarzStudioService, MediaQualityService
- **Routes**: API endpoints registered
- **Frontend**: React components deployed
- **SSO**: Access logging integrated
- **MediaHub**: Quality scoring webhook configured
- **Vault**: Tier sync configured

---

## Environment Variables

```env
# Starz Studio Configuration
STARZ_ENABLED=true
STARZ_TIER_EVALUATION_INTERVAL=86400000  # 24 hours

# AI Hub
AI_HUB_URL=https://ai.fanz.website
AI_HUB_API_KEY=your-api-key

# FanzMediaHub
MEDIA_HUB_URL=https://mediahub.fanz.website
MEDIA_HUB_WEBHOOK_SECRET=your-webhook-secret

# FanzHubVault
HUB_VAULT_URL=https://vault.fanz.website
HUB_VAULT_API_KEY=your-api-key

# FanzCloud
FANZCLOUD_ENABLED=true
```

---

## Troubleshooting

### Common Issues

1. **Tier not updating**
   - Check FanzHubVault sync status
   - Verify metrics are being calculated correctly
   - Run manual evaluation: `POST /api/starz-studio/evaluate`

2. **Media quality score stuck at 0**
   - Check FanzMediaHub job status
   - Verify webhook endpoint is accessible
   - Check media_hub_jobs table for errors

3. **FanzCloud access denied**
   - Verify membership tier is not "none"
   - Check fanzcloud_access_enabled flag
   - Verify SSO session is valid

4. **AI tools not loading**
   - Check starz_ai_tools table is populated
   - Verify AI Hub connectivity
   - Check user's tier against tool's minimumTier

---

## Contact & Support

- **Technical Issues**: engineering@fanz.website
- **Platform Owner**: Joshua B Stone
- **Documentation**: This file - /var/www/boyfanz/STARZ_STUDIO_ROLLOUT.md

---

*Last Updated: Mon Dec 29 23:27:49 EST 2025*
*Version: 1.0.0*
