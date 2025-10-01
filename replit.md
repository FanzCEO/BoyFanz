# Overview

BoyFanz is a comprehensive financial ecosystem empire and creator economy platform featuring FanzTrust™ payment verification system with multiple financial products (FanzPay, FanzRev, FanzToken, FanzCoin, FanzMoney, FanzCredit, FanzCard, FanzMoneyCenter Dashboard). Styled with an underground fight club aesthetic with glassmorphism UI, exact logo-matching colors (#ff0000 bright red neon, #d4a959 warm golden-bronze), and complete creator economy infrastructure. The platform enables content creators to upload, monetize, and connect with fans in a compliant and secure environment, offering state-of-the-art financial tools never before seen in creator platforms.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend
- **Framework**: React 18 (TypeScript, Vite)
- **Styling**: TailwindCSS, shadcn/ui (Radix UI), custom CSS variables
- **State Management**: TanStack Query
- **Routing**: Wouter
- **Forms**: React Hook Form with Zod
- **File Uploads**: Uppy.js (AWS S3 integration)
- **UI/UX**: Dark, edgy neon aesthetic with red and gold accents, glass-morphism effects, Bebas Neue for headers, Inter for body text, Lucide React for icons. Includes an infinite scroll feed with mixed content and integrated monetization.

## Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time Communication**: WebSocket server ('ws' library)
- **Authentication**: Session-based auth with Replit OpenID Connect, CSRF protection, role-based access control (fan, creator, admin)
- **Validation**: Zod schemas
- **Middleware**: Rate limiting, Zod-based request validation, centralized error handling, structured logging.

## Database Design
- **ORM**: Drizzle (PostgreSQL dialect)
- **Schema**: Covers users, profiles, media assets, moderation, payments, KYC, audit logs, webhooks.
- **Security**: Strategic indexing, foreign key relationships, audit logging for all critical actions.

## Security & Compliance
- **Authentication**: Replit OAuth, session management, CSRF protection.
- **Authorization**: Role-based access control.
- **KYC**: VerifyMy service integration.
- **Content Moderation**: Queue-based system with human review.

## File Storage & Media Pipeline
- **Storage**: S3-compatible object storage (presigned URLs for direct uploads).
- **Processing**: Server-side image processing with Sharp.js for thumbnails.
- **Access Control**: Object-level ACLs, metadata-based permissions.

## Financial Ecosystem - FanzTrust™
- **FanzWallet**: Multi-currency digital wallets with balance tracking (available, pending, held)
- **FanzLedger**: Double-entry bookkeeping transaction ledger with full audit trail (includes 'withdrawal' transaction type)
- **FanzPay**: Instant settlement payment processing system
  - **Deposits**: External payment → FanzWallet credit via 16 payment providers
  - **Withdrawals**: FanzWallet debit → External payout via 7 payout providers
  - **Instant Transfers**: P2P, fan-to-creator, real-time FanzWallet transfers
  - **Providers**: 16 payment (8 card, 4 crypto, 2 bank, 2 carrier) + 7 payout (eWallet, bank, crypto)
  - **Adult-Friendly Processors**: CCBill, Segpay, Epoch, Verotel, VendoServices, CommerceGate, NETbilling, CentroBill, NOWPayments, CoinsPaid, B2BinPay, CoinPayments, ACH, SEPA, Bango, Boku
  - **Creator Payouts**: Paxum, CosmoPayment, ePayService, iPayout, MassPay, Wise, Payoneer
- **FanzCredit**: Credit lines and lending with trust scoring, collateral support, and automated interest
- **FanzToken & FanzCoin**: Platform token economy (FanzCoin, FanzToken, loyalty, rewards, utility tokens)
- **FanzCard**: Virtual debit cards with spend controls and merchant category restrictions
- **FanzRevenue**: Multi-party revenue sharing, collaborative payouts, and automated royalty splits
- **FanzMoneyCenter**: Unified financial control dashboard with real-time analytics

## Real-time Features
- **Components**: WebSocket server, user presence tracking, multi-channel notification system, admin broadcasting.

## AI Integration
- **Features**: AI-assisted tutorials (AI Chat Support, Interactive Guides), floating AI chatbot for platform support.

## Dual Sign-Up Flows
- **Creator (Starz) Onboarding**: 6-step premium flow (Welcome → Account → Profile → Verification → Monetization → Complete)
  - Empowering tone with "Claim Your Star Power" messaging
  - Niche selection with multi-select badges
  - Payout method setup (PayPal, Bank, Crypto, Paxum)
  - 100% earnings highlight throughout
  - ID verification placeholder for compliance
- **Fan (Fanz) Onboarding**: 5-step welcoming flow (Welcome → Account → Personalization → Payment (optional) → Complete)
  - Discovery-driven tone with "Discover. Connect. Support." messaging
  - Interest-based personalization quiz (minimum 3 selections)
  - Skippable payment setup for instant tipping/subscriptions
  - Upgrade to creator link on completion
- **UX Principles**: Progress bars, step navigation, brand-differentiated colors (#ff0000 creator, #d4a959 fan), glassmorphism UI, cross-navigation between roles

## Revenue Quests - AI-Collaborative Revenue Sharing
- **Gamified Revenue Goals**: Creators set revenue targets with fan participation and content unlocks
- **Dynamic Revenue Sharing**: Contributors earn proportional share when completed (zero-sum accounting)
- **Quest Types**: Revenue goal, fan contribution, content unlock, collaborative project
- **AI Suggestions**: Mock AI recommendations for optimal quest goals based on creator performance
- **Milestone System**: Progressive unlocks as quest hits funding milestones (25%, 50%, 75%, 100%)
- **Reward Types**: Exclusive content, NFT, experience, exclusive access
- **Real-Time Tracking**: Live progress bars, contributor count, completion percentage
- **Integrated Ledger**: Full FanzTrust integration with wallet deductions, held funds, and automated payouts
- **Production Features**:
  - **Transaction Integrity**: SELECT FOR UPDATE row locking prevents contribute-after-completion race
  - **Idempotency Guards**: Atomic rewardsDistributed flag prevents double payouts
  - **Zero-Sum Enforcement**: Creator + contributor pool = total amount (exact rounding reconciliation)
  - **Concurrency Safety**: Serialized contributions prevent double-counting and data corruption
  - **Held Fund Flow**: Contribution → held balance → released on payout (creator/contributors)

## Trust Tiering System - FanzTrust Proof Graph
- **5-Tier Trust System**: Unverified → Bronze → Silver → Gold → Platinum → Diamond (0 → 10,000+ points)
- **Proof Verification**: ID, address, payment history, social media, employment, bank statements (50-200 pts each)
- **Automated Scoring**: Transaction volume, account age, disputes won/lost, consecutive good standing days
- **Dispute Resolution**: AI-assisted analysis with admin review, points awarded/deducted based on outcome
- **Credit Integration**: Trust tiers directly influence credit limits (Unverified: $100 → Diamond: $50,000)
- **Interest Rate Tiers**: Trust-based APR (Unverified: 24% → Diamond: 3%)
- **Platform Privileges**: Progressive feature unlocks based on trust tier
  - **Content Limits**: File upload size (50MB → 5GB), files per post (5 → 100), video length (5min → 4hr)
  - **Financial Limits**: Daily withdrawal caps ($500 → $50,000), transaction fees (3% → 0.5%)
  - **Feature Access**: Revenue quests, virtual cards, priority support, advanced analytics, premium streams, token creation
  - **Processing Priority**: Proof verification (low → instant), dispute resolution (low → instant), withdrawal processing (72hr → 1hr)
  - **Visibility Boost**: Profile ranking multiplier (1.0x → 5.0x), featured content eligibility, verified badges
- **Trust Dashboard UI**: Score visualization, tier progress, proof submission/history, dispute filing/resolution
- **Admin Controls**: Proof verification interface, dispute case management, trust score recalculation, tier statistics

## Mixed-Reality Live Events
- **Immersive Virtual Meetups**: Creators host live events with spatial audio and 3D positioning
- **Event Types**: Public meetup, private show, VIP experience, fan meetup, exclusive stream
- **Ticketing System**: 
  - FanzWallet integration with double-entry ledger
  - Access control (free, ticketed, subscription-only, tier-gated)
  - Automatic refunds on cancellation with ledger reversal
  - Capacity management with atomic checks
- **Real-Time Features**:
  - Live attendance tracking (join/leave with duration calculation)
  - Active viewer count with peak tracking
  - 3D spatial positioning for avatars
- **Live Tipping**:
  - Instant FanzWallet transfers during events
  - Anonymous tipping support
  - Live tip display with highlight colors
  - Full transaction integrity (SELECT FOR UPDATE locks, rows-affected validation)
- **NFT Souvenirs**:
  - Blockchain-agnostic commemorative NFTs for attendees
  - Serial numbering with rarity tiers (legendary, epic, common)
  - Automatic minting for event participants
  - Event metadata preservation in NFT attributes
- **Financial Safety**:
  - Pre-flight fund checks before all wallet updates
  - Wallet row locking (SELECT FOR UPDATE) to prevent race conditions
  - Verified debit/credit with rows-affected checks
  - Pre-calculated balanceAfterCents for accurate ledger entries
  - Complete refund automation on event cancellation

# External Dependencies

## Core Infrastructure
- **Database**: PostgreSQL (Neon serverless)
- **Object Storage**: S3-compatible storage (e.g., Wasabi/MojoHost S3)
- **Session Store**: PostgreSQL-backed session storage

## Authentication & Identity
- **Replit Auth**: OpenID Connect
- **VerifyMy**: KYC verification service
- **Session Management**: Express-session

## Frontend Libraries
- **Radix UI**: Accessible component primitives
- **shadcn/ui**: Pre-built component library
- **Uppy**: File upload library
- **Lucide React**: Icon library

## Development Tools
- **Drizzle Kit**: Database migration and schema management
- **Vite**: Development server and build tool
- **TypeScript**: Type checking
- **ESLint & Prettier**: Code quality tooling