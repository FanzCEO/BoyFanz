# 🚀 BoyFanz Deployment - cPanel Web Interface ONLY

## ⚠️ IMPORTANT: SSH is Disabled

Since SSH access is disabled on your cPanel account, **everything must be done through the cPanel web interface**.

---

## 📦 WHAT WE HAVE

**On your local computer:**
- ✅ Deployment package: `boyfanz-deploy-20251116-194255.tar.gz` (6.6 MB)
- ✅ Ready .env file: `.env.production.ready` (with ALL your credentials)

**Status:** Files need to be uploaded via cPanel web interface

---

## 🎯 COMPLETE DEPLOYMENT STEPS

### STEP 1: Upload Package via cPanel (5 minutes)

1. **Login to cPanel**
   - URL: https://67.217.54.66:2083
   - Username: `boyzapp`
   - Password: `Bama@11061990`

2. **Open File Manager**
   - Click: **Files** → **File Manager**
   - Navigate to: `/home/boyzapp/`

3. **Upload Package**
   - Click **Upload** button (top toolbar)
   - Click **Select File**
   - Find: `/Users/joshuastone/FANZ-Unified-Ecosystem/boyfanz/boyfanz-deploy-20251116-194255.tar.gz`
   - Wait for upload (6.6 MB - takes 2-3 minutes)

4. **Extract Package**
   - Back in File Manager at `/home/boyzapp/`
   - Right-click: `boyfanz-deploy-20251116-194255.tar.gz`
   - Select: **Extract**
   - Click: **Extract Files**
   - Wait for extraction to complete

---

### STEP 2: Upload .env File (2 minutes)

1. **Navigate to Extracted Folder**
   - File Manager → `/home/boyzapp/boyfanz-deploy/`

2. **Upload .env File**
   - Click **Upload** button
   - Select file: `/Users/joshuastone/FANZ-Unified-Ecosystem/boyfanz/.env.production.ready`
   - Upload completes

3. **Rename to .env**
   - Find the uploaded file: `.env.production.ready`
   - Right-click → **Rename**
   - Change name to: `.env`
   - Click **Rename File**

---

### STEP 3: Verify .env Content (1 minute)

