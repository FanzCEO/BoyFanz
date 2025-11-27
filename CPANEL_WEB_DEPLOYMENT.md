# 🚀 BoyFanz - cPanel Web Interface Deployment

## ⚠️ IMPORTANT: Shell Access is Disabled

SSH access is not enabled on this account. All deployment must be done through cPanel web interface.

---

## ✅ PACKAGE UPLOADED SUCCESSFULLY

**File uploaded to:** `/home/boyzapp/boyfanz-deploy-20251116-194255.tar.gz`

---

## 📋 DEPLOYMENT STEPS (cPanel Only)

### STEP 1: Extract Package via File Manager

1. **Login to cPanel**
   - URL: https://67.217.54.66:2083
   - Username: `boyzapp`
   - Password: `Bama@11061990`

2. **Open File Manager**
   - Click **Files** → **File Manager**
   - Navigate to `/home/boyzapp/`
   - You should see: `boyfanz-deploy-20251116-194255.tar.gz`

3. **Extract Package**
   - Right-click on `boyfanz-deploy-20251116-194255.tar.gz`
   - Select **Extract**
   - Extract to: `/home/boyzapp/boyfanz-deploy`
   - Click **Extract Files**
   - Wait for completion (should show success message)

4. **Verify Extraction**
   - Navigate to `/home/boyzapp/boyfanz-deploy/`
   - You should see folders: `dist/`, `database/`, `shared/`, etc.

---

### STEP 2: Create PostgreSQL Database

1. **Go to Databases**
   - In cPanel, find **Databases** section
   - Click **PostgreSQL Databases**

2. **Create New Database**
   - Database Name: `boyzapp_db`
   - Click **Create Database**
   - Note the full database name (might be `boyzapp_boyzapp_db`)

3. **Create Database User**
   - Scroll to **PostgreSQL Users**
   - Username: `boyzapp_user`
   - Password: Generate a strong password (click generator)
   - **SAVE THIS PASSWORD** - you'll need it!
   - Click **Create User**

4. **Add User to Database**
   - Scroll to **Add User To Database**
   - User: `boyzapp_user`
   - Database: `boyzapp_db`
   - Click **Add**
   - On privileges page: Check **ALL PRIVILEGES**
   - Click **Make Changes**

---

### STEP 3: Initialize Database Schema

Since SSH is disabled, we'll use cPanel's phpPgAdmin:

1. **Open phpPgAdmin**
   - In cPanel → **Databases** → **phpPgAdmin**
   - Login with your PostgreSQL credentials
   - Select `boyzapp_db` database

2. **Import Schema**
   - Click **SQL** tab at the top
   - You'll need to copy/paste the SQL from the init script

   **Option A - Manual SQL Entry:**
   - Go back to **File Manager**
   - Navigate to `/home/boyzapp/boyfanz-deploy/database/`
   - Open `init-cpanel-database.sql`
   - Click **Edit**
   - Copy ALL the SQL content
   - Paste into phpPgAdmin SQL tab
   - Click **Execute**

   **Option B - Upload via File Manager:**
   - In phpPgAdmin, look for **Import** option
   - Upload the `init-cpanel-database.sql` file
   - Execute the import

---

### STEP 4: Configure Environment Variables

1. **Open File Manager**
   - Navigate to `/home/boyzapp/boyfanz-deploy/`
   - Find `.env.example` file
   - Right-click → **Copy**
   - Name the copy: `.env`

2. **Edit .env File**
   - Right-click `.env` → **Edit**
   - Update the following values:

```env
# Database Configuration
DATABASE_URL=postgresql://boyzapp_user:YOUR_DB_PASSWORD@localhost:5432/boyzapp_db
PGHOST=localhost
PGPORT=5432
PGDATABASE=boyzapp_db
PGUSER=boyzapp_user
PGPASSWORD=YOUR_DB_PASSWORD_HERE

# Application URLs
WEB_APP_URL=https://boyzapp.com
API_URL=https://boyzapp.com/api
DOMAIN=boyzapp.com

# Security Secrets (MUST CHANGE THESE!)
JWT_SECRET=GENERATE_64_CHAR_RANDOM_STRING_HERE
SESSION_SECRET=GENERATE_64_CHAR_RANDOM_STRING_HERE

# Environment
NODE_ENV=production
PORT=3000
```

3. **Generate Secrets**

   Use an online random string generator or create them manually:
   - Visit: https://www.random.org/strings/ or https://randomkeygen.com/
   - Generate two 64-character random strings
   - Paste one for `JWT_SECRET`
   - Paste another for `SESSION_SECRET`

4. **Save the File**
   - Click **Save Changes**

---

### STEP 5: Setup Node.js Application

1. **Open Setup Node.js App**
   - In cPanel, find **Software** section
   - Click **Setup Node.js App**

2. **Create Application**
   - Click **Create Application** button

3. **Configure Application**
   Fill in the following settings:

   - **Node.js version:** 18.20.4 (or latest 18.x available)
   - **Application mode:** Production
   - **Application root:** `/home/boyzapp/boyfanz-deploy`
   - **Application URL:** `boyzapp.com`
   - **Application startup file:** `dist/index.js`
   - **Passenger log file:** Leave default or set to `/home/boyzapp/logs/nodejs.log`

