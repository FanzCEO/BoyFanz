# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

BoyFanz is a creator economy platform within the Fanz Unlimited Network (FANZ) ecosystem, designed for content creators to upload, monetize, and connect with their fans while maintaining full compliance and security. The platform features a dark, edgy "underground fight club" neon aesthetic with blood-red (#ff0000) and gold (#d4af37) accents, embodying the slogan "Every Man's Playground".

**Repository**: https://github.com/FanzCEO/BoyFanzV1.git  
**Domain**: boyfanz.com  
**Environment**: Built for Replit with Node.js 20 and PostgreSQL 16

## Development Commands

### Core Commands
```bash
# Install dependencies
npm install

# Development server (runs both client and server)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Type checking
npm run check

# Database operations
npm run db:push  # Apply schema changes to development database
```

### Database Operations with Drizzle
```bash
# Generate migrations
npx drizzle-kit generate

# Push schema changes (development)
npx drizzle-kit push

# Apply migrations (production)
npx drizzle-kit migrate

# Open Drizzle Studio (optional)
npx drizzle-kit studio
```

### Replit-Specific Commands
```bash
# Start development (configured in .replit)
# Uses: npm run dev on port 5000

# Deployment commands are handled automatically by Replit
# Build: npm run build
# Run: npm run start
```

## System Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: PostgreSQL 16 + Drizzle ORM
- **Styling**: TailwindCSS + shadcn/ui + Radix UI
- **State Management**: TanStack Query
- **Routing**: Wouter
- **Authentication**: Dual system (Replit OAuth + Local auth)
- **File Uploads**: Uppy.js with AWS S3 integration
- **Real-time**: WebSocket server with 'ws' library

### Project Structure
```
BoyFanz-3/
├── client/                     # React frontend
│   ├── src/
│   │   ├── App.tsx            # Main app component with routing
│   │   ├── components/        # Reusable components
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── layout/        # Header, Sidebar
│   │   │   └── AIChatBot.tsx  # AI assistant integration
│   │   └── pages/             # Route components
│   └── index.html
├── server/                     # Express backend
│   ├── index.ts               # Main server entry point
│   ├── routes.ts              # API route definitions
│   ├── middleware/            # Auth, CSRF, validation, rate limiting
│   ├── services/              # Business logic layer
│   └── db.ts                  # Database connection
├── shared/
│   └── schema.ts              # Drizzle database schema
├── package.json
├── drizzle.config.ts          # Database configuration
├── vite.config.ts             # Frontend build configuration
└── .replit                    # Replit deployment configuration
```

### Authentication System
The platform uses a dual authentication approach:

1. **Replit OAuth**: Primary authentication via OpenID Connect
2. **Local Authentication**: Username/password with bcryptjs hashing
3. **Session Management**: PostgreSQL-backed sessions with CSRF protection
4. **Role-Based Access**: fan, creator, moderator, admin roles

### FANZ Ecosystem Integration
- **Control Center**: FanzDash manages all platform operations, moderation, and security
- **SSO Integration**: Future integration point for FanzSSO across all FANZ clusters
- **Media Pipeline**: Integration with MediaHub for forensic watermarking and protection
- **Compliance**: FanzHubVault stores regulatory forms and sensitive user data
- **Payment System**: Comprehensive multi-rail payment processing with adult-friendly gateways
- **Host Merchant Services**: Core MID management, risk monitoring, and chargeback handling

## Environment Configuration

### Required Environment Variables
```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/fanz_db

# Authentication
SESSION_SECRET=your-session-secret-key
JWT_SECRET=your-jwt-secret-key-64-characters

# Replit OAuth
REPL_ID=your-repl-id
REPLIT_DOMAINS=your-repl-domain.repl.co
ISSUER_URL=https://replit.com/oidc

# Application
NODE_ENV=development
PORT=5000
WEB_APP_URL=http://localhost:5000
API_URL=http://localhost:5000/api

# Object Storage
PUBLIC_OBJECT_SEARCH_PATHS=/bucket-name/public-assets
PRIVATE_OBJECT_DIR=/bucket-name/private

# KYC Integration
VERIFYMY_API_URL=https://api.verifymy.com
VERIFYMY_API_KEY=your-verifymy-api-key

# Email
OTP_EMAIL_FROM=noreply@boyfanz.com
```

### Replit Secrets
Store all sensitive environment variables in Replit's Secrets tab:
- `DATABASE_URL`
- `SESSION_SECRET`
- `JWT_SECRET`
- `VERIFYMY_API_KEY`

## Database Schema

The schema is defined in `shared/schema.ts` using Drizzle ORM with PostgreSQL dialect:

### Core Tables
- **users**: User accounts with dual auth support
- **profiles**: Extended user profile information
- **sessions**: PostgreSQL-backed session storage
- **kycVerifications**: KYC compliance records
- **records2257**: 18 U.S.C. §2257 compliance documentation
- **mediaAssets**: Content files with moderation status
- **moderationQueue**: Content review workflow
- **auditLogs**: Comprehensive audit trail
- **payoutAccounts** & **payoutRequests**: Creator earnings management

### Migration Workflow
1. Update schema in `shared/schema.ts`
2. Generate migration: `npx drizzle-kit generate`
3. Review generated SQL in `migrations/`
4. Apply to development: `npm run db:push`
5. Test thoroughly before production deployment

## Payment & Payout Architecture

### Multi-Rail Payment Processing
The platform integrates with a comprehensive payment ecosystem managed through FanzDash:

#### Card Gateways (Adult-Friendly)
- **Primary Processors**: CCBill, Segpay, Epoch, Vendo, Verotel
- **Secondary Options**: NetBilling, CommerceGate, RocketGate, CentroBill
- **Alternative Rails**: Payze, Kolektiva, PayGarden (gift cards)

#### Bank & Direct Payment Methods
- **US**: ACH, eCheck/Check21, Wire transfers (SWIFT)
- **EU**: SEPA Direct Debit, Trustly, Sofort, Giropay, iDEAL
- **Global**: Wire transfers, regional banking solutions

#### Mobile & Wallet Payments
- **Digital Wallets**: Apple Pay, Google Pay, Samsung Pay
- **P2P Networks**: Venmo (via PayPal routes), Cash App Pay
- **International**: AliPay, WeChat Pay (for global expansion)

#### Cryptocurrency Gateways
- **Primary**: BitPay, Coinbase Commerce, NOWPayments
- **Secondary**: CoinGate, CoinsPaid, OpenNode (Lightning)
- **Enterprise**: Uphold Merchant, GoCoin

#### Local & Alternative Payment Methods
- **Prepaid**: Paysafecard, Neosurf, AstroPay, Flexepin
- **Regional**: Interac (Canada), Pix (Brazil), UPI (India)
- **Digital**: EcoPayz, Boleto Bancário

### Creator Payout System
Managed through FanzDash payout orchestration:

#### Primary Payout Providers
- **Industry Standard**: Paxum, ePayService, Cosmo Payment
- **Mainstream Options**: Wise, Payoneer, Skrill, Neteller
- **Direct Banking**: ACH/SEPA direct deposits, Zelle
- **Cryptocurrency**: BTC, ETH, USDT, USDC payouts
- **Legacy**: Paper checks, wire transfers

### Host Merchant Services Integration
- **MID Management**: Multiple merchant ID handling and rotation
- **Risk Monitoring**: Real-time chargeback and fraud detection
- **Smart Routing**: Automatic failover and load balancing
- **Compliance**: Adult merchant advocacy and regulatory support

### FanzDash Payment Control Center
- **Unified Dashboard**: Single interface for all payment rails
- **Real-time Analytics**: Transaction monitoring, approval rates, fees
- **Automated Routing**: Intelligence-based gateway selection
- **Payout Orchestration**: Bulk creator payouts with compliance checks
- **Risk Management**: Chargeback alerts, dispute handling, MID throttling

## API Architecture

### Service Layer Pattern
```
Routes → Controllers → Services → Repositories → Database
```

- **Routes** (`server/routes.ts`): HTTP endpoint definitions
- **Controllers**: Request/response handling and validation
- **Services** (`server/services/`): Business logic implementation
- **Repositories**: Database access via Drizzle ORM
- **Middleware**: Authentication, CSRF, rate limiting, validation

### Key Services
- **aiModerationService**: AI-powered content moderation
- **contentManagementService**: Media upload and processing
- **earningsService**: Creator payout management
- **getstreamService**: Live streaming integration
- **financialLedgerService**: Transaction recording
- **enhancedPaymentService**: Multi-gateway payment orchestration
- **adultPaymentProviders**: Adult-friendly payment processor integration

## Security & Compliance

### Security Headers (Helmet.js)
- Content Security Policy with development/production variants
- HSTS (production only)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Permissions-Policy for feature control

### CSRF Protection
- Double-submit cookie pattern
- CSRF tokens for all state-changing operations
- Endpoint: `/api/csrf-token`

### Rate Limiting
- In-memory rate limiting with automatic cleanup
- Configurable thresholds per endpoint
- Special authentication rate limiting

### Compliance Requirements
- **ADA/Accessibility**: WCAG 2.1 AA baseline, keyboard navigation, ARIA roles
- **GDPR**: Data subject rights, consent management, breach response procedures
- **18 U.S.C. §2257**: Content creator verification and record keeping
- **KYC Integration**: VerifyMy service for identity verification

## Frontend Architecture

### Component System
- **shadcn/ui**: Pre-built accessible components
- **Radix UI**: Low-level primitive components
- **Custom Components**: Platform-specific UI elements
- **Layout Components**: Header, Sidebar with responsive design

### Theming
- **Underground Fight Club Aesthetic**: Dark theme with neon accents
- **Color Palette**: Deep charcoal background, blood-red neon (#ff0000), gold accents (#d4af37)
- **Typography**: Bebas Neue for headers, Inter for body text
- **CSS Variables**: Custom theming system with TailwindCSS

### State Management
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form handling with Zod validation
- **Wouter**: Lightweight client-side routing

## Development Workflow

### Local Development
1. Clone repository: `git clone https://github.com/FanzCEO/BoyFanzV1.git`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Set up PostgreSQL database
5. Run migrations: `npm run db:push`
6. Start development server: `npm run dev`
7. Access at http://localhost:5000

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESM Modules**: ES module format throughout
- **Zod Validation**: Type-safe request/response validation
- **Structured Logging**: Pino logger with request correlation IDs

### Testing Strategy
- Unit tests for services and utilities
- Integration tests for API endpoints
- Component tests for React components
- End-to-end tests for critical user flows

## Deployment

### Replit Deployment
- Automatic deployment via `.replit` configuration
- Build command: `npm run build`
- Run command: `npm run start`
- Port 5000 exposed as primary application port

### Production Checklist
- [ ] Environment variables configured in Replit Secrets
- [ ] Database migrations applied
- [ ] SSL/TLS certificates configured
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] Monitoring and logging enabled

## FANZ Ecosystem Compliance

### Branding Requirements
- Use "Fanz" prefix for all modules and features (not "FUN")
- Domain: boyfanz.com for all BoyFanz references
- Control center: All operations managed through FanzDash
- Payment processing: Multi-rail system with adult-friendly gateways
- No Stripe or PayPal: Use approved adult-industry payment processors only

### Integration Points
- **FanzSSO**: Single sign-on across FANZ ecosystem
- **FanzDash**: Central security and moderation control
- **MediaHub**: Forensic media protection and watermarking
- **FanzHubVault**: Regulatory document storage
- **FanzFinance OS**: Integrated financial management

### Compliance Monitoring
- ADA/accessibility compliance validation
- GDPR data protection impact assessments
- Regular security audits and vulnerability scans
- Audit trail maintenance for all administrative actions

## Troubleshooting

### Common Issues
- **Infinite Loading**: Check authentication timeout handling (3-second fallback implemented)
- **Admin Access**: Default admin credentials - username: `admin`, password: `admin123`
- **Database Connection**: Ensure PostgreSQL service is running and DATABASE_URL is correct
- **File Uploads**: Verify S3 bucket configuration and permissions

### Health Endpoints
- `/health`: Basic health check
- `/ready`: Readiness probe for deployment
- API endpoints return structured error responses

### Logging
- Structured logging with Pino
- Request correlation IDs for tracing
- No sensitive data logged (automatic redaction)
- Error tracking with detailed context

---

For additional support, consult the internal documentation in FanzDash or contact the platform development team.