# 🔄 Supabase to cPanel PostgreSQL Migration Guide

## Overview

This guide will help you migrate your BoyFanz database from Supabase to a local PostgreSQL database on your cPanel server.

---

## ✅ WHAT YOU HAVE

- **Supabase Database**: `ysjondxpwvfjofbneqki` (500+ tables)
- **Complete Schema File**: `complete-schema.sql` (3,477 lines)
- **cPanel Server**: Ready to host PostgreSQL

---

## 📋 MIGRATION STEPS

### STEP 1: Create PostgreSQL Database in cPanel

1. **Login to cPanel**
   - URL: https://67.217.54.66:2083
   - Username: `boyzapp`
   - Password: `Bama@11061990`

2. **Create Database**
   - Go to **Databases** → **PostgreSQL Databases**
   - **Create New Database**: `boyzapp_db`
   - Note the full name (might be `boyzapp_boyzapp_db`)

3. **Create Database User**
   - Scroll to **PostgreSQL Users**
   - **Username**: `boyzapp_user`
   - **Password**: Generate strong password (save it!)
   - Click **Create User**

4. **Add User to Database**
   - Scroll to **Add User To Database**
   - **User**: `boyzapp_user`
   - **Database**: `boyzapp_db`
   - Click **Add**
   - Grant **ALL PRIVILEGES**
   - Click **Make Changes**

---

### STEP 2: Export Data from Supabase (Optional - If You Have Data)

#### Option A: Export via Supabase Dashboard

1. **Login to Supabase**
   - Visit: https://supabase.com/dashboard/project/ysjondxpwvfjofbneqki

2. **Export Database**
   - Go to **Database** → **Backups**
   - Click **Download Backup**
   - Save the `.sql` file

#### Option B: Export via pg_dump (Command Line)

```bash
# Get your Supabase connection details
# Dashboard → Settings → Database

# Export schema and data
pg_dump "postgresql://postgres:YOUR_SUPABASE_PASSWORD@db.ysjondxpwvfjofbneqki.supabase.co:5432/postgres" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  > supabase_export.sql
```

#### Option C: Export Specific Tables Only

```bash
# Export specific tables with data
pg_dump "postgresql://postgres:YOUR_SUPABASE_PASSWORD@db.ysjondxpwvfjofbneqki.supabase.co:5432/postgres" \
  --table=users \
  --table=posts \
  --table=subscriptions \
  --data-only \
  > supabase_data.sql
```

---

### STEP 3: Import Schema to cPanel PostgreSQL

Since SSH is disabled, we'll use phpPgAdmin:

#### Method 1: Via phpPgAdmin (Recommended)

1. **Open phpPgAdmin**
   - cPanel → **Databases** → **phpPgAdmin**
   - Login with PostgreSQL credentials
   - Select `boyzapp_db`

2. **Import Complete Schema**
   - Click **SQL** tab
   - You have two options:

   **Option A - Use init-cpanel-database.sql (Simpler, 15 core tables)**
   - File location: `/home/boyzapp/boyfanz-deploy/database/init-cpanel-database.sql`
   - Open in File Manager → Edit
   - Copy all SQL
   - Paste in SQL tab
   - Click **Execute**

   **Option B - Use complete-schema.sql (Full 500+ tables)**
   - File location: `/home/boyzapp/boyfanz-deploy/database/complete-schema.sql`
   - Open in File Manager → Edit
   - Copy all SQL (3,477 lines)
   - Paste in SQL tab
   - Click **Execute**
   - Note: This may take 5-10 minutes

#### Method 2: Via File Manager SQL Upload

1. **Upload SQL File**
   - File Manager → `/home/boyzapp/boyfanz-deploy/database/`
   - Download `complete-schema.sql` to your local computer

2. **Import via phpPgAdmin**
   - phpPgAdmin → **Import** tab (if available)
   - Upload the SQL file
   - Execute

---

### STEP 4: Import Data from Supabase (If You Exported It)

1. **Open phpPgAdmin**
   - Select `boyzapp_db`
   - Click **SQL** tab

2. **Import Data**
   - If you have `supabase_export.sql` or `supabase_data.sql`
   - Copy the contents
   - Paste in SQL tab
   - Click **Execute**

---

### STEP 5: Update Environment Configuration

1. **Edit .env File**
   - File Manager → `/home/boyzapp/boyfanz-deploy/`
   - Edit `.env` file (or create from `.env.production`)

2. **Update Database Configuration**

```env
NODE_ENV=production
PORT=3000

# Database Configuration - Local PostgreSQL
DATABASE_URL=postgresql://boyzapp_user:YOUR_DB_PASSWORD@localhost:5432/boyzapp_db

# PostgreSQL Connection Details
PGHOST=localhost
PGPORT=5432
PGDATABASE=boyzapp_db
PGUSER=boyzapp_user
PGPASSWORD=YOUR_DB_PASSWORD

# Application URLs
WEB_APP_URL=https://boyzapp.com
API_URL=https://boyzapp.com/api
DOMAIN=boyzapp.com

# Security Secrets
JWT_ISS=boyzapp.com
JWT_AUD=boyzapp.clients
JWT_ACCESS_TTL=900
JWT_REFRESH_TTL=2592000
JWT_SECRET=YOUR_GENERATED_SECRET
SESSION_SECRET=YOUR_GENERATED_SECRET

# Email
OTP_EMAIL_FROM=noreply@boyzapp.com
```

