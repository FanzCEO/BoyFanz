# BoyFanz Local Dev Server - Fixes Needed

## Issues Identified

1. **SSL Configuration** - `server/db.ts`
2. **geoip-lite crashing** - `server/services/advancedSecurityService.ts`
3. **Missing `lt` import** - `server/services/userDataExportService.ts`
4. **Duplicate imports** - `client/src/App.tsx`
5. **Missing dependencies** - `react-router-dom`, `nodemailer`

---

## Fix 1: SSL Configuration (server/db.ts)

**Current (WRONG):**
```typescript
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
```

**Should be:**
```typescript
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Only use SSL in production, local dev databases typically don't have SSL
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});
```

---

## Fix 2: geoip-lite Handling (server/services/advancedSecurityService.ts)

**Current (WRONG):**
```typescript
import geoip from 'geoip-lite';
```

**Should be:**
```typescript
import axios from 'axios';
import { Request, Response, NextFunction } from 'express';

// Gracefully handle geoip-lite if data is not available
let geoip: any;
try {
  geoip = require('geoip-lite');
} catch (e) {
  console.warn('⚠️  geoip-lite not available - geo-blocking features disabled');
  geoip = null;
}
```

**Also add null check in checkAccess method (around line 342):**
```typescript
async checkAccess(ip: string, userId?: string): Promise<{
  allowed: boolean;
  country: string;
  reason?: string;
  vpnDetected?: boolean;
}> {
  if (!geoip) {
    return {
      allowed: true,
      country: 'unknown',
      reason: 'GeoIP service unavailable'
    };
  }

  const geoInfo = geoip.lookup(ip);
  // ... rest of method
}
```

---

## Fix 3: Missing `lt` Import (server/services/userDataExportService.ts)

**Line 24 - Current (WRONG):**
```typescript
import { eq, and, desc, sql } from "drizzle-orm";
```

**Should be:**
```typescript
import { eq, and, desc, sql, lt } from "drizzle-orm";
```

---

## Fix 4: Duplicate Imports (client/src/App.tsx)

**Remove these duplicate lines:**
- Line ~105: `import Login from '@/pages/Login';` (keep the one at line 55)
- Line ~105: `import AuthCallback from '@/pages/AuthCallback';` (keep the one at line 56)
- Line ~125: `import Login from "@/pages/auth/Login";` (this is legacy, remove it)

---

## Fix 5: Install Missing Dependencies

```bash
npm install react-router-dom nodemailer
```

---

## Quick Fix Script

Run this after other Claude windows are closed:

```bash
chmod +x fix-boyfanz-dev.sh
./fix-boyfanz-dev.sh
```

Then start the dev server:
```bash
npm run dev
```

---

## Test Login

Once server is running on http://localhost:3202:
- Navigate to the login page
- Test with: wyatt@wyattxxxcole.com / Bama@11061990
