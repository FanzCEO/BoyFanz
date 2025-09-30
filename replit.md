# Overview

BoyFanz is a creator economy platform enabling content creators to upload, monetize, and connect with fans in a compliant and secure environment. Styled with a dark, edgy neon aesthetic featuring vibrant red and golden accents ("Every Man's Playground"), it offers comprehensive tools for media management, payment processing, KYC compliance, moderation, and real-time notifications, built specifically for the Replit ecosystem. The platform aims to provide a robust and engaging experience for both creators and their audience.

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

## Payment System
- **Architecture**: Provider-agnostic adapter pattern.
- **Features**: Request-based payout system, tax reporting, and audit trail support.

## Real-time Features
- **Components**: WebSocket server, user presence tracking, multi-channel notification system, admin broadcasting.

## AI Integration
- **Features**: AI-assisted tutorials (AI Chat Support, Interactive Guides), floating AI chatbot for platform support.

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