3. **Remove Supabase Variables**
   - Remove or comment out:
   ```env
   # SUPABASE_URL=
   # SUPABASE_ANON_KEY=
   # SUPABASE_SERVICE_ROLE_KEY=
   ```

---

### STEP 6: Restart Application

1. **Update Node.js App Environment**
   - cPanel → **Software** → **Setup Node.js App**
   - Click on your application
   - Update environment variables:
   ```
   DATABASE_URL = postgresql://boyzapp_user:YOUR_PASSWORD@localhost:5432/boyzapp_db
   NODE_ENV = production
   ```

2. **Restart Application**
   - Click **Restart** button
   - Wait for status: "Running"

---

### STEP 7: Verify Migration

1. **Test Database Connection**
   - Visit: `https://boyzapp.com/api/health`
   - Should return: `{"status":"ok","database":"connected"}`

2. **Check Logs**
   - Node.js App → View Logs
   - Look for successful database connection
   - No Supabase connection errors

3. **Test Functionality**
   - Visit: `https://boyzapp.com`
   - Try user registration
   - Try login
   - Verify data is accessible

---

## 🔍 VERIFICATION CHECKLIST

After migration:

- [ ] PostgreSQL database created in cPanel
- [ ] Database user created with privileges
- [ ] Schema imported successfully
- [ ] Data imported (if applicable)
- [ ] .env updated with local database connection
- [ ] Node.js app environment variables updated
- [ ] Application restarted
- [ ] Health check passes
- [ ] Website loads correctly
- [ ] Database queries work
- [ ] No Supabase connection attempts in logs

---

## 📊 SCHEMA OPTIONS

### Option 1: Simple Schema (Recommended for Start)

**File**: `init-cpanel-database.sql`
- **Tables**: 15 core tables
- **Size**: Smaller, faster import
- **Best for**: Getting started quickly
- **Includes**: users, posts, subscriptions, messages, transactions

### Option 2: Complete Schema

**File**: `complete-schema.sql`
- **Tables**: 500+ tables
- **Size**: 3,477 lines
- **Best for**: Full feature set
- **Includes**: Everything (analytics, AI, live streaming, etc.)

**Recommendation**: Start with `init-cpanel-database.sql`, then add more tables as needed.

---

## ⚡ ADVANTAGES OF LOCAL PostgreSQL

### ✅ Benefits

1. **Full Control** - Complete database access
2. **No External Dependency** - Everything on one server
3. **Lower Latency** - Database on same machine
4. **Cost Effective** - No Supabase subscription needed
5. **Simpler Architecture** - One server for everything

### ⚠️ Considerations

1. **Backups** - You need to set up your own backups
2. **Scaling** - Limited by server resources
3. **Maintenance** - You handle database maintenance
4. **No Real-time** - Lose Supabase real-time features

---

## 🔄 ROLLBACK PLAN

If migration fails, you can easily roll back:

1. **Keep Supabase Active** - Don't delete Supabase database
2. **Change .env** - Switch back to Supabase connection
3. **Restart App** - Application connects to Supabase again

---

## 📦 BACKUP STRATEGY

After migration, set up automated backups:

### Daily Backup Cron Job

1. **cPanel → Advanced → Cron Jobs**
2. **Add Daily Backup** (3 AM):

```bash
0 3 * * * pg_dump -U boyzapp_user boyzapp_db | gzip > /home/boyzapp/backups/db_$(date +\%Y\%m\%d).sql.gz
```

3. **Create Backups Directory**:
   - File Manager → Create folder: `/home/boyzapp/backups/`

### Manual Backup

Via phpPgAdmin:
1. Select database
2. **Export** tab
3. Choose format: **SQL**
4. Download file

---

## 🚀 QUICK MIGRATION SUMMARY

1. **Create** PostgreSQL database in cPanel
2. **Import** schema via phpPgAdmin (use `init-cpanel-database.sql`)
3. **Update** `.env` with local database connection
4. **Restart** Node.js application
5. **Test** at https://boyzapp.com

**Estimated Time**: 15-20 minutes

---

## 🆘 TROUBLESHOOTING

### Import Fails in phpPgAdmin

**Solution**: Break up the SQL file into smaller chunks
- Import tables in groups of 10-20
- Or use the simpler `init-cpanel-database.sql`

### Connection Errors

**Check**:
1. Database name matches (might have prefix like `boyzapp_boyzapp_db`)
2. User has ALL PRIVILEGES
3. Password is correct in .env
4. Port is 5432
5. Host is `localhost`

### Data Not Showing

**If you need to migrate data**:
1. Export from Supabase with `pg_dump`
2. Import data separately after schema
3. Or manually export/import specific tables

---

## 📞 SUPPORT

**cPanel**: https://67.217.54.66:2083
**Contact**: Josh@fanzunlimited.com

**Files Location**: `/home/boyzapp/boyfanz-deploy/database/`
- `init-cpanel-database.sql` - Simple schema (15 tables)
- `complete-schema.sql` - Full schema (500+ tables)

---

**Generated**: 2025-11-16
**Migration**: Supabase → cPanel PostgreSQL
**Status**: ✅ Ready to Migrate
