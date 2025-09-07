# Overview

Fanz is a creator economy platform designed for content creators to upload, monetize, and connect with their fans while maintaining full compliance and security. The platform features a neon/varsity aesthetic with dark mode as default, providing a modern and engaging user experience. Built specifically for the Replit environment, it offers comprehensive tools for media management, payment processing, KYC compliance, moderation workflows, and real-time notifications.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and hot module replacement
- **Styling**: TailwindCSS with custom CSS variables for theming, using shadcn/ui components built on Radix UI primitives
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **File Uploads**: Uppy.js with AWS S3 integration for robust file upload capabilities

## Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript for type safety across the entire stack
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Real-time Communication**: WebSocket server using the 'ws' library for live notifications and updates
- **Authentication**: Session-based auth with Replit's OpenID Connect integration
- **Validation**: Zod schemas for request/response validation and type inference

## Database Design
- **ORM**: Drizzle with PostgreSQL dialect for migration management and type-safe queries
- **Schema**: Comprehensive schema covering users, profiles, media assets, moderation queue, payments, KYC verification, audit logs, and webhooks
- **Relationships**: Well-defined foreign key relationships with proper cascade delete behavior
- **Indexing**: Strategic indexes on session expiration and frequently queried fields

## Security & Compliance
- **Authentication**: Replit OAuth integration with session management and CSRF protection
- **Authorization**: Role-based access control (fan, creator, admin) with route-level guards
- **KYC Integration**: VerifyMy service integration with webhook handling for identity verification
- **Audit Logging**: Comprehensive audit trail for all moderation and administrative actions
- **Content Moderation**: Queue-based system with human review workflow and policy enforcement

## File Storage & Media Pipeline
- **Storage**: S3-compatible object storage with presigned URL uploads for direct client-to-storage transfers
- **Processing**: Server-side image processing with Sharp.js for thumbnail generation
- **Access Control**: Object-level ACL policies with metadata-based permission management
- **Lifecycle**: Automatic object tagging and lifecycle management for cost optimization

## Payment System
- **Architecture**: Provider-agnostic payment adapter pattern for easy integration switching
- **Current Implementation**: Mock provider for development with structured interfaces for production providers
- **Payout Management**: Request-based payout system with status tracking and CSV export capabilities
- **Compliance**: Built-in support for tax reporting and audit trail requirements

## Real-time Features
- **WebSocket Server**: Persistent connections for live notifications and system updates
- **Presence System**: User presence tracking and real-time status updates
- **Notification System**: Multi-channel notification delivery (WebSocket, database persistence)
- **Admin Broadcasting**: System-wide announcement capabilities for administrative communications

## Middleware & Utilities
- **Rate Limiting**: In-memory rate limiting with automatic cleanup and configurable thresholds
- **Request Validation**: Zod-based middleware for automatic request body validation
- **Error Handling**: Centralized error handling with proper HTTP status codes and user-friendly messages
- **Logging**: Structured logging with request timing and response capture for debugging

# External Dependencies

## Core Infrastructure
- **Database**: PostgreSQL via Neon serverless with connection pooling
- **Object Storage**: S3-compatible storage (configured for Wasabi/MojoHost S3)
- **Session Store**: PostgreSQL-backed session storage for authentication persistence

## Authentication & Identity
- **Replit Auth**: OpenID Connect integration with Replit's identity provider
- **VerifyMy**: KYC verification service for identity validation and compliance
- **Session Management**: Express-session with PostgreSQL store for secure session handling

## Frontend Libraries
- **Radix UI**: Accessible component primitives for building the user interface
- **shadcn/ui**: Pre-built component library with consistent design system
- **Uppy**: File upload library with dashboard modal and AWS S3 plugin
- **Lucide React**: Icon library for consistent iconography throughout the application

## Development Tools
- **Drizzle Kit**: Database migration and schema management tooling
- **Vite**: Development server and build tool with hot module replacement
- **TypeScript**: Type checking and enhanced developer experience
- **ESLint & Prettier**: Code linting and formatting for consistent code quality

## Monitoring & Analytics
- **Built-in Logging**: Custom logging system with request/response tracking
- **Audit Trail**: Database-backed audit logging for compliance and debugging
- **Error Tracking**: Centralized error handling with detailed error information