# FANZ Platform Rollback Procedures

## Overview

This document outlines the rollback procedures for the BoyFanz platform and its microservices. All production changes MUST have documented rollback steps before deployment.

---

## 1. Code Deployment Rollback

### PM2 Process Rollback

```bash
# List current deployments
pm2 list

# Revert to previous version (PM2 keeps previous snapshot)
pm2 reload boyfanz --update-env

# Full restart with previous code
cd /var/www/boyfanz
git checkout HEAD~1
npm install --production
pm2 restart boyfanz
```

### Git-Based Rollback

```bash
# View recent commits
git log --oneline -10

# Revert to specific commit
git revert <commit-hash>

# Or hard reset (CAUTION: loses uncommitted changes)
git reset --hard <commit-hash>

# Rebuild and restart
npm run build
pm2 restart boyfanz
```

---

## 2. Database Rollback

### Transaction Rollback (FanzTrust Ledger)

The FanzTrust ledger uses double-entry bookkeeping. To reverse a transaction:

```sql
-- Find the original transaction
SELECT * FROM fanz_ledger
WHERE transaction_id = 'txn_XXXX'
AND platform_id = 'boyfanz';

-- Create reversal entry (done automatically by FanzTrustService.recordTransaction)
INSERT INTO fanz_ledger (
  transaction_id,
  wallet_id,
  user_id,
  platform_id,
  entry_type,
  transaction_type,
  amount_cents,
  reference_type,
  reference_id,
  description
) VALUES (
  'txn_reversal_XXXX',
  <original_wallet_id>,
  <original_user_id>,
  'boyfanz',
  CASE WHEN original.entry_type = 'debit' THEN 'credit' ELSE 'debit' END,
  'reversal',
  <original_amount>,
  'reversal',
  'txn_XXXX',
  'Reversal of transaction txn_XXXX'
);
```

### Schema Migration Rollback

```bash
# View migration history
npm run db:status

# Rollback last migration
npm run db:rollback

# Rollback to specific version
npm run db:rollback --to=<version>
```

### Point-in-Time Recovery

```bash
# PostgreSQL PITR (requires WAL archiving)
pg_restore -d fanz_core_restored \
  --target-time="2024-01-15 10:30:00" \
  /backups/fanz_core_backup.dump
```

---

## 3. Microservice Rollback

### Individual Service Rollback

```bash
# Stop problematic service
pm2 stop fanzpay

# Revert code
cd /var/www/fanz-ecosystem-new/fanzpay
git checkout HEAD~1
npm install --production

# Restart with health check
pm2 start fanzpay --wait-ready
```

### Service Mesh Rollback (Multi-Service)

```bash
# Rollback multiple services atomically
for service in fanzpay fanznotify fanzmod; do
  pm2 stop $service
  cd /var/www/fanz-ecosystem-new/$service
  git checkout HEAD~1
  npm install --production
done

# Restart all at once
pm2 restart fanzpay fanznotify fanzmod
```

---

## 4. Nginx/Routing Rollback

### Config Rollback

```bash
# Backup current config
cp /etc/nginx/conf.d/boyfanz.conf /etc/nginx/conf.d/boyfanz.conf.backup

# Restore previous config
cp /etc/nginx/conf.d/boyfanz.conf.previous /etc/nginx/conf.d/boyfanz.conf

# Test and reload
nginx -t && systemctl reload nginx
```

### Emergency Traffic Redirect

```bash
# Redirect all traffic to maintenance page
cat > /etc/nginx/conf.d/boyfanz.conf << 'EOF'
server {
    listen 80;
    server_name boy.fanz.website;
    return 503;
    error_page 503 /maintenance.html;
    location = /maintenance.html {
        root /var/www/maintenance;
        internal;
    }
}
EOF

nginx -t && systemctl reload nginx
```

---

## 5. Payment Rollback (Critical)

### Failed Transaction Recovery

