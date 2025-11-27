# 🚀 BoyFanz - Supabase + cPanel Deployment Guide

## ✅ YOU'RE RIGHT - Using Existing Supabase Database!

Your database is already set up on Supabase and ready to use. No need to create a local PostgreSQL database!

**Supabase Project**: `ysjondxpwvfjofbneqki`
**Database URL**: `db.ysjondxpwvfjofbneqki.supabase.co`

---

## 📋 DEPLOYMENT STEPS (Updated for Supabase)

### STEP 1: Get Supabase Credentials

1. **Login to Supabase**
   - Visit: https://supabase.com/dashboard/project/ysjondxpwvfjofbneqki
   - Login with your Supabase account

2. **Get Database Password**
   - Go to: **Settings** → **Database**
   - Scroll to **Connection string**
   - Copy the **URI** format connection string
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.ysjondxpwvfjofbneqki.supabase.co:5432/postgres`
   - Save the password part!

3. **Get API Keys**
   - Go to: **Settings** → **API**
   - Copy **Project URL**: `https://ysjondxpwvfjofbneqki.supabase.co`
   - Copy **anon/public key** (long string starting with `eyJ...`)
   - Copy **service_role key** (another long string starting with `eyJ...`)
   - **IMPORTANT**: Keep the service_role key secret!

---

### STEP 2: Extract Package on Server

1. **Login to cPanel**
   - URL: https://67.217.54.66:2083
   - Username: `boyzapp`
   - Password: `Bama@11061990`

2. **Open File Manager**
   - Click **Files** → **File Manager**
   - Navigate to `/home/boyzapp/`
   - You should see: `boyfanz-deploy-20251116-194255.tar.gz` (already uploaded!)

3. **Extract Package**
   - Right-click on the tar.gz file
   - Select **Extract**
   - Extract to: `/home/boyzapp/boyfanz-deploy`
   - Click **Extract Files**
   - Wait for completion

---

### STEP 3: Configure Environment Variables (Supabase)

1. **Create .env File**
   - File Manager → Navigate to `/home/boyzapp/boyfanz-deploy/`
   - Find `.env.production` file
   - Right-click → **Copy**
   - Name the copy: `.env`

2. **Edit .env File**
   - Right-click `.env` → **Edit**
   - Update with your Supabase credentials:

```env
NODE_ENV=production
PORT=3000

# Database Configuration - Supabase PostgreSQL
# Supabase Project: ysjondxpwvfjofbneqki
DATABASE_URL=postgresql://postgres:YOUR_SUPABASE_PASSWORD@db.ysjondxpwvfjofbneqki.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:YOUR_SUPABASE_PASSWORD@db.ysjondxpwvfjofbneqki.supabase.co:5432/postgres

# Supabase Configuration
SUPABASE_URL=https://ysjondxpwvfjofbneqki.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# PostgreSQL Connection Details (Supabase)
PGHOST=db.ysjondxpwvfjofbneqki.supabase.co
PGPORT=5432
PGDATABASE=postgres
PGUSER=postgres
PGPASSWORD=YOUR_SUPABASE_PASSWORD

# Application URLs
WEB_APP_URL=https://boyzapp.com
API_URL=https://boyzapp.com/api
DOMAIN=boyzapp.com

# Security Secrets - MUST GENERATE THESE!
JWT_ISS=boyzapp.com
JWT_AUD=boyzapp.clients
JWT_ACCESS_TTL=900
JWT_REFRESH_TTL=2592000
JWT_SECRET=GENERATE_RANDOM_64_CHAR_STRING
SESSION_SECRET=GENERATE_RANDOM_64_CHAR_STRING

# Email Configuration
OTP_EMAIL_FROM=noreply@boyzapp.com
```

3. **Generate Secrets**
   - Visit: https://randomkeygen.com/
   - Copy two **CodeIgniter Encryption Keys** (256-bit)
   - Paste one for `JWT_SECRET`
   - Paste another for `SESSION_SECRET`

4. **Save the File**

---

### STEP 4: Verify Supabase Database is Ready

Your database should already have 500+ tables deployed. Let's verify:

1. **Open Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/ysjondxpwvfjofbneqki

2. **Check Table Editor**
   - Click **Table Editor** in left sidebar
   - You should see tables like:
     - `users`
     - `posts`
     - `subscriptions`
     - `conversations`
     - `live_streams`
     - Many more...

3. **If Tables Don't Exist** (unlikely)
   - Go to **SQL Editor**
   - Click **New Query**
   - Navigate to `/home/boyzapp/boyfanz-deploy/database/`
   - Open `complete-schema.sql`
   - Copy all contents
   - Paste in SQL Editor
   - Click **Run**

---

### STEP 5: Setup Node.js Application in cPanel

1. **Open Setup Node.js App**
   - In cPanel → **Software** → **Setup Node.js App**

2. **Create Application**
   - Click **Create Application**

3. **Configure Application**
   ```
   Node.js version:        18.20.4 (or latest 18.x)
   Application mode:       Production
   Application root:       /home/boyzapp/boyfanz-deploy
   Application URL:        boyzapp.com
   Application startup:    dist/index.js
   ```

