> **PROPRIETARY** - Owned by Joshua Stone (Wyatt Cole) and Licensed Usage to FANZ Group Holdings LLC.
> 30 N GOULD STREET SHERIDAN, WY 82801
> (tm) FANZ patent pending 2025

---

# FANZ Development Rules for Claude

## CRITICAL - HIGHEST PRIORITY

### Platform Deployment Lock System

**NEVER deploy to a locked platform without authorization.** This is a non-negotiable security requirement.

#### Before ANY Deployment to BoyFanz:

1. **Check if platform is locked:**
   ```bash
   test -f /var/www/boyfanz/.deploy-lock && echo "LOCKED" || echo "unlocked"
   ```

2. **If locked, MUST verify with user code first:**
   ```bash
   /var/www/boyfanz/verify-deploy.sh "<USER_PROVIDED_CODE>"
   ```

3. **Only proceed if verification succeeds**

#### This Platform is: LOCKED
- Requires authorization code before deployment
- SHA-256 Hash: `91d24fe509143191d1de388e8d62584fb4cd0a569f95f6d7d28927e7943f0fad`
- Ask user for code if needed - NEVER guess or bypass

---

## Quick Reference

### Build Commands

```bash
# Development (hot reload)
npm run dev          # or pnpm dev - starts both client and server

# Production Build
npm run build        # Builds client (Vite) + server (esbuild)

# Start Production
NODE_ENV=production node dist/index.js

# Database Migrations
npm run db:push      # Push schema changes via Drizzle Kit

# Type Checking
npm run check        # TypeScript type check

# Tests
npm run test         # Platform isolation verification tests
```

### Deployment Order

1. Build locally: `npm run build`
2. **Check platform lock status** (see above)
3. **Verify authorization if locked**
4. Deploy: `rsync -avz dist/ fanz:/var/www/boyfanz/dist/`
5. Restart: `pm2 restart boyfanz`

---

## Architecture Overview

### FANZ Ecosystem

BoyFanz is one platform in the FANZ multi-tenant creator economy ecosystem:

| Platform | Domain | Description |
|----------|--------|-------------|
| BoyFanz | boyfanz.fanz.website | Male creator platform |
| GirlFanz | girlfanz.fanz.website | Female creator platform |
| PupFanz | pupfanz.com | Pet/furry creator community |
| TabooFanz | taboofanz.com | Adult content platform |
| TransFanz | transfanz.com | Trans creator platform |
| BearFanz | bearfanz.com | Bear community platform |
| MILFFanz | milffanz.com | MILF creator platform |
| CougarFanz | cougarfanz.com | Cougar creator platform |
| BroFanz | brofanz.com | Bro creator platform |
| FemmeFanz | femmefanz.com | Femme creator platform |
| DaddyFanz | daddyfanz.com | Daddy creator platform |
| SouthernFanz | southernfanz.com | Southern creator platform |
| GayFanz | gayfanz.com | Gay creator platform |

### Tech Stack

- **Frontend:** React 18 + Vite + TypeScript
- **Backend:** Express.js + TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **State Management:** React Query (@tanstack/react-query)
- **UI Components:** Radix UI + Tailwind CSS + shadcn/ui
- **Authentication:** FanzSSO (centralized SSO) + Passport.js
- **Real-time:** WebSockets (ws) + Socket.io
- **Payments:** Stripe + 12+ adult-friendly payment processors
- **Storage:** AWS S3 / Google Cloud Storage / BunnyCDN

### Project Structure

```
boyfanz/
├── client/                 # React frontend
│   └── src/
│       ├── components/     # React components
│       ├── pages/          # Route pages (admin/, creator/, etc.)
│       ├── hooks/          # Custom React hooks
│       ├── contexts/       # React contexts
│       ├── lib/            # Utilities (queryClient, utils)
│       ├── styles/         # CSS files
│       └── App.tsx         # Main app with routing
├── server/
│   ├── routes.ts           # Express API routes (219k lines)
│   ├── storage.ts          # Drizzle ORM database layer (184k lines)
│   ├── auth.ts             # Authentication logic
│   ├── index.ts            # Express server entry point
│   ├── websocket.ts        # WebSocket handlers
│   ├── services/           # 100+ service modules
│   ├── routes/             # Modular route files
│   ├── middleware/         # Express middleware
│   └── bots/               # Bot automation
├── shared/
│   ├── schema.ts           # Drizzle schema (415k lines)
│   ├── auth/               # Shared auth types
│   └── *.ts                # Shared schemas and types
├── dist/                   # Production build output
├── nginx/                  # Nginx configuration
└── migrations/             # Database migrations
```

---

## Key Patterns and Conventions

### Database Layer (storage.ts)

All database access goes through `server/storage.ts`:

