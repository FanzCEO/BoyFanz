# BoyFanz Connections Matrix

Generated: 2026-01-06
**Single Source of Truth for All System Integrations**

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FANZ ECOSYSTEM                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│  │   FanzSSO    │────▶│   BoyFanz    │────▶│  FanzCloud   │                │
│  │ sso.fanz.    │     │ boyfanz.fanz │     │   (Media)    │                │
│  │   website    │     │   .website   │     │              │                │
│  └──────────────┘     └──────────────┘     └──────────────┘                │
│         │                    │                    │                         │
│         │              ┌─────┴─────┐              │                         │
│         │              │           │              │                         │
│         ▼              ▼           ▼              ▼                         │
│  ┌──────────────┐  ┌────────┐  ┌────────┐  ┌──────────────┐               │
│  │  FanzDash    │  │ CCBill │  │BunnyCDN│  │ FanzMediaHub │               │
│  │fanzdash.com  │  │Payments│  │  CDN   │  │   (Upload)   │               │
│  └──────────────┘  └────────┘  └────────┘  └──────────────┘               │
│         │                                                                   │
│         ▼                                                                   │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐               │
│  │FanzMoneyDash │     │   MCP API    │     │   FanzBots   │               │
│  │  (Payments)  │     │mcp.fanz.web  │     │  (UX Bots)   │               │
│  └──────────────┘     └──────────────┘     └──────────────┘               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Platform Registry

| Platform | Domain | CSS Prefix | Status |
|----------|--------|------------|--------|
| BoyFanz | boyfanz.fanz.website | `--boy-` | ✅ ACTIVE |
| GayFanz | gayfanz.fanz.website | `--gay-` | ✅ ACTIVE |
| MilfFanz | milffanz.fanz.website | `--milf-` | ✅ ACTIVE |
| BearFanz | bearfanz.fanz.website | `--bear-` | ✅ ACTIVE |
| BroFanz | brofanz.fanz.website | `--bro-` | ✅ ACTIVE |
| FemmeFanz | femmefanz.fanz.website | `--femme-` | ✅ ACTIVE |
| CougarFanz | cougarfanz.fanz.website | `--cougar-` | ✅ ACTIVE |
| TabooFanz | taboofanz.fanz.website | `--taboo-` | ✅ ACTIVE |
| GirlFanz | girlfanz.fanz.website | `--girl-` | ✅ ACTIVE |
| TransFanz | transfanz.fanz.website | `--trans-` | ✅ ACTIVE |
| DaddyFanz | daddyfanz.fanz.website | `--daddy-` | ✅ ACTIVE |
| PupFanz | pupfanz.fanz.website | `--pup-` | ✅ ACTIVE |
| SouthernFanz | southernfanz.fanz.website | `--southern-` | ✅ ACTIVE |
| DL Broz | dlbroz.fanz.website | `--dl-` | ✅ ACTIVE |

## Central Services

### 1. FanzSSO (Authentication)
- **URL**: `https://sso.fanz.website`
- **Purpose**: Central OAuth 2.0 / OIDC authentication
- **BoyFanz Connection**:
  - Login redirect: `/auth/sso/login` → SSO
  - Callback: `/auth/sso/callback`
  - Token verification: `POST /auth/verify`
- **Database**: Central user identity
- **Writes**: CREATE/UPDATE users
- **Reads**: Authentication state

### 2. FanzDash (Admin Dashboard)
- **URL**: `https://fanzdash.com`
- **Purpose**: Central command center for all platforms
- **BoyFanz Connection**:
  - Metrics reporting: Platform pushes stats
  - Deployment approval: Workflow integration
  - Health monitoring: API calls to BoyFanz
- **Reads from BoyFanz**: Analytics, health status
- **Writes to BoyFanz**: Configuration, feature flags

### 3. FanzMoneyDash (Payments)
- **Purpose**: Central payment processing
- **BoyFanz Connection**:
  - Payment intents: Via Stripe
  - Payout processing: Creator payouts
  - Wallet transactions: READ only from BoyFanz
