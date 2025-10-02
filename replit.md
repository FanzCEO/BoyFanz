# Overview

BoyFanz is a financial ecosystem and creator economy platform with an underground fight club aesthetic. It features the FanzTrust™ payment verification system and a suite of financial products (FanzPay, FanzRev, FanzToken, FanzCoin, FanzMoney, FanzCredit, FanzCard, FanzMoneyCenter). The platform empowers content creators to monetize content and connect with fans securely, offering advanced financial tools within a compliant environment.

## Domain Configuration
- **Testing Domain**: fanz.boyfanz.com
- **Production Domain**: BoyFanz.com

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## UI/UX
- **Aesthetic**: Dark, edgy neon with red and gold accents, glassmorphism effects.
- **Typography**: Bebas Neue for headers, Inter for body text.
- **Components**: shadcn/ui (Radix UI), Lucide React for icons.
- **Features**: Infinite scroll feed, mixed content, integrated monetization.
- **Onboarding**: Dual sign-up flows for Creators (6 steps, "Claim Your Star Power") and Fans (5 steps, "Discover. Connect. Support.") with brand-differentiated colors and progress indicators.

## Technical Implementation
- **Frontend**: React 18 (TypeScript, Vite), TailwindCSS, TanStack Query, Wouter, React Hook Form with Zod, Uppy.js.
- **Backend**: Node.js with Express.js (TypeScript), PostgreSQL with Drizzle ORM, WebSocket server ('ws').
- **Authentication**: Session-based with Replit OpenID Connect, CSRF protection, role-based access control.
- **Validation**: Zod schemas.
- **Middleware**: Rate limiting, Zod validation, centralized error handling, structured logging.
- **Database**: PostgreSQL with Drizzle ORM, schema for users, media, payments, KYC, audit logs, etc. Strategic indexing and foreign keys for security.
- **File Storage**: S3-compatible object storage with presigned URLs, server-side image processing with Sharp.js.
- **Security**: Replit OAuth, session management, CSRF, role-based access control, KYC integration (VerifyMy), queue-based content moderation.

## Feature Specifications
- **FanzTrust™ Financial Ecosystem**:
    - **FanzWallet**: Multi-currency digital wallets.
    - **FanzLedger**: Double-entry bookkeeping.
    - **FanzPay**: Instant settlement payment processing (deposits/withdrawals via various providers, P2P transfers).
    - **FanzCredit**: Credit lines, lending with trust scoring, automated interest, and fan-to-creator microlending.
    - **FanzToken & FanzCoin**: Platform token economy, loyalty, rewards.
    - **FanzCard**: Virtual debit cards with controls.
    - **FanzRevenue**: Multi-party revenue sharing and royalty splits.
    - **FanzMoneyCenter**: Unified financial dashboard.
- **Real-time Features**: WebSocket server for user presence, notifications, admin broadcasting.
- **AI Integration**: AI-assisted tutorials, floating chatbot support.
- **Revenue Quests**: Gamified, AI-collaborative revenue sharing with dynamic payouts, milestone system, and real-time tracking, integrated with FanzTrust.
- **Trust Tiering (FanzTrust Proof Graph)**: 5-tier system (Unverified to Diamond) based on proof verification and automated scoring, influencing credit limits, interest rates, platform privileges, and content limits.
- **Deepfake Detection**: AI-powered (OpenAI Vision API) and hash-based content verification, user reporting, and admin triage system.
- **Holographic Streaming**: WebXR-based VR/AR streaming with spatial audio, advanced tracking (hand, eye, gesture), customizable avatars, and interactive features.
- **Mixed-Reality Live Events**: Immersive virtual meetups with FanzWallet-integrated ticketing, live tipping, NFT souvenirs, and financial safety mechanisms.

# External Dependencies

## Core Infrastructure
- **Database**: PostgreSQL (Neon serverless)
- **Object Storage**: S3-compatible storage (e.g., Wasabi/MojoHost S3)
- **Session Store**: PostgreSQL-backed session storage

## Authentication & Identity
- **Replit Auth**: OpenID Connect
- **VerifyMy**: KYC verification service
- **Session Management**: Express-session

## AI Services
- **OpenAI**: Vision API (for Deepfake Detection)

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