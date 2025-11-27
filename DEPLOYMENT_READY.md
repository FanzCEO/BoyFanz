# 🚀 BoyFanz v1 - DEPLOYMENT READY!

## ✅ PACKAGE CREATED SUCCESSFULLY

**Package File**: `boyfanz-deploy-20251116-194255.tar.gz`
**Package Size**: 6.6 MB
**Location**: `/Users/joshuastone/FANZ-Unified-Ecosystem/boyfanz/`

---

## 📦 WHAT'S INCLUDED

The deployment package contains:
- ✅ Production-built application (dist/)
- ✅ All dependencies (node_modules/)
- ✅ Database initialization script
- ✅ Environment configuration template
- ✅ Automated setup scripts (start.sh, stop.sh, setup-database.sh)
- ✅ Complete documentation
- ✅ Installation instructions

---

## 🎯 DEPLOY NOW - 3 METHODS

### METHOD 1: Upload via cPanel File Manager (Easiest)

1. **Login to cPanel**
   - URL: https://67.217.54.66:2083
   - Username: `boyzapp`
   - Password: `Bama@11061990`

2. **Upload Package**
   - Go to: **Files → File Manager**
   - Navigate to: `/home/boyzapp/`
   - Click **Upload**
   - Select: `boyfanz-deploy-20251116-194255.tar.gz`
   - Wait for upload to complete

3. **Extract Package**
   - Right-click the uploaded file
   - Select **Extract**
   - Confirm extraction

4. **Continue to Setup** (see below)

---

### METHOD 2: Upload via SCP (Command Line)

You'll need to enter the password manually when prompted: `Bama@11061990`

```bash
cd /Users/joshuastone/FANZ-Unified-Ecosystem/boyfanz

scp boyfanz-deploy-20251116-194255.tar.gz boyzapp@67.217.54.66:/home/boyzapp/
# Enter password when prompted: Bama@11061990
```

Then SSH in and extract:
```bash
ssh boyzapp@67.217.54.66
# Enter password: Bama@11061990

cd /home/boyzapp
tar -xzf boyfanz-deploy-20251116-194255.tar.gz
cd boyfanz-deploy
```

---

### METHOD 3: Upload via FTP Client (FileZilla, etc.)

1. **FTP Settings**
   - Host: `67.217.54.66`
   - Username: `boyzapp`
   - Password: `Bama@11061990`
   - Port: `21` (FTP) or `22` (SFTP)

2. **Upload & Extract**
   - Upload `boyfanz-deploy-20251116-194255.tar.gz` to `/home/boyzapp/`
   - Use cPanel File Manager to extract

---

## ⚡ SETUP STEPS (After Upload)

### Step 1: Create Database in cPanel

1. Login to cPanel → **Databases → PostgreSQL Databases**
2. **Create Database**: `boyzapp_db`
3. **Create User**: `boyzapp_user`
4. **Set Password**: (Choose a strong password)
5. **Add User to Database** with ALL PRIVILEGES

### Step 2: SSH into Server

```bash
ssh boyzapp@67.217.54.66
# Password: Bama@11061990

cd /home/boyzapp/boyfanz-deploy
```

### Step 3: Initialize Database

```bash
# Run the initialization script
psql -U boyzapp_user -d boyzapp_db -f database/init-cpanel-database.sql
# Enter your database user password when prompted
```

This creates:
- 15 core tables (users, posts, subscriptions, messages, etc.)
- Indexes for performance
- Views for common queries
- Default admin account

### Step 4: Configure Environment

```bash
# Copy template
cp .env.example .env

# Edit configuration
nano .env
```

**Required Changes in .env:**

```bash
# Generate secrets (run these commands)
openssl rand -hex 32  # Copy output for JWT_SECRET
openssl rand -hex 32  # Copy output for SESSION_SECRET

# Update these in .env:
DATABASE_URL=postgresql://boyzapp_user:YOUR_DB_PASSWORD@localhost:5432/boyzapp_db
PGUSER=boyzapp_user
PGPASSWORD=YOUR_DB_PASSWORD
PGDATABASE=boyzapp_db

JWT_SECRET=paste_generated_secret_here
SESSION_SECRET=paste_generated_secret_here

WEB_APP_URL=https://boyzapp.com
API_URL=https://boyzapp.com/api
DOMAIN=boyzapp.com
```

Save and exit (Ctrl+X, Y, Enter)

### Step 5: Install Dependencies

```bash
npm install --production
# or if pnpm is available:
pnpm install --production
```

### Step 6: Start Application

**Option A - Using cPanel Node.js App (Recommended):**

1. Go to cPanel → **Software → Setup Node.js App**
2. Click **Create Application**
3. Configure:
   - **Node.js Version**: 18.x or higher
   - **Application Mode**: Production
   - **Application Root**: `/home/boyzapp/boyfanz-deploy`
   - **Application URL**: `boyzapp.com`
   - **Application Startup File**: `dist/index.js`
   - **Environment Variables**: Click "Add Variable" and add from your .env file