1. **Check the .env file**
   - Right-click `.env` → **Edit**
   - Verify it contains:
     ```
     DATABASE_URL=postgresql://postgres:Bama@1106199@db.ysjondxpwvfjofbneqki...
     SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     JWT_SECRET=b9c1b3dd726019cb6efef936df806e28a3c677746bf8aa971c852a8bd90b99b5
     ```
   - If correct, close (don't edit)

---

### STEP 4: Setup Node.js Application (5 minutes)

1. **Open Node.js Setup**
   - Go back to cPanel home
   - Click: **Software** → **Setup Node.js App**

2. **Create Application**
   - Click: **Create Application**

3. **Configure Application:**
   ```
   Node.js version:           18.20.4 (or latest 18.x available)
   Application mode:          Production
   Application root:          /home/boyzapp/boyfanz-deploy
   Application URL:           boyzapp.com
   Application startup file:  dist/index.js
   Passenger log file:        /home/boyzapp/logs/nodejs.log
   ```

4. **Add Environment Variables** (Click "Add Variable" for each):

   **Essential Variables:**
   ```
   Name: NODE_ENV          Value: production
   Name: PORT              Value: 3000
   Name: WEB_APP_URL       Value: https://boyzapp.com
   Name: DOMAIN            Value: boyzapp.com
   ```

   **Database Variables:**
   ```
   Name: DATABASE_URL
   Value: postgresql://postgres:Bama@1106199@db.ysjondxpwvfjofbneqki.supabase.co:5432/postgres

   Name: SUPABASE_URL
   Value: https://ysjondxpwvfjofbneqki.supabase.co

   Name: SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzam9uZHhwd3Zmam9mYm5lcWtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NjY1NjcsImV4cCI6MjA3MTQ0MjU2N30.72MyxK6NprjcECBs3rM_LMLLpDXMuFB69m0e5_8ER3A

   Name: SUPABASE_SERVICE_ROLE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzam9uZHhwd3Zmam9mYm5lcWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg2NjU2NywiZXhwIjoyMDcxNDQyNTY3fQ.mmBBfpS7feLB0DODh4Fj4b5GVqLutDnczyayK8H4dwg
   ```

   **Security Variables:**
   ```
   Name: JWT_SECRET
   Value: b9c1b3dd726019cb6efef936df806e28a3c677746bf8aa971c852a8bd90b99b5

   Name: SESSION_SECRET
   Value: 1f3896e677c9a067edf088018463ed98458d372da0b5b61f63c517b6f363a2c5
   ```

5. **Create the Application**
   - Click: **Create**
   - Wait for creation to finish

---

### STEP 5: Install Dependencies (3-5 minutes)

1. **Install Node Modules**
   - In the Node.js App interface
   - Find your `boyzapp.com` application
   - Click: **Run NPM Install**
   - Wait 3-5 minutes (this installs all dependencies)
   - Status will show when complete

---

### STEP 6: Start Application (1 minute)

1. **Start the App**
   - In Node.js App interface
   - Click: **Start** or **Restart** button
   - Wait for status to show: **"Running"** (green)

2. **Check Status**
   - Should show "Running" in green
   - If red, click "View Logs" to see error

---

### STEP 7: Install SSL Certificate (2 minutes)

1. **Install SSL**
   - Go to cPanel home
   - Click: **Security** → **SSL/TLS**
   - Click: **Manage SSL Sites**
   - Select domain: `boyzapp.com`
   - Click: **Install AutoSSL Certificate** (Free Let's Encrypt)
   - Wait for installation

2. **Force HTTPS**
   - Go to: **Domains** → **Domains**
   - Find: `boyzapp.com`
   - Toggle: **Force HTTPS Redirect** to ON

---

### STEP 8: Test Deployment (2 minutes)

1. **Test Homepage**
   - Open browser
   - Go to: https://boyzapp.com
   - Should load BoyFanz site!

2. **Test API**
   - Go to: https://boyzapp.com/api/health
   - Should return: `{"status":"ok","database":"connected"}`

3. **Check Logs if Issues**
   - cPanel → Setup Node.js App
   - Click your app
   - Click: **View Logs**
   - Check for errors

---

## 📋 DEPLOYMENT CHECKLIST

- [ ] Login to cPanel (https://67.217.54.66:2083)
- [ ] Upload deployment package (boyfanz-deploy-*.tar.gz)
- [ ] Extract package in File Manager
- [ ] Upload .env.production.ready file
- [ ] Rename to .env
- [ ] Verify .env has all credentials
- [ ] Create Node.js application
- [ ] Add environment variables
- [ ] Run NPM Install
- [ ] Start application
- [ ] Install SSL certificate
- [ ] Enable HTTPS redirect
- [ ] Test website at https://boyzapp.com
- [ ] Verify API health check

---

## 📁 FILES YOU NEED (Local Computer)

Located at: `/Users/joshuastone/FANZ-Unified-Ecosystem/boyfanz/`

1. **boyfanz-deploy-20251116-194255.tar.gz**
   - Upload via cPanel File Manager
   - Extract in `/home/boyzapp/`

2. **.env.production.ready**
   - Upload via cPanel File Manager
   - Rename to `.env`
   - Place in `/home/boyzapp/boyfanz-deploy/`

---

## 🔍 TROUBLESHOOTING

### Can't Find Package to Upload
- Path: `/Users/joshuastone/FANZ-Unified-Ecosystem/boyfanz/boyfanz-deploy-20251116-194255.tar.gz`
- Size: 6.6 MB
- If missing, the package creation script can be re-run

### Upload Fails
- Check file size limits in cPanel
- Try uploading via FTP if web upload fails
- Package might be too large for web interface

### Application Won't Start
- Check logs in Node.js App interface
- Verify .env file exists and has content
- Make sure all environment variables are set
- Check Node.js version is 18.x

### Database Connection Error
- Double-check DATABASE_URL is exactly:
  `postgresql://postgres:Bama@1106199@db.ysjondxpwvfjofbneqki.supabase.co:5432/postgres`
- Verify Supabase project is active
- Check SUPABASE_ANON_KEY and SERVICE_ROLE_KEY are set

---

## ⏱️ TOTAL TIME ESTIMATE

- Upload package: 5 min
- Extract: 2 min
- Upload .env: 2 min
- Create Node.js app: 5 min
- Install dependencies: 5 min
- Start app: 1 min
- Install SSL: 2 min
- Test: 2 min

**Total: ~25 minutes**

---

## 🆘 ALTERNATIVE: FTP Upload

If cPanel File Manager upload is slow/failing:

1. **Use FTP Client** (FileZilla, Cyberduck, etc.)
   - Host: 67.217.54.66
   - Username: boyzapp
   - Password: Bama@11061990
   - Port: 21 (FTP) or 22 (SFTP - if enabled)

2. **Upload Files**
   - Upload `boyfanz-deploy-20251116-194255.tar.gz` to `/home/boyzapp/`
   - Upload `.env.production.ready` to `/home/boyzapp/boyfanz-deploy/`
   - Use cPanel File Manager to extract and rename

---

## 📞 SUPPORT

**Server:** 67.217.54.66
**cPanel:** https://67.217.54.66:2083
**Username:** boyzapp
**Password:** Bama@11061990

**All credentials configured in:** `.env.production.ready`

---

**Status:** ✅ READY - Just needs cPanel web upload
**Method:** cPanel File Manager Upload Only (SSH disabled)
**Time:** 25 minutes total