When a payment fails mid-transaction:

1. **Check ledger state:**
```sql
SELECT * FROM fanz_ledger
WHERE reference_id LIKE 'pending_%'
AND platform_id = 'boyfanz'
AND created_at > NOW() - INTERVAL '1 hour';
```

2. **Automatic refund (FanzPayService handles this):**
```typescript
// FanzPayService.processWithdrawal automatically refunds on failure:
// - Payout exception: Creates credit reversal
// - Payout failed: Creates credit reversal
// - Unexpected error: Creates credit reversal
```

3. **Manual intervention (if automatic fails):**
```sql
-- Credit user wallet back
UPDATE fanz_wallets
SET available_balance_cents = available_balance_cents + <amount>,
    total_balance_cents = total_balance_cents + <amount>
WHERE id = '<wallet_id>'
AND user_id = '<user_id>';

-- Record manual reversal
INSERT INTO fanz_ledger (
  transaction_id, wallet_id, user_id, platform_id,
  entry_type, transaction_type, amount_cents,
  description
) VALUES (
  'txn_manual_reversal_' || gen_random_uuid(),
  '<wallet_id>', '<user_id>', 'boyfanz',
  'credit', 'manual_reversal', <amount>,
  'Manual reversal by admin - incident #XXX'
);
```

---

## 6. Redis/Cache Rollback

### Clear Problematic Cache

```bash
# Connect to Redis
redis-cli -h 127.0.0.1 -p 6379

# Clear specific keys
DEL boyfanz:session:*
DEL boyfanz:rate_limit:*

# Clear all platform cache (CAUTION)
KEYS boyfanz:* | xargs redis-cli DEL
```

### Disable Cache Temporarily

```bash
# Set bypass flag in environment
export CACHE_BYPASS=true
pm2 restart boyfanz --update-env
```

---

## 7. Platform Isolation Rollback

If platform isolation is compromised:

### 1. Quarantine Affected Data
```sql
-- Create audit trail
INSERT INTO platform_isolation_incidents (
  platform_id, affected_users, affected_transactions,
  incident_type, detected_at
)
SELECT
  'boyfanz',
  array_agg(DISTINCT user_id),
  array_agg(transaction_id),
  'cross_platform_leak',
  NOW()
FROM fanz_ledger
WHERE platform_id IS NULL
  OR platform_id != 'boyfanz';
```

### 2. Fix Platform Scoping
```sql
-- Correct missing platform_id
UPDATE fanz_ledger
SET platform_id = 'boyfanz'
WHERE platform_id IS NULL
AND wallet_id IN (
  SELECT id FROM fanz_wallets
  WHERE user_id IN (
    SELECT id FROM users WHERE platform_id = 'boyfanz'
  )
);
```

---

## 8. Emergency Contacts

| Role | Contact | Escalation |
|------|---------|------------|
| Platform Lead | Wyatt Cole | Primary |
| DevOps | On-call rotation | Secondary |
| Database Admin | DBA team | Data issues |
| Security | Security team | Breach/leak |

---

## 9. Rollback Checklist

Before any rollback:

- [ ] Identify root cause
- [ ] Document current state
- [ ] Notify stakeholders
- [ ] Create backup of current state
- [ ] Test rollback in staging (if time permits)
- [ ] Execute rollback
- [ ] Verify system health
- [ ] Document incident
- [ ] Post-mortem scheduled

---

## 10. Monitoring Post-Rollback

```bash
# Check service health
pm2 status

# Watch logs
pm2 logs boyfanz --lines 100

# Check database connections
psql -h localhost -U postgres -c "SELECT count(*) FROM pg_stat_activity WHERE datname='fanz_core';"

# Verify payment processing
curl -s http://localhost:3001/api/health | jq .
```

---

*Last Updated: 2024-12-25*
*Platform: BoyFanz (boyfanz)*
*Version: 1.0*