4. Click **Create** then **Start**

**Option B - Using PM2:**

```bash
npm install -g pm2
pm2 start dist/index.js --name boyfanz --env production
pm2 save
pm2 startup
```

**Option C - Using Startup Script:**

```bash
./start.sh
```

### Step 7: Setup SSL Certificate

1. Go to cPanel → **Security → SSL/TLS**
2. Click **Manage SSL Sites**
3. Select domain: `boyzapp.com`
4. Click **Install AutoSSL Certificate** (Let's Encrypt - Free)
5. Enable **Force HTTPS Redirect**

### Step 8: Verify Deployment

```bash
# Test locally
curl http://localhost:3000

# Test domain
curl https://boyzapp.com

# Test API
curl https://boyzapp.com/api/health
```

Expected response:
```json
{"status":"ok","database":"connected"}
```

---

## 🔒 SECURITY TASKS (CRITICAL)

### 1. Change Default Admin Password

**Default Login:**
- Email: `Josh@fanzunlimited.com`
- Password: `admin123`

**⚠️ CHANGE THIS IMMEDIATELY:**
1. Visit: https://boyzapp.com
2. Login with default credentials
3. Go to Settings → Change Password
4. Set a strong new password

### 2. Verify Environment Secrets

```bash
# Make sure these are set to unique values:
cat .env | grep -E "JWT_SECRET|SESSION_SECRET"
```

Both should be 64-character random strings (not "CHANGE_THIS...")

---

## 📊 POST-DEPLOYMENT CHECKLIST

- [ ] Database created and initialized
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Application started successfully
- [ ] SSL certificate installed
- [ ] HTTPS redirect enabled
- [ ] Default admin password changed
- [ ] Application accessible at https://boyzapp.com
- [ ] API endpoint responding
- [ ] User registration tested
- [ ] Login/logout tested

---

## 🛠️ OPTIONAL CONFIGURATIONS

### Email Service

1. Create email in cPanel: `noreply@boyzapp.com`
2. Add to .env:
```env
SMTP_HOST=mail.boyzapp.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@boyzapp.com
SMTP_PASSWORD=your_email_password
```

### Cron Jobs

Go to cPanel → **Advanced → Cron Jobs**

**Daily Database Backup (3 AM):**
```
0 3 * * * cd /home/boyzapp/boyfanz-deploy && pg_dump -U boyzapp_user boyzapp_db | gzip > ~/backups/db_$(date +\%Y\%m\%d).sql.gz
```

**Daily Cleanup (2 AM):**
```
0 2 * * * cd /home/boyzapp/boyfanz-deploy && node dist/scripts/cleanup.js
```

### File Upload Limits

Go to cPanel → **Software → Select PHP Version → Options**
- `upload_max_filesize`: 100M
- `post_max_size`: 100M
- `max_execution_time`: 300

---

## 🐛 TROUBLESHOOTING

### Application Won't Start

```bash
# Check Node.js version
node --version  # Should be 18+

# Check logs
pm2 logs boyfanz
# or
tail -f ~/logs/nodejs.log

# Check environment
cat .env | grep DATABASE_URL
```

### Database Connection Errors

```bash
# Test database connection
psql -U boyzapp_user -d boyzapp_db -h localhost

# Check credentials match in .env
```

### Permission Errors

```bash
# Fix ownership
chown -R boyzapp:boyzapp /home/boyzapp/boyfanz-deploy

# Fix permissions
chmod -R 755 /home/boyzapp/boyfanz-deploy
chmod 644 /home/boyzapp/boyfanz-deploy/.env
```

### Port Conflicts

```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Restart application
pm2 restart boyfanz
```

---

## 📚 DOCUMENTATION

All documentation is included in the package:

- **INSTALL.txt** - Quick installation steps
- **CPANEL_DEPLOYMENT_GUIDE.md** - Complete 20-page guide
- **CPANEL_DEPLOYMENT_SUMMARY.md** - Quick reference checklist
- **QUICK_DEPLOY.txt** - One-page reference card
- **database/README.md** - Database schema documentation

---

## 🎉 YOU'RE READY!

Your BoyFanz v1 application is **100% ready for deployment** to boyzapp.com!

**Package Location:**
`/Users/joshuastone/FANZ-Unified-Ecosystem/boyfanz/boyfanz-deploy-20251116-194255.tar.gz`

**Next Action:**
Choose one of the 3 upload methods above and get started!

**Estimated Deployment Time:** 20-30 minutes

---

## 📞 SUPPORT

**Contact:** Josh@fanzunlimited.com
**Server IP:** 67.217.54.66
**cPanel:** https://67.217.54.66:2083

---

**Generated:** 2025-11-16
**Status:** ✅ READY FOR PRODUCTION DEPLOYMENT
**Package:** boyfanz-deploy-20251116-194255.tar.gz (6.6 MB)