4. **Add Environment Variables**
   Click **Add Variable** for each:
   ```
   NODE_ENV = production
   DATABASE_URL = postgresql://postgres:YOUR_PASSWORD@db.ysjondxpwvfjofbneqki.supabase.co:5432/postgres
   SUPABASE_URL = https://ysjondxpwvfjofbneqki.supabase.co
   SUPABASE_ANON_KEY = your_anon_key
   JWT_SECRET = your_generated_secret
   SESSION_SECRET = your_generated_secret
   WEB_APP_URL = https://boyzapp.com
   DOMAIN = boyzapp.com
   ```

5. **Create & Install**
   - Click **Create**
   - Click **Run NPM Install**
   - Wait 2-5 minutes for dependencies

---

### STEP 6: Start Application

1. **Start the App**
   - In Node.js App interface
   - Find `boyzapp.com` application
   - Click **Start** or **Restart**
   - Wait for status: "Running"

---

### STEP 7: Setup SSL Certificate

1. **Install SSL**
   - cPanel → **Security** → **SSL/TLS**
   - Click **Manage SSL Sites**
   - Select `boyzapp.com`
   - Click **Install AutoSSL Certificate** (Free)

2. **Force HTTPS**
   - cPanel → **Domains** → **Domains**
   - Find `boyzapp.com`
   - Toggle **Force HTTPS Redirect** ON

---

### STEP 8: Verify Deployment

1. **Test Website**
   - Visit: `https://boyzapp.com`
   - Should see BoyFanz homepage

2. **Test API**
   - Visit: `https://boyzapp.com/api/health`
   - Should return: `{"status":"ok","database":"connected"}`

3. **Test Database Connection**
   - The health endpoint will verify Supabase connection
   - Check Node.js app logs for any connection errors

---

## 🎯 KEY DIFFERENCES FROM LOCAL DATABASE

### ✅ ADVANTAGES of Supabase

1. **Already Deployed** - 500+ tables ready to use
2. **Managed Service** - No database maintenance needed
3. **Auto Backups** - Supabase handles backups automatically
4. **Scalable** - Handles traffic growth automatically
5. **Real-time** - Built-in real-time subscriptions
6. **Auth Integration** - Supabase Auth available if needed

### ⚠️ IMPORTANT NOTES

1. **No Local Database Needed** - Skip all PostgreSQL creation steps in cPanel
2. **Use Supabase Credentials** - Not local database credentials
3. **Connection Pooling** - Supabase handles this automatically
4. **Monitor in Supabase Dashboard** - Use Supabase for database monitoring

---

## 📊 DEPLOYMENT CHECKLIST (Supabase Version)

- [x] Package uploaded to server (DONE)
- [ ] Package extracted via File Manager
- [x] Supabase database exists (ALREADY DONE)
- [ ] Supabase credentials obtained
- [ ] .env file created with Supabase configuration
- [ ] Security secrets generated
- [ ] Node.js application created in cPanel
- [ ] Environment variables configured
- [ ] Dependencies installed (npm install)
- [ ] Application started
- [ ] SSL certificate installed
- [ ] HTTPS redirect enabled
- [ ] Website accessible at https://boyzapp.com
- [ ] API responding with Supabase connection
- [ ] Default admin password changed

---

## 🔍 TROUBLESHOOTING

### Can't Connect to Supabase

**Check:**
1. Supabase password is correct
2. Project ref is correct: `ysjondxpwvfjofbneqki`
3. Database URL format is exactly: `postgresql://postgres:PASSWORD@db.ysjondxpwvfjofbneqki.supabase.co:5432/postgres`
4. No firewall blocking outbound PostgreSQL connections (port 5432)

### SSL Certificate Errors

If Supabase connection fails with SSL error:

Add to DATABASE_URL:
```
DATABASE_URL=postgresql://postgres:PASSWORD@db.ysjondxpwvfjofbneqki.supabase.co:5432/postgres?sslmode=require
```

### Connection Pooling

For production, consider using Supabase connection pooler:

```
DATABASE_URL=postgresql://postgres:PASSWORD@db.ysjondxpwvfjofbneqki.supabase.co:6543/postgres?pgbouncer=true
```
(Note port 6543 instead of 5432)

---

## 🎉 ADVANTAGES OF THIS SETUP

### Supabase Benefits

✅ **Professional Database** - Enterprise PostgreSQL
✅ **Automatic Backups** - Point-in-time recovery
✅ **Monitoring Dashboard** - Real-time metrics
✅ **Scalability** - Grow without limits
✅ **Security** - Row Level Security (RLS) available
✅ **Real-time** - WebSocket subscriptions built-in

### cPanel Benefits

✅ **Easy Deployment** - Web interface for Node.js
✅ **Domain Management** - Built-in DNS and SSL
✅ **File Management** - Easy file uploads and edits
✅ **Logs Access** - View application logs easily

---

## 📞 SUPPORT RESOURCES

**Supabase Dashboard**: https://supabase.com/dashboard/project/ysjondxpwvfjofbneqki
**cPanel**: https://67.217.54.66:2083
**Supabase Docs**: https://supabase.com/docs
**Contact**: Josh@fanzunlimited.com

---

## 🚀 QUICK SUMMARY

1. **Extract package** in cPanel File Manager
2. **Get Supabase credentials** from dashboard
3. **Create .env** with Supabase connection
4. **Setup Node.js app** in cPanel
5. **Start application**
6. **Install SSL**
7. **Test at** https://boyzapp.com

**Estimated Time:** 20 minutes
**Database Setup:** ALREADY DONE ✅

---

**Generated:** 2025-11-16
**Status:** ✅ READY - Using Supabase Database
**No Local Database Required**