4. **Add Environment Variables**

   Click **Add Variable** and add these (copy from your .env file):

   ```
   NODE_ENV = production
   DATABASE_URL = postgresql://boyzapp_user:YOUR_PASSWORD@localhost:5432/boyzapp_db
   JWT_SECRET = your_generated_secret
   SESSION_SECRET = your_generated_secret
   WEB_APP_URL = https://boyzapp.com
   DOMAIN = boyzapp.com
   ```

5. **Create Application**
   - Click **Create** button
   - Wait for creation to complete

---

### STEP 6: Install Dependencies

1. **In the Node.js App Interface**
   - After creating the app, you'll see it listed
   - Click on the application name to expand details
   - Look for **Run NPM Install** button
   - Click it to install dependencies
   - Wait for completion (may take 2-5 minutes)

   **Alternative:**
   - The interface should show a command like:
   ```
   cd /home/boyzapp/boyfanz-deploy && npm install
   ```
   - This should run automatically when you start the app

---

### STEP 7: Start Application

1. **Start the App**
   - In the Node.js App interface
   - Find your `boyzapp.com` application
   - Click **Start** or **Restart** button
   - Wait for status to show "Running"

2. **Check Application Status**
   - Status should turn green
   - Should say "Running" or "Started"

---

### STEP 8: Setup SSL Certificate

1. **Install SSL**
   - Go to cPanel → **Security** → **SSL/TLS**
   - Click **Manage SSL Sites**
   - Select domain: `boyzapp.com`
   - Click **Install AutoSSL Certificate** (Free Let's Encrypt)
   - Wait for installation

2. **Force HTTPS**
   - Go to **Domains** → **Domains**
   - Find `boyzapp.com`
   - Toggle **Force HTTPS Redirect** to ON

---

### STEP 9: Verify Deployment

1. **Test Website**
   - Open browser
   - Visit: `https://boyzapp.com`
   - You should see the BoyFanz homepage

2. **Test API**
   - Visit: `https://boyzapp.com/api/health`
   - Should return: `{"status":"ok","database":"connected"}`

3. **Check Logs**
   - In cPanel → Node.js App interface
   - Click on your application
   - Look for **View Logs** or check `/home/boyzapp/logs/nodejs.log`

---

### STEP 10: Post-Deployment Security

1. **Change Admin Password**
   - Visit: `https://boyzapp.com`
   - Login with:
     - Email: `Josh@fanzunlimited.com`
     - Password: `admin123`
   - **IMMEDIATELY go to settings and change password!**

2. **Verify Environment Security**
   - Make sure `.env` file has unique secrets
   - Verify database password is strong
   - Check that `.env` is not publicly accessible

---

## 🎯 TROUBLESHOOTING

### Application Won't Start

1. **Check Logs**
   - cPanel → Node.js App → View application logs
   - Look for errors

2. **Common Issues:**
   - Database connection failed → Check DATABASE_URL in environment variables
   - Port already in use → Restart the application
   - Dependencies not installed → Click "Run NPM Install" again

### Database Connection Errors

1. **Verify Database Exists**
   - cPanel → PostgreSQL Databases
   - Confirm `boyzapp_db` exists

2. **Check User Privileges**
   - Make sure `boyzapp_user` has ALL PRIVILEGES on `boyzapp_db`

3. **Test Connection**
   - Use phpPgAdmin to verify you can connect with the credentials

### Can't Access Website

1. **Check DNS**
   - Make sure domain is pointed to `67.217.54.66`
   - DNS propagation can take 24-48 hours

2. **Check Application Status**
   - cPanel → Node.js App
   - Verify status is "Running"

3. **Check Error Logs**
   - Look in application logs for errors

---

## 📊 DEPLOYMENT CHECKLIST

Complete these steps in order:

- [ ] Package uploaded to server
- [ ] Package extracted via File Manager
- [ ] PostgreSQL database created (`boyzapp_db`)
- [ ] Database user created (`boyzapp_user`)
- [ ] User added to database with ALL PRIVILEGES
- [ ] Database schema initialized via phpPgAdmin
- [ ] .env file created from .env.example
- [ ] Database credentials updated in .env
- [ ] Security secrets generated and added to .env
- [ ] Node.js application created in cPanel
- [ ] Environment variables configured
- [ ] Dependencies installed (npm install)
- [ ] Application started successfully
- [ ] SSL certificate installed
- [ ] HTTPS redirect enabled
- [ ] Website accessible at https://boyzapp.com
- [ ] API responding at /api/health
- [ ] Default admin password changed
- [ ] Logs checked for errors

---

## 🎉 SUCCESS!

Once all steps are complete, your BoyFanz application should be:

✅ **Live at:** https://boyzapp.com
✅ **Secure:** SSL certificate installed
✅ **Running:** Node.js application started
✅ **Database:** PostgreSQL connected and initialized

---

## 📞 SUPPORT

**Contact:** Josh@fanzunlimited.com
**Server:** 67.217.54.66
**cPanel:** https://67.217.54.66:2083

---

**Generated:** 2025-11-16
**Method:** cPanel Web Interface Only (No SSH)
**Status:** ✅ Ready for Web Deployment