```typescript
// Pattern for database methods
async getEntityByFilters(filters: any): Promise<{ items: any[]; total: number; page: number; limit: number }> {
  const conditions = [];

  // Build conditions from filters
  if (filters.status) conditions.push(eq(table.status, filters.status));
  if (filters.userId) conditions.push(eq(table.userId, filters.userId));

  // Apply conditions
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Query with pagination
  const items = await db.select()
    .from(table)
    .where(whereClause)
    .limit(filters.limit || 50)
    .offset(filters.offset || 0);

  return { items, total, page, limit };
}
```

### Financial Amounts

**All monetary amounts are stored as cents (integers) in the database:**

```typescript
// Storing: multiply by 100
const amountInCents = Math.round(dollarAmount * 100);

// Retrieving: divide by 100
const amountInDollars = amountInCents / 100;
```

### API Routes

Routes are defined in `server/routes.ts` and use this pattern:

```typescript
app.get("/api/admin/resource", requireAdminAuth, async (req, res) => {
  const { page, limit, status } = req.query;
  const result = await storage.getResources({ page, limit, status });
  res.json(result);
});
```

### React Query

All API calls use React Query with endpoint-based query keys:

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ["/api/admin/resource", { filters }],
  queryFn: () => apiRequest("GET", "/api/admin/resource", { params: filters }),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### Admin Authentication

Admin access is verified via `/api/auth/check-admin` endpoint:

```typescript
interface CheckAdminResponse {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isModerator: boolean;
  bypassCharges: boolean;
  roles?: string[];
}
```

Super admin emails are hardcoded in `server/routes/ssoRoutes.ts`.

### Audit Logging

All administrative actions MUST be logged:

```typescript
await storage.createAuditLog({
  actorId: adminUserId,
  action: "update_status",
  targetType: "payout",
  targetId: payoutId,
  diffJson: { oldStatus, newStatus },
});
```

---

## Important Files Reference

| File | Purpose | Size |
|------|---------|------|
| `server/routes.ts` | All API route definitions | 219k |
| `server/storage.ts` | Database access layer (Drizzle ORM) | 184k |
| `shared/schema.ts` | Database schema definitions | 415k |
| `client/src/App.tsx` | React router and app shell | 28k |
| `client/src/index.css` | Global styles and Tailwind | 106k |

### Key Admin Pages (client/src/pages/admin/)

- `Dashboard.tsx` - Admin analytics dashboard
- `UserManagement.tsx` - User administration
- `TransactionsManagement.tsx` - Financial transactions
- `Withdrawals.tsx` - Payout/withdrawal management
- `DepositsManagement.tsx` - Deposit tracking with AML
- `ModerationQueue.tsx` - Content moderation
- `SystemSettings.tsx` - Platform configuration

---

## Security Requirements

### Password Security

All user passwords MUST be hashed with bcrypt. Never store plain text passwords.

### Session Management

- Sessions stored in PostgreSQL via connect-pg-simple
- Session cookies are httpOnly and secure in production
- JWT tokens used for API authentication

### Rate Limiting

Express rate limiter configured for all endpoints:
- Standard: 100 requests/15 minutes
- Auth endpoints: 5 requests/15 minutes
- Admin endpoints: 50 requests/15 minutes

---

## Environment Variables

Required environment variables (see `.env.example`):

```bash
# Database
DATABASE_URL=postgresql://...

# Session
SESSION_SECRET=...

# FanzSSO
FANZ_SSO_CLIENT_ID=...
FANZ_SSO_CLIENT_SECRET=...
FANZ_SSO_ISSUER_URL=https://sso.fanz.network

# Storage
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=...

# Payments
STRIPE_SECRET_KEY=...
```

---

## Common Tasks

### Adding a New Admin Endpoint

1. Add route in `server/routes.ts`:
```typescript
app.get("/api/admin/new-endpoint", requireAdminAuth, async (req, res) => {
  const result = await storage.newMethod(req.query);
  res.json(result);
});
```

2. Add storage method in `server/storage.ts`:
```typescript
async newMethod(filters: any) {
  return db.select().from(table).where(...);
}
```

3. Add frontend hook/page in `client/src/pages/admin/`

### Adding Database Tables

1. Define schema in `shared/schema.ts`:
```typescript
export const newTable = pgTable("new_table", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

2. Run migration: `npm run db:push`

---

## Troubleshooting

### Build Errors

```bash
# Clear build cache
rm -rf dist/ node_modules/.vite

# Reinstall dependencies
rm -rf node_modules && npm install

# Rebuild
npm run build
```

### Database Connection Issues

```bash
# Verify connection string
node -e "console.log(process.env.DATABASE_URL)"

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Port Already in Use

```bash
# Find process on port 5000
lsof -i :5000

# Kill if needed
kill -9 <PID>
```

---

## Contact

Platform owner: Wyatt
All deployment authorization goes through Wyatt code.
