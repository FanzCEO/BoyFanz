# BoyFanz-3 - FANZ Unlimited Network Ecosystem

## Overview

BoyFanz-3 is the flagship platform of the FANZ Unlimited Network, a multi-platform adult content creator economy ecosystem. This Node.js/TypeScript backend powers BoyFanz.com and serves as the foundation for the broader FANZ network, which includes GirlFanz, PupFanz, TransFanz, and TabooFanz platforms.

The system is built as a creator-first platform with enterprise-grade infrastructure supporting content monetization, compliance, security, and cross-platform integration. The architecture emphasizes creator autonomy, maximum earnings (100% payout model), and robust safety features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Core Technology Stack

**Backend Framework**
- Node.js with Express and TypeScript for type-safe server-side development
- Vite build system for frontend bundling and development
- Drizzle ORM for database operations with support for both PostgreSQL and SQLite

**Frontend Architecture**
- React 18 with TypeScript
- TailwindCSS for styling with custom theming system
- Radix UI and shadcn/ui component libraries for accessible UI components
- Wouter for lightweight client-side routing
- TanStack Query for server state management

**Database Strategy**
- Flexible database layer supporting both PostgreSQL (production) and SQLite (development)
- Drizzle Kit for schema migrations and database management
- Multi-tenant schema design supporting separate brand identities within unified backend

**Authentication & Security**
- Session-based authentication with JWT tokens
- Role-based access control (RBAC) for fans, creators, and administrators
- KYC/compliance verification integration (VerifyMy, age verification)
- Content moderation with AI-powered detection
- Forensic watermarking and DRM protection for creator content

**API Gateway & Service Mesh**
- Centralized API gateway with rate limiting (1000 req/min production, 10000 req/min development)
- Circuit breaker pattern for fault tolerance (5 failure threshold, 60-second reset)
- Load balancing with multiple algorithms (round-robin, weighted, least connections, IP hash)
- Intelligent caching layer with 100MB default size and 5-minute TTL
- Service discovery and health monitoring for microservices

### Multi-Platform Architecture

**FANZ Ecosystem Platforms**
The system supports five specialized content platforms operating on separate ports:
- BoyFanz (Port 5001) - Men's content platform
- GirlFanz (Port 5002) - Women's content platform
- PupFanz (Port 5003) - Pet play community
- TransFanz (Port 5004) - Trans content platform
- TabooFanz (Port 5005) - Adult taboo content

**Cross-Platform Features**
- Unified identity and authentication across all platforms
- Single sign-on (SSO) with tenant-specific branding
- Shared compliance and verification systems
- Cross-platform content federation and discovery
- Centralized analytics and reporting dashboard (FanzDash)

### Monetization Infrastructure

**Payment Processing**
- Adult-friendly payment gateway integrations (CCBill, Segpay, Epoch, RocketGate)
- NO Stripe or PayPal due to adult content restrictions
- Cryptocurrency payment support (MetaMask, Solana, TronLink)
- Multiple payout methods: Paxum, ACH, cryptocurrency, ePayService, Payoneer, Wise

**Revenue Models**
- Subscription-based memberships with recurring billing
- Pay-per-view (PPV) content unlocking
- Real-time tipping and donations
- Merchandise and digital goods marketplace
- Live streaming with monetization
- Affiliate and referral programs

**Creator Earnings**
- 100% earnings program where creators retain full revenue
- Real-time earnings tracking and analytics
- 24-hour maximum payout processing time
- Transparent fee structure with platform costs separated

### Content Management System

**Media Pipeline**
- S3-compatible object storage (supports AWS S3, Backblaze B2, Wasabi, Cloudflare R2, DigitalOcean Spaces)
- Automated content transcoding and optimization
- Multi-format support (photos, videos, audio, live streams)
- Perceptual hashing for duplicate detection
- Forensic watermarking for content protection
- Preview/thumbnail generation

**CMS Features**
- Shopify-style theme studio with live preview
- Version control for themes and content
- Draft/publish workflow with approval gates
- Page builder with section-based composition
- Menu and navigation management
- SEO optimization tools

### Mobile Backend (ClubCentral)

**Mobile API Infrastructure**
- Dedicated mobile backend service supporting iOS 13+ and Android API 21+
- Push notification system (FCM/APNS)
- Real-time synchronization
- Offline support with local caching
- Device management and session tracking
- React Native compatibility

### Compliance & Safety

**Legal Compliance**
- 18 U.S.C. §2257 record-keeping requirements
- GDPR data protection compliance
- ADA/WCAG 2.1 accessibility standards
- Age verification gates with VerifyMy integration
- Performer ID verification and consent management
- Custodian of records system

**Security Measures**
- DRM content protection
- Geo-blocking capabilities
- Forensic watermarking
- Audit logging for all administrative actions
- Automated content moderation with AI
- CSAM detection and prevention

### Real-Time Features

**WebSocket Infrastructure**
- Live streaming support with co-star verification
- Real-time messaging and chat
- Presence tracking (online/offline status)
- Live notifications and updates
- Interactive features during streams

**Analytics & Monitoring**
- Real-time performance metrics
- Business intelligence dashboards
- Creator insights and earnings reports
- Fan engagement analytics
- Automated alerting via Slack integration

## External Dependencies

### Cloud Infrastructure

**Multi-Cloud Strategy**
The platform supports deployment across 17 cloud providers with automatic failover:
- DigitalOcean, Linode, Vultr (primary hosting)
- Cloudflare (CDN, R2 storage, DDoS protection)
- AWS (S3 storage)
- Backblaze B2, Wasabi (cost-effective object storage)
- BunnyCDN, Fastly (content delivery)

### Payment Gateways

**Adult-Friendly Processors**
- CCBill - Global adult merchant accounts with compliance tools
- Segpay - Adult content specialist with chargeback protection
- Epoch - Subscription billing for adult platforms
- RocketGate - Enterprise adult billing gateway
- CentroBill - Adult subscription processing

**Cryptocurrency**
- NOWPayments - Crypto payment gateway for adult content
- CoinsPaid/CryptoProcessing - Enterprise crypto acquiring
- Direct wallet integrations (MetaMask, Solana, TronLink)

**Payout Services**
- Paxum - Industry-standard adult creator payouts
- ePayService - Multi-rail payout system
- Wise, Payoneer - International transfers
- ACH/SEPA bank transfers

### Third-Party Services

**Verification & Compliance**
- VerifyMy - Age and identity verification
- KYC/KYB verification providers
- Content moderation AI services

**Media Services**
- Video transcoding services (Coconut Video Encoding)
- CDN providers for content delivery
- Object storage providers

**Communication**
- Email service providers
- SMS/push notification services (FCM, APNS)
- Slack webhooks for monitoring alerts

### Development Tools

**Package Management**
- pnpm - Fast, disk space efficient package manager
- Node.js 20+ (LTS)
- Docker for containerization

**Database**
- PostgreSQL (production via Neon serverless)
- SQLite (development and testing)
- Redis (optional, for caching and queues)

**Monitoring & Analytics**
- Real-time monitoring service
- Analytics dashboards
- Error tracking and logging

### API Integrations

**Social Login**
- Google OAuth
- Apple Sign-In
- Facebook Login
- Twitter/X OAuth

**Content Distribution**
- Social media auto-posting (Instagram, TikTok, Twitter, Snapchat)
- QR code generation for marketing
- Smart link generation for content promotion