/**
 * BoyFanz Wiki Content Database
 * Comprehensive documentation for the FANZ ecosystem
 * AI-guided tutorials and in-depth technical documentation
 */

export interface WikiArticle {
  id: string;
  title: string;
  slug: string;
  category: WikiCategory;
  subcategory?: string;
  summary: string;
  content: string;
  aiPrompts?: string[];
  relatedArticles?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: string;
  lastUpdated: string;
  tags: string[];
}

export type WikiCategory =
  | 'getting-started'
  | 'creators'
  | 'fans'
  | 'payments'
  | 'security'
  | 'compliance'
  | 'api'
  | 'admin'
  | 'technical'
  | 'troubleshooting';

export const wikiCategories: Record<WikiCategory, { name: string; icon: string; description: string; color: string }> = {
  'getting-started': {
    name: 'Getting Started',
    icon: 'Rocket',
    description: 'New to BoyFanz? Start here for the essentials.',
    color: 'cyan'
  },
  'creators': {
    name: 'Creator Guides',
    icon: 'Star',
    description: 'Everything creators need to know to succeed.',
    color: 'purple'
  },
  'fans': {
    name: 'Fan Guides',
    icon: 'Heart',
    description: 'How to get the most out of your BoyFanz experience.',
    color: 'pink'
  },
  'payments': {
    name: 'Payments & Earnings',
    icon: 'DollarSign',
    description: 'Payouts, deposits, subscriptions, and tips.',
    color: 'green'
  },
  'security': {
    name: 'Security & Privacy',
    icon: 'Shield',
    description: 'Protect your account and understand our security.',
    color: 'blue'
  },
  'compliance': {
    name: 'Compliance & Legal',
    icon: 'FileCheck',
    description: '2257 records, KYC, age verification, and legal requirements.',
    color: 'orange'
  },
  'api': {
    name: 'API Reference',
    icon: 'Code',
    description: 'Developer documentation and API endpoints.',
    color: 'cyan'
  },
  'admin': {
    name: 'Admin Dashboard',
    icon: 'Settings',
    description: 'Platform administration and moderation guides.',
    color: 'red'
  },
  'technical': {
    name: 'Technical Docs',
    icon: 'Cpu',
    description: 'Architecture, database schemas, and system design.',
    color: 'gray'
  },
  'troubleshooting': {
    name: 'Troubleshooting',
    icon: 'AlertCircle',
    description: 'Common issues and how to fix them.',
    color: 'yellow'
  }
};

