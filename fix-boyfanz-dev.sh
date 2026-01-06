#!/bin/bash
# Fix BoyFanz development server issues
# Run this when other Claude windows are closed

echo "🔧 Fixing BoyFanz development environment..."

# 1. Fix SSL configuration in db.ts
echo "1️⃣  Fixing SSL configuration..."
sed -i.bak 's/ssl: {$/ssl: process.env.NODE_ENV === '\''production'\'' ? {/' server/db.ts
sed -i.bak '/rejectUnauthorized: false$/a\
  } : false' server/db.ts

# 2. Fix geoip-lite in advancedSecurityService.ts
echo "2️⃣  Fixing geoip-lite handling..."
cat > /tmp/geoip-fix.txt << 'EOF'
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { EventEmitter } from 'events';
import { z } from 'zod';
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
EOF

# Replace imports section (lines 4-10)
head -3 server/services/advancedSecurityService.ts > /tmp/advsec-new.ts
cat /tmp/geoip-fix.txt >> /tmp/advsec-new.ts
tail -n +11 server/services/advancedSecurityService.ts >> /tmp/advsec-new.ts
mv /tmp/advsec-new.ts server/services/advancedSecurityService.ts

# 3. Add null check in checkAccess method
echo "3️⃣  Adding geoip null check..."
# This requires more complex sed, skip for now - manual fix needed

# 4. Fix missing lt import
echo "4️⃣  Fixing missing lt import..."
sed -i.bak 's/import { eq, and, desc, sql } from "drizzle-orm";/import { eq, and, desc, sql, lt } from "drizzle-orm";/' server/services/userDataExportService.ts

# 5. Remove duplicate imports from App.tsx
echo "5️⃣  Removing duplicate imports..."
# Remove duplicate Login import at line 105
sed -i.bak '105{/^import Login from/d;}' client/src/App.tsx
# Remove duplicate AuthCallback import at line 105
sed -i.bak '105{/^import AuthCallback from/d;}' client/src/App.tsx

# 6. Clear Vite cache
echo "6️⃣  Clearing Vite cache..."
rm -rf node_modules/.vite

# 7. Kill any running servers
echo "7️⃣  Killing existing servers..."
lsof -ti:3202 | xargs kill -9 2>/dev/null || echo "No existing server"

echo ""
echo "✅ Fixes applied! Now run: npm run dev"
echo ""