- **BoyFanz**: READ wallet balance, CANNOT write directly

### 4. FanzCloud (Media Storage)
- **Purpose**: Central media asset storage
- **BoyFanz Connection**:
  - Upload: `POST /api/upload/get-url`
  - Chunked upload: `POST /api/mediahub/upload/:id/chunk`
  - CDN delivery: Via BunnyCDN
- **BoyFanz**: READ via CDN URLs

### 5. MCP API (Platform Management)
- **URL**: `https://mcp.fanz.website`
- **Purpose**: Platform health, DNS, SSL, audits
- **BoyFanz Connection**:
  - Health check: `GET /api/platforms/boyfanz/health`
  - Identity: `GET /api/platforms/boyfanz/identity`
  - Config validation: `GET /api/platforms/boyfanz/config`
  - DNS check: `GET /api/platforms/boyfanz/dns`
  - SSL check: `GET /api/platforms/boyfanz/ssl`
- **Authentication**: `X-API-Key` header

### 6. FanzBots (UX Optimization)
- **Purpose**: Autonomous UX improvement bots
- **BoyFanz Connection**:
  - UX audits
  - Auto-fixes (frontend only)
  - Tech ticketing integration
- **Governance**: BOT_GOVERNANCE_CONSTITUTION.md

## API Connections Matrix

### BoyFanz → External Services

| Service | Endpoint | Method | Auth | Purpose |
|---------|----------|--------|------|---------|
| FanzSSO | `/auth/login` | POST | None | Login redirect |
| FanzSSO | `/auth/verify` | POST | Bearer | Token validation |
| FanzSSO | `/auth/register` | POST | None | Registration |
| CCBill | `/wap-frontflex/flexforms` | POST | Subaccount | Payment processing |
| BunnyCDN | Various | GET | API Key | Media delivery |
| GetStream | Webhook | POST | Signature | Real-time events |

### External Services → BoyFanz

| Service | BoyFanz Endpoint | Method | Auth | Purpose |
|---------|------------------|--------|------|---------|
| FanzSSO | `/auth/sso/callback` | GET | OAuth | Auth callback |
| CCBill | `/api/webhooks/ccbill` | POST | Digest Auth | Payment events |
| GetStream | `/api/webhooks/getstream` | POST | Signature | Chat/stream events |
| FanzDash | `/api/admin/*` | Various | JWT | Admin operations |
| MCP API | `/health`, `/health/ready` | GET | API Key | Health checks |

### BoyFanz Internal APIs

| Category | Base Path | Auth Required | Description |
|----------|-----------|---------------|-------------|
| Auth | `/api/auth/*` | Varies | Authentication |
| Admin | `/api/admin/*` | Admin JWT | Admin panel |
| Creator | `/api/creator/*` | User JWT | Creator tools |
| Content | `/api/content/*`, `/api/posts/*` | User JWT | Content management |
| Payments | `/api/payments/*` | User JWT | Payment processing |
| Forums | `/api/forums/*` | Mixed | Community forums |
| Events | `/api/events/*` | User JWT | Live events |
| Streaming | `/api/streams/*` | User JWT | Live streaming |
| Data | `/api/data-retention/*` | User JWT | GDPR/CCPA |
| Help | `/api/help/*` | Mixed | Support system |

## FanzToken System Integration

### Core Infrastructure Tiers (Universal)
| Level | Token Range | Core Name |
|-------|-------------|-----------|
| 1 | 1,000-4,999 | `rising_star` |
| 2 | 5,000-14,999 | `elite` |
| 3 | 15,000-49,999 | `elite_pro` |
| 4 | 50,000-99,999 | `elite_ultimate` |
| 5 | 100,000+ | `platinum` |

### BoyFanz Platform Nicknames
| Core Name | BoyFanz Nickname | Tagline |
|-----------|------------------|---------|
| `rising_star` | Curious Cock | Just getting started |
| `elite` | Hungry Hole | Ready for more |
| `elite_pro` | ToyBoy | Play time premium |
| `elite_ultimate` | Cum Guzzler | Swallow it all |
| `platinum` | Premium Stud | The alpha king |

### Token System Tables
- `fanz_token_balances` - Current balance & tier
- `fanz_token_transactions` - Audit log
- `fanz_token_rules` - Earning rules
- `fanz_tier_benefits` - Tier configuration
- `platform_tier_nicknames` - Platform-specific names
- `auxiliary_platforms` - Token-gated platforms
- `creator_platform_access` - Access tracking
- `creator_ad_campaigns` - Revenue boost ads

## Auxiliary Platforms (Token-Gated)

| Platform | Token Cost | Category |
|----------|------------|----------|
| FanzRoulette | 30/month | Social |
| FanzSwipe | 30/month | Dating |
| FanzMeet | 50/month | Dating |
| FanzGaming | 30/month | Entertainment |
| FanzTravel | 40/month | Lifestyle |
| FanzEvents | 40/month | Events |
| FanzSpa | 30/month | Wellness |
| FanzFitness | 30/month | Wellness |
| FanzFood | 30/month | Lifestyle |
| FanzFashion | 30/month | Lifestyle |

## Database Write Boundaries

### BoyFanz Can Write
- ✅ Own platform data (`boyfanz.*` tables)
- ✅ Platform-specific user profiles
- ✅ Content (posts, stories, media refs)
- ✅ Transactions (local records)
- ✅ Audit logs

### BoyFanz CANNOT Write (Read Only)
- ❌ FanzID user identity (via SSO only)
- ❌ FanzProfile central profiles
- ❌ StarzEngine tier calculations
- ❌ FanzMoneyDash wallet balances
- ❌ Other platform databases

## Route Collision Status

| Endpoint | Sources | Resolution |
|----------|---------|------------|
| `/api/auth/user` | ssoRoutes.ts | ✅ FIXED - duplicate removed from authRoutes.ts |
| `/api/auth/session` | ssoRoutes.ts | ✅ FIXED - duplicate removed from authRoutes.ts |

**Status**: Route collisions resolved 2026-01-06

## Health Check Endpoints

| Endpoint | Expected Response | Use |
|----------|-------------------|-----|
| `/health` | `{"status":"ok"}` | Basic health |
| `/health/ready` | `{"ready":true}` | Readiness probe |
| `/health/live` | `{"live":true}` | Liveness probe |
| `/api/platform/current` | Platform metadata | Identity check |

## Environment Dependencies

| Variable | Service | Required |
|----------|---------|----------|
| `SSO_BASE_URL` | FanzSSO | Yes |
| `DATABASE_URL` | PostgreSQL | Yes |
| `CCBILL_ACCOUNT_NO` | CCBill | Yes |
| `CCBILL_SUBACCOUNT` | CCBill | Yes |
| `CCBILL_SALT` | CCBill | Yes |
| `BUNNY_CDN_KEY` | BunnyCDN | Optional |
| `GETSTREAM_KEY` | GetStream | Optional |
| `FANZDASH_API_KEY` | FanzDash | Optional |

## Cross-Platform Event Flow

```
User Action on BoyFanz
        │
        ▼
┌───────────────────┐
│  BoyFanz Backend  │
│   (routes.ts)     │
└───────────────────┘
        │
        ├──────────────────┬──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  PostgreSQL  │   │   FanzSSO    │   │   CCBill     │
│ (local data) │   │ (auth state) │   │ (payments)   │
└──────────────┘   └──────────────┘   └──────────────┘
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  FanzDash    │   │  FanzCloud   │   │  GetStream   │
│  (metrics)   │   │   (media)    │   │ (real-time)  │
└──────────────┘   └──────────────┘   └──────────────┘
```

## Summary

| Metric | Count |
|--------|-------|
| Total Platforms | 14+ |
| Central Services | 6 |
| BoyFanz API Endpoints | 500+ |
| Route Collisions | 2 (fixable) |
| External Integrations | 5 |
| Token Tiers | 5 |
| Auxiliary Platforms | 10 |