export const wikiArticles: WikiArticle[] = [
  // ============================================
  // GETTING STARTED
  // ============================================
  {
    id: 'gs-001',
    title: 'Welcome to BoyFanz',
    slug: 'welcome',
    category: 'getting-started',
    summary: 'An introduction to the BoyFanz platform and the FANZ ecosystem.',
    difficulty: 'beginner',
    estimatedTime: '5 min',
    lastUpdated: '2026-01-13',
    tags: ['introduction', 'overview', 'ecosystem'],
    aiPrompts: [
      'What is BoyFanz and how does it differ from other platforms?',
      'How do I get started as a new user?',
      'What features are available on BoyFanz?'
    ],
    content: `
# Welcome to BoyFanz

BoyFanz is a premier creator platform within the **FANZ ecosystem**, designed specifically for male content creators and their fans. As part of the FANZ multi-tenant creator economy, BoyFanz offers a seamless, secure, and profitable experience.

## The FANZ Ecosystem

BoyFanz is one of 13 specialized platforms:

| Platform | Focus | Domain |
|----------|-------|--------|
| **BoyFanz** | Male creators | boyfanz.fanz.website |
| GirlFanz | Female creators | girlfanz.fanz.website |
| TransFanz | Trans creators | transfanz.com |
| BearFanz | Bear community | bearfanz.com |
| PupFanz | Pet/Furry community | pupfanz.com |
| And more... | | |

## Key Features

### For Creators
- **Multiple Revenue Streams**: Subscriptions, tips, PPV content, custom requests
- **Secure Payments**: 12+ adult-friendly payment processors
- **Content Protection**: DRM, watermarking, DMCA protection
- **Analytics Dashboard**: Track earnings, subscribers, engagement

### For Fans
- **Subscription Tiers**: Choose your level of access
- **Direct Messaging**: Connect with your favorite creators
- **Exclusive Content**: Access content you won't find anywhere else
- **Secure Payments**: Multiple payment options with privacy protection

## Getting Started

1. **Create Your Account** - Sign up with email or use FanzSSO
2. **Verify Your Identity** - Complete age verification (required)
3. **Set Up Your Profile** - Add photos, bio, and preferences
4. **Explore or Create** - Start browsing or set up your creator page

## Platform Benefits

- **Creator-First Philosophy**: 80% revenue share for creators
- **Bank-Grade Security**: End-to-end encryption, zero-trust architecture
- **24/7 Support**: Dedicated support team and comprehensive wiki
- **Global Reach**: Accept payments from 190+ countries
    `
  },
  {
    id: 'gs-002',
    title: 'Creating Your Account',
    slug: 'creating-account',
    category: 'getting-started',
    summary: 'Step-by-step guide to creating and verifying your BoyFanz account.',
    difficulty: 'beginner',
    estimatedTime: '10 min',
    lastUpdated: '2026-01-13',
    tags: ['account', 'signup', 'verification'],
    aiPrompts: [
      'Walk me through the signup process',
      'What information do I need to create an account?',
      'How does age verification work?'
    ],
    content: `
# Creating Your BoyFanz Account

## Registration Methods

### Option 1: Email Registration
1. Click **Sign Up** on the homepage
2. Enter your email address
3. Create a strong password (min 12 characters, mixed case, numbers, symbols)
4. Verify your email via the confirmation link

### Option 2: FanzSSO (Recommended)
1. Click **Sign in with FanzSSO**
2. Use your existing FANZ ecosystem credentials
3. Grant BoyFanz access to your profile
4. You're instantly logged in

## Age Verification (Required)

BoyFanz requires all users to be 18+ years old. We use **VerifyMyAge** for secure verification.

### Verification Process
1. Navigate to **Settings > Verification**
2. Click **Start Age Verification**
3. Choose your verification method:
   - **Photo ID**: Upload government-issued ID
   - **Video Selfie**: AI-powered age estimation
   - **Bank Verification**: Verify through your bank
4. Wait for approval (usually < 5 minutes)

### What We Accept
- Driver's License
- Passport
- National ID Card
- State/Provincial ID

### Privacy Protection
- Documents are encrypted in transit and at rest
- We don't store your full ID - only verification status
- Data is handled per GDPR/CCPA requirements

## Setting Up Your Profile

### Required Information
- Display Name
- Profile Photo
- Bio (max 500 characters)
- Age confirmation

### Optional Enhancements
- Cover Photo
- Social Links
- Custom URL (username)
- Location (city/country only)

## Account Security

### Two-Factor Authentication (2FA)
We strongly recommend enabling 2FA:
1. Go to **Settings > Security**
2. Click **Enable 2FA**
3. Scan QR code with authenticator app
4. Enter verification code
5. Save backup codes securely

### Login Alerts
Enable notifications for:
- New device logins
- Password changes
- Security events
    `
  },
  {
    id: 'gs-003',
    title: 'Platform Navigation',
    slug: 'navigation',
    category: 'getting-started',
    summary: 'Learn how to navigate the BoyFanz interface efficiently.',
    difficulty: 'beginner',
    estimatedTime: '5 min',
    lastUpdated: '2026-01-13',
    tags: ['navigation', 'ui', 'interface'],
    aiPrompts: [
      'How do I find specific features?',
      'Explain the main menu options',
      'Where are my settings?'
    ],
    content: `
# Platform Navigation

## Main Navigation Bar

The top navigation bar provides access to all major sections:

| Icon | Section | Description |
|------|---------|-------------|
| 🏠 | Home | Your personalized feed |
| 🔍 | Explore | Discover new creators |
| ✉️ | Messages | Direct messages |
| 🔔 | Notifications | Activity alerts |
| 👤 | Profile | Your profile & settings |

## Sidebar Menu

### For All Users
- **Home Feed**: Personalized content from subscriptions
- **Explore**: Trending creators and content
- **Bookmarks**: Saved content
- **Lists**: Custom creator lists
- **Settings**: Account preferences

### For Creators (Additional)
- **Dashboard**: Analytics and earnings
- **Content Studio**: Upload and manage content
- **Subscribers**: Manage your subscriber base
- **Payouts**: Earnings and withdrawals
- **Promotions**: Marketing tools

### For Admins (Additional)
- **Admin Panel**: Full platform administration
- **Moderation Queue**: Content review
- **User Management**: Account administration
- **Analytics**: Platform-wide metrics

## Quick Actions

Press \`/\` anywhere to open command palette:
- \`/new\` - Create new post
- \`/dm @username\` - Message user
- \`/settings\` - Open settings
- \`/help\` - Open wiki

## Mobile Navigation

On mobile devices:
- Swipe right: Open sidebar
- Swipe left: Close sidebar
- Bottom nav: Quick access to main sections
- Pull to refresh: Update feed
    `
  },

  // ============================================
  // CREATOR GUIDES
  // ============================================
  {
    id: 'cr-001',
    title: 'Becoming a Creator',
    slug: 'becoming-creator',
    category: 'creators',
    summary: 'Complete guide to setting up your creator account and profile.',
    difficulty: 'beginner',
    estimatedTime: '15 min',
    lastUpdated: '2026-01-13',
    tags: ['creator', 'setup', 'profile'],
    aiPrompts: [
      'How do I become a creator on BoyFanz?',
      'What are the requirements to be a creator?',
      'How do I set up my subscription tiers?'
    ],
    content: `
# Becoming a Creator on BoyFanz

## Creator Requirements

### Eligibility
- Must be 18+ years old
- Valid government ID for verification
- Complete 2257 compliance documentation
- Bank account for payouts

### Verification Process
1. **Age Verification**: Via VerifyMyAge
2. **Identity Verification**: KYC process
3. **2257 Compliance**: Legal documentation
4. **Banking Setup**: Connect payout method

## Setting Up Your Creator Profile

### Profile Essentials
\`\`\`
✓ High-quality profile photo (1:1 ratio, min 500x500px)
✓ Cover photo (16:9 ratio, min 1920x1080px)
✓ Compelling bio (500 chars max)
✓ Custom username (@handle)
✓ Category selection
\`\`\`

### Subscription Tiers

Create up to 5 subscription tiers:

| Tier | Suggested Price | Typical Benefits |
|------|-----------------|------------------|
| Free | $0 | Public posts, limited DMs |
| Basic | $4.99-9.99 | All posts, unlimited DMs |
| Premium | $14.99-24.99 | + Exclusive content |
| VIP | $29.99-49.99 | + Custom requests |
| Ultimate | $99.99+ | + 1-on-1 video calls |

### Content Categories
- Photos
- Videos
- Live Streams
- Stories (24hr)
- Polls
- Custom Requests

## Revenue Streams

### Primary Income
- **Subscriptions**: Recurring monthly revenue
- **Tips**: One-time gifts from fans
- **PPV Content**: Pay-per-view locked content
- **Messages**: Paid DMs and media

### Additional Revenue
- **Custom Requests**: Personalized content
- **Referral Program**: Earn from referrals
- **Merchandise**: Sell physical products
- **Live Streams**: Virtual gifts during streams

## Revenue Share

BoyFanz offers an **80/20 split**:
- **You keep 80%** of all earnings
- Platform takes 20% for:
  - Payment processing
  - Hosting & CDN
  - Support & security
  - Platform development
    `
  },
  {
    id: 'cr-002',
    title: 'Content Strategy',
    slug: 'content-strategy',
    category: 'creators',
    summary: 'Develop a winning content strategy to maximize your earnings.',
    difficulty: 'intermediate',
    estimatedTime: '20 min',
    lastUpdated: '2026-01-13',
    tags: ['content', 'strategy', 'growth'],
    aiPrompts: [
      'What content performs best on BoyFanz?',
      'How often should I post?',
      'How do I grow my subscriber base?'
    ],
    content: `
# Content Strategy for Creators

## Posting Schedule

### Recommended Frequency
| Content Type | Minimum | Optimal |
|--------------|---------|---------|
| Feed Posts | 3/week | Daily |
| Stories | Daily | 3-5/day |
| PPV Drops | 1/week | 2-3/week |
| Live Streams | 1/month | Weekly |
| DM Responses | Same day | < 2 hours |

### Best Times to Post
- **Peak Hours**: 7-9 PM (subscriber's timezone)
- **Weekend Boost**: Sat/Sun 10 AM - 2 PM
- **Avoid**: Monday mornings, holidays

## Content Mix

### The 70-20-10 Rule
- **70% Free/Teaser**: Hook new subscribers
- **20% Subscriber-Only**: Core value proposition
- **10% Premium PPV**: Exclusive high-value content

### Content Pillars
1. **Behind the Scenes**: Personal, authentic moments
2. **Premium Content**: Your best work
3. **Interactive**: Polls, Q&As, requests
4. **Seasonal/Themed**: Holidays, events

## Growing Your Subscriber Base

### On-Platform Growth
- Use trending hashtags
- Collaborate with other creators
- Engage with comments
- Cross-promote in DMs

### Off-Platform Marketing
- Twitter/X presence
- Reddit communities
- Instagram teasers
- TikTok (SFW content)

## Analytics & Optimization

### Key Metrics to Track
- **Subscriber Retention Rate**: % who renew
- **Engagement Rate**: Likes + comments / views
- **Tip Conversion**: % of viewers who tip
- **PPV Purchase Rate**: Buys / views

### A/B Testing
- Test different price points
- Try various content formats
- Experiment with post times
- Analyze what works
    `
  },

  // ============================================
  // PAYMENTS
  // ============================================
  {
    id: 'py-001',
    title: 'Payment Methods',
    slug: 'payment-methods',
    category: 'payments',
    summary: 'All supported payment methods for deposits and subscriptions.',
    difficulty: 'beginner',
    estimatedTime: '5 min',
    lastUpdated: '2026-01-13',
    tags: ['payments', 'deposits', 'cards'],
    aiPrompts: [
      'What payment methods do you accept?',
      'Can I use cryptocurrency?',
      'Why was my payment declined?'
    ],
    content: `
# Payment Methods

## Accepted Payment Methods

### Credit/Debit Cards
- Visa
- Mastercard
- American Express
- Discover
- JCB

### Digital Wallets
- Apple Pay
- Google Pay
- PayPal (where available)

### Cryptocurrency
- Bitcoin (BTC)
- Ethereum (ETH)
- USDC
- USDT

### Alternative Methods
- ACH Bank Transfer (US)
- SEPA Transfer (EU)
- Prepaid Cards
- Gift Cards (select retailers)

## Payment Processors

We use multiple adult-friendly payment processors:

| Processor | Cards | Crypto | Region |
|-----------|-------|--------|--------|
| CCBill | ✓ | ✗ | Global |
| Epoch | ✓ | ✗ | Global |
| Segpay | ✓ | ✗ | US/EU |
| Crypto.com | ✗ | ✓ | Global |

## Billing Descriptors

Your bank statement will show:
- \`FANZ*BOYFANZ\`
- \`FANZ ENTERTAINMENT\`
- \`CCB*FANZ\`

## Declined Payments

### Common Reasons
1. Insufficient funds
2. Card blocked for adult purchases
3. Bank fraud protection
4. Incorrect billing info
5. Expired card

### Solutions
1. Try a different card
2. Use cryptocurrency
3. Contact your bank
4. Update billing info
5. Try a prepaid card
    `
  },
  {
    id: 'py-002',
    title: 'Creator Payouts',
    slug: 'payouts',
    category: 'payments',
    summary: 'How to receive your earnings as a creator.',
    difficulty: 'intermediate',
    estimatedTime: '10 min',
    lastUpdated: '2026-01-13',
    tags: ['payouts', 'earnings', 'withdrawal'],
    aiPrompts: [
      'How do I withdraw my earnings?',
      'When do I get paid?',
      'What are the payout fees?'
    ],
    content: `
# Creator Payouts

## Payout Methods

### Direct Deposit (ACH)
- **Processing Time**: 2-3 business days
- **Minimum**: $20
- **Fee**: Free
- **Available**: US, Canada

### Wire Transfer
- **Processing Time**: 3-5 business days
- **Minimum**: $500
- **Fee**: $25
- **Available**: Global

### Paxum
- **Processing Time**: 1-2 business days
- **Minimum**: $20
- **Fee**: 1%
- **Available**: Global

### Cryptocurrency
- **Processing Time**: < 1 hour
- **Minimum**: $50 equivalent
- **Fee**: Network fees only
- **Coins**: BTC, ETH, USDC

## Payout Schedule

### Standard Schedule
- **Payout Day**: Every Monday
- **Earnings Period**: Previous week (Mon-Sun)
- **Hold Period**: 7 days (fraud protection)

### Instant Payouts
- Available for verified creators (90+ days)
- 1% fee
- Processed within 2 hours

## Earnings Breakdown

\`\`\`
Gross Earnings:        $1,000.00
Platform Fee (20%):    -$200.00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Net Earnings:          $800.00
Payout Fee:            -$0.00 (ACH)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Payout:          $800.00
\`\`\`

## Tax Information

### US Creators
- W-9 required for earnings > $600/year
- 1099-K issued annually
- You're responsible for taxes

### International Creators
- W-8BEN required
- 30% withholding (unless tax treaty)
- Local tax obligations apply
    `
  },

  // ============================================
  // SECURITY
  // ============================================
  {
    id: 'sc-001',
    title: 'Account Security',
    slug: 'account-security',
    category: 'security',
    summary: 'Protect your account with best security practices.',
    difficulty: 'intermediate',
    estimatedTime: '10 min',
    lastUpdated: '2026-01-13',
    tags: ['security', '2fa', 'password'],
    aiPrompts: [
      'How do I secure my account?',
      'What is two-factor authentication?',
      'My account was hacked, what do I do?'
    ],
    content: `
# Account Security

## Password Security

### Password Requirements
- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Password Best Practices
- Use a unique password for BoyFanz
- Use a password manager
- Never share your password
- Change password every 90 days

## Two-Factor Authentication (2FA)

### Supported Methods
1. **Authenticator App** (Recommended)
   - Google Authenticator
   - Authy
   - 1Password
2. **SMS** (Less secure)
3. **Hardware Key** (Most secure)
   - YubiKey
   - Titan Key

### Setting Up 2FA
1. Go to Settings > Security
2. Click "Enable 2FA"
3. Scan QR code with app
4. Enter 6-digit code
5. **SAVE YOUR BACKUP CODES**

## Session Management

### Active Sessions
View and manage active sessions:
- Device type
- Location (approximate)
- Last active
- Revoke access

### Automatic Logout
- Inactive sessions: 30 days
- Sensitive actions require re-auth
- New device alerts

## Security Alerts

Get notified for:
- New device logins
- Password changes
- Email changes
- 2FA changes
- Payout requests

## Compromised Account

If you suspect unauthorized access:
1. Change password immediately
2. Revoke all active sessions
3. Enable/reset 2FA
4. Check email for changes
5. Contact support
6. Review recent activity
    `
  },

  // ============================================
  // COMPLIANCE
  // ============================================
  {
    id: 'cp-001',
    title: '2257 Compliance',
    slug: '2257-compliance',
    category: 'compliance',
    summary: 'Understanding 18 U.S.C. §2257 record-keeping requirements.',
    difficulty: 'advanced',
    estimatedTime: '20 min',
    lastUpdated: '2026-01-13',
    tags: ['2257', 'legal', 'compliance'],
    aiPrompts: [
      'What is 2257 compliance?',
      'What records do I need to keep?',
      'How does BoyFanz handle 2257?'
    ],
    content: `
# 18 U.S.C. §2257 Compliance

## What is 2257?

18 U.S.C. §2257 is a United States federal law requiring producers of "actual sexually explicit conduct" to:
1. Verify performer age (18+)
2. Maintain records of age verification
3. Provide custodian of records information

## Who Must Comply

### Primary Producers
- Content creators (you)
- Anyone who films/photographs explicit content

### Secondary Producers
- Platforms (BoyFanz)
- Distributors
- Publishers

## Required Records

### For Each Performer
\`\`\`
Required Documentation:
├── Legal name
├── Date of birth
├── Government-issued photo ID
│   ├── ID type
│   ├── ID number
│   ├── Issuing authority
│   └── Expiration date
├── Content index
│   └── List of all content featuring performer
└── Model release forms
\`\`\`

### Record Retention
- **Duration**: 7 years from last publication
- **Availability**: Must be accessible for inspection
- **Format**: Physical or digital (encrypted)

## BoyFanz Compliance System

### Automated Compliance
- Age verification at signup (VerifyMyAge)
- Identity verification (KYC)
- Document secure storage
- Content indexing
- Audit trail

### Your Responsibilities
1. Provide accurate ID information
2. Update records if ID changes
3. Maintain your own backup copies
4. Report any discrepancies

## Accessing Your Records

Navigate to: Settings > Compliance > 2257 Records

Available documents:
- Verification certificates
- Model release forms
- Content index
- Audit history

## Custodian of Records

**FANZ Group Holdings LLC**
30 N Gould Street
Sheridan, WY 82801
United States

Records available for inspection during business hours.
    `
  },

  // ============================================
  // API REFERENCE
  // ============================================
  {
    id: 'api-001',
    title: 'API Overview',
    slug: 'api-overview',
    category: 'api',
    summary: 'Introduction to the BoyFanz API for developers.',
    difficulty: 'advanced',
    estimatedTime: '15 min',
    lastUpdated: '2026-01-13',
    tags: ['api', 'developers', 'integration'],
    aiPrompts: [
      'How do I use the BoyFanz API?',
      'What endpoints are available?',
      'How do I authenticate API requests?'
    ],
    content: `
# BoyFanz API Overview

## Base URL

\`\`\`
Production: https://boyfanz.fanz.website/api
Staging: https://staging.boyfanz.fanz.website/api
\`\`\`

## Authentication

### Bearer Token
\`\`\`bash
curl -H "Authorization: Bearer YOUR_TOKEN" \\
     https://boyfanz.fanz.website/api/user
\`\`\`

### API Key (Server-to-Server)
\`\`\`bash
curl -H "X-API-Key: YOUR_API_KEY" \\
     https://boyfanz.fanz.website/api/admin/users
\`\`\`

## Response Format

All responses are JSON:
\`\`\`json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 1234
  }
}
\`\`\`

### Error Response
\`\`\`json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
\`\`\`

## Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Public | 100 | 15 min |
| Authenticated | 1000 | 15 min |
| Admin | 5000 | 15 min |

## Key Endpoints

### User
- \`GET /api/user\` - Current user
- \`PUT /api/user\` - Update profile
- \`GET /api/user/:id\` - Get user by ID

### Content
- \`GET /api/posts\` - List posts
- \`POST /api/posts\` - Create post
- \`GET /api/posts/:id\` - Get post
- \`DELETE /api/posts/:id\` - Delete post

### Subscriptions
- \`GET /api/subscriptions\` - Your subscriptions
- \`POST /api/subscribe/:userId\` - Subscribe
- \`DELETE /api/subscribe/:userId\` - Unsubscribe

### Messages
- \`GET /api/messages\` - Conversations
- \`POST /api/messages/:userId\` - Send message
- \`GET /api/messages/:conversationId\` - Get messages

## Webhooks

Configure webhooks for real-time events:
- \`subscription.created\`
- \`subscription.cancelled\`
- \`payment.received\`
- \`message.received\`
- \`content.reported\`
    `
  },

  // ============================================
  // TECHNICAL
  // ============================================
  {
    id: 'tech-001',
    title: 'System Architecture',
    slug: 'architecture',
    category: 'technical',
    summary: 'Technical overview of the BoyFanz platform architecture.',
    difficulty: 'advanced',
    estimatedTime: '30 min',
    lastUpdated: '2026-01-13',
    tags: ['architecture', 'technical', 'infrastructure'],
    aiPrompts: [
      'What technology stack does BoyFanz use?',
      'How is the database structured?',
      'Explain the authentication flow'
    ],
    content: `
# System Architecture

## Technology Stack

### Frontend
\`\`\`
├── React 18 + TypeScript
├── Vite (build tool)
├── TailwindCSS + shadcn/ui
├── React Query (@tanstack/react-query)
├── Wouter (routing)
└── Radix UI (accessibility)
\`\`\`

### Backend
\`\`\`
├── Node.js + Express
├── TypeScript
├── PostgreSQL + Drizzle ORM
├── Redis (caching/sessions)
├── WebSocket (real-time)
└── BullMQ (job queue)
\`\`\`

### Infrastructure
\`\`\`
├── Load Balancer (nginx)
├── Application Servers (PM2)
├── Database (PostgreSQL/Neon)
├── CDN (BunnyCDN)
├── Object Storage (S3/GCS)
└── Redis Cluster
\`\`\`

## Database Schema

### Core Tables
| Table | Description | Rows |
|-------|-------------|------|
| users | User accounts | ~500k |
| posts | Content posts | ~2M |
| subscriptions | Active subs | ~100k |
| transactions | All payments | ~1M |
| messages | DM messages | ~10M |

### Key Relationships
\`\`\`sql
users (1) ──< posts (many)
users (1) ──< subscriptions (many)
users (1) ──< transactions (many)
posts (1) ──< comments (many)
posts (1) ──< likes (many)
\`\`\`

## Authentication Flow

### FanzSSO OAuth 2.0
\`\`\`
1. User clicks "Sign in with FanzSSO"
2. Redirect to sso.fanz.website/authorize
3. User authenticates
4. Redirect back with auth code
5. Exchange code for tokens
6. Store session, redirect to app
\`\`\`

### Token Types
- **Access Token**: 1 hour, API access
- **Refresh Token**: 30 days, renew access
- **ID Token**: User claims (JWT)

## Real-Time Architecture

### WebSocket Events
\`\`\`typescript
// Client connection
ws.connect('wss://boyfanz.fanz.website/ws');

// Events
- 'message:new' - New DM received
- 'notification:new' - New notification
- 'post:live' - Creator went live
- 'tip:received' - Received a tip
\`\`\`

## Content Delivery

### Media Pipeline
\`\`\`
Upload → Virus Scan → Transcode → Watermark → CDN
   ↓
Metadata extraction
   ↓
AI content classification
   ↓
Storage (encrypted)
\`\`\`

### CDN Configuration
- Edge locations: 80+ global
- Cache TTL: 24 hours (public), 1 hour (private)
- Signed URLs for private content
    `
  },

  // ============================================
  // ADMIN
  // ============================================
  {
    id: 'adm-001',
    title: 'Admin Dashboard Overview',
    slug: 'admin-dashboard',
    category: 'admin',
    summary: 'Complete guide to the BoyFanz admin dashboard.',
    difficulty: 'advanced',
    estimatedTime: '25 min',
    lastUpdated: '2026-01-13',
    tags: ['admin', 'dashboard', 'moderation'],
    aiPrompts: [
      'How do I access the admin panel?',
      'What can I do as an admin?',
      'How do I moderate content?'
    ],
    content: `
# Admin Dashboard

## Access Requirements

### Admin Roles
| Role | Access Level |
|------|--------------|
| Super Admin | Full access, all platforms |
| Admin | Platform admin access |
| Moderator | Content moderation only |
| Support | User support only |

### Super Admin Emails
Hardcoded in \`server/routes/ssoRoutes.ts\`:
- wyatt@wyattxxxcole.com
- wyatt@fanz.website

## Dashboard Sections

### Analytics
- Daily/weekly/monthly revenue
- Active users and growth
- Content uploads
- Subscription metrics
- Geographic distribution

### User Management
- Search and filter users
- View user profiles
- Suspend/ban accounts
- Verify creators
- Manage roles

### Content Moderation
- Reported content queue
- AI flagged content
- Manual review
- Take down actions
- Appeal handling

### Financial
- Transaction overview
- Pending payouts
- Deposit tracking (AML)
- Refund requests
- Revenue analytics

### Compliance
- 2257 records audit
- KYC verification queue
- GDPR/CCPA requests
- Legal form management
- Violation tracking

## Common Admin Tasks

### Verifying a Creator
1. Navigate to User Management
2. Search for user
3. Click "View Profile"
4. Review submitted documents
5. Approve/reject verification

### Handling Content Report
1. Go to Moderation Queue
2. Review reported content
3. View context and history
4. Take action:
   - Dismiss report
   - Remove content
   - Warn user
   - Suspend account

### Processing Payout
1. Navigate to Withdrawals
2. Review pending requests
3. Verify identity and earnings
4. Approve/reject payout
5. Confirm processing

## Audit Logging

All admin actions are logged:
\`\`\`json
{
  "action": "user.suspend",
  "actor": "admin@fanz.website",
  "target": "user_123",
  "reason": "Terms violation",
  "timestamp": "2026-01-13T10:30:00Z"
}
\`\`\`
    `
  },

  // ============================================
  // TROUBLESHOOTING
  // ============================================
  {
    id: 'ts-001',
    title: 'Common Issues',
    slug: 'common-issues',
    category: 'troubleshooting',
    summary: 'Solutions to the most common problems users encounter.',
    difficulty: 'beginner',
    estimatedTime: '10 min',
    lastUpdated: '2026-01-13',
    tags: ['troubleshooting', 'help', 'issues'],
    aiPrompts: [
      'Why cant I log in?',
      'My upload failed, what do I do?',
      'Why is my content not showing?'
    ],
    content: `
# Common Issues & Solutions

## Login Problems

### "Invalid credentials"
- Double-check email spelling
- Reset password if forgotten
- Try FanzSSO if email login fails

### "Account suspended"
- Check email for suspension notice
- Contact support to appeal
- Review Terms of Service

### 2FA not working
- Verify time is synced on device
- Use backup codes
- Contact support for reset

## Upload Issues

### "Upload failed"
- Check file size (max 4GB video, 50MB image)
- Verify file format (MP4, MOV, JPG, PNG)
- Check internet connection
- Try smaller file or different browser

### "Processing stuck"
- Wait up to 30 minutes for large files
- Don't refresh during processing
- Contact support if stuck > 1 hour

## Payment Issues

### Payment declined
1. Try a different card
2. Contact bank to allow adult purchases
3. Use cryptocurrency
4. Try prepaid card

### Payout not received
- Check payout status in dashboard
- Verify banking details
- Allow 3-5 business days
- Contact support with payout ID

## Content Not Showing

### Post not visible
- Check if post is scheduled
- Verify visibility settings
- Ensure not under review
- Check for platform issues

### Subscriber cant see content
- Verify their subscription is active
- Check tier permissions
- Clear their browser cache
- Try incognito mode

## Performance Issues

### App running slow
- Clear browser cache
- Disable browser extensions
- Try different browser
- Check internet speed

### Videos not loading
- Check internet connection
- Try lower quality setting
- Disable VPN if active
- Clear browser cache

## Contact Support

If issues persist:
1. Email: support@fanz.website
2. In-app: Settings > Help > Contact
3. Response time: < 24 hours
    `
  }
];

// Helper functions
export function getArticleBySlug(slug: string): WikiArticle | undefined {
  return wikiArticles.find(a => a.slug === slug);
}

export function getArticlesByCategory(category: WikiCategory): WikiArticle[] {
  return wikiArticles.filter(a => a.category === category);
}

export function searchArticles(query: string): WikiArticle[] {
  const lowerQuery = query.toLowerCase();
  return wikiArticles.filter(a =>
    a.title.toLowerCase().includes(lowerQuery) ||
    a.summary.toLowerCase().includes(lowerQuery) ||
    a.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
    a.content.toLowerCase().includes(lowerQuery)
  );
}

export function getRelatedArticles(articleId: string): WikiArticle[] {
  const article = wikiArticles.find(a => a.id === articleId);
  if (!article?.relatedArticles) return [];
  return article.relatedArticles
    .map(id => wikiArticles.find(a => a.id === id))
    .filter((a): a is WikiArticle => a !== undefined);
}
