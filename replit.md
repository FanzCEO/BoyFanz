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