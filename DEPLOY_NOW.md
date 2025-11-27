# 🚀 Deploy BoyFanz NOW - Simple 5-Step Guide

## ✅ EVERYTHING IS READY - Just Follow These Steps

---

## STEP 1: Get Supabase Credentials (5 minutes)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/ysjondxpwvfjofbneqki
   - (Login if needed)

2. **Get Database Password**
   - Click **Settings** (gear icon) → **Database**
   - Find "Connection string"
   - Click **URI** tab
   - You'll see: `postgresql://postgres:[YOUR-PASSWORD]@db...`
   - **Copy the password** (the part after `postgres:` and before `@`)
   - Save it somewhere - you'll need it 3 times

3. **Get API Keys**
   - Click **Settings** → **API**
   - **Copy these 3 things:**
     - ✅ Project URL: `https://ysjondxpwvfjofbneqki.supabase.co`
     - ✅ anon public key (long string starting with `eyJ...`)
     - ✅ service_role key (another long string starting with `eyJ...`)

---

## STEP 2: Generate Security Secrets (2 minutes)

1. **Go to:** https://randomkeygen.com/
2. **Copy two "CodeIgniter Encryption Keys"** (256-bit)
   - First one = JWT_SECRET
   - Second one = SESSION_SECRET

---

## STEP 3: Extract Package on cPanel (3 minutes)

1. **Login to cPanel**
   - URL: https://67.217.54.66:2083
   - Username: `boyzapp`
   - Password: `Bama@11061990`

2. **Extract Package**
   - Click: **Files** → **File Manager**
   - Navigate to: `/home/boyzapp/`
   - Find: `boyfanz-deploy-20251116-194255.tar.gz`
   - **Right-click** → **Extract**
   - Click **Extract Files**

---

## STEP 4: Create .env File (5 minutes)

1. **Navigate to extracted folder**
   - File Manager → `/home/boyzapp/boyfanz-deploy/`

2. **Create .env file**
   - Find file: `READY_TO_USE.env`
   - **Right-click** → **Copy**
   - Name it: `.env`

3. **Edit .env file**
   - **Right-click** `.env` → **Edit**
   - **Find and replace** these lines with your credentials:

```env
# Line 13 - Replace YOUR_SUPABASE_PASSWORD (3 places)
DATABASE_URL=postgresql://postgres:PUT_PASSWORD_HERE@db.ysjondxpwvfjofbneqki.supabase.co:5432/postgres

# Line 20 - Paste anon key
SUPABASE_ANON_KEY=PASTE_ANON_KEY_HERE

# Line 23 - Paste service_role key
SUPABASE_SERVICE_ROLE_KEY=PASTE_SERVICE_ROLE_KEY_HERE

# Line 29 - Replace with same password
PGPASSWORD=PUT_SAME_PASSWORD_HERE

# Line 43 - Paste first secret
JWT_SECRET=PASTE_FIRST_RANDOM_SECRET_HERE

# Line 44 - Paste second secret
SESSION_SECRET=PASTE_SECOND_RANDOM_SECRET_HERE
```

4. **Save** the file (Click **Save Changes**)

---

## STEP 5: Setup Node.js App (5 minutes)

1. **Open Node.js Setup**
   - cPanel → **Software** → **Setup Node.js App**

2. **Create Application**
   - Click **Create Application**

3. **Fill in settings:**
   ```
   Node.js version:        18.20.4 (or any 18.x)
   Application mode:       Production
   Application root:       /home/boyzapp/boyfanz-deploy
   Application URL:        boyzapp.com
   Application startup:    dist/index.js
   ```

4. **Add Environment Variables**
   Click "Add Variable" button and add these (get values from your .env file):

   ```
   NODE_ENV = production
   DATABASE_URL = postgresql://postgres:YOUR_PASSWORD@db.ysjondxpwvfjofbneqki.supabase.co:5432/postgres
   SUPABASE_URL = https://ysjondxpwvfjofbneqki.supabase.co
   WEB_APP_URL = https://boyzapp.com
   JWT_SECRET = your_generated_secret_from_step_2
   SESSION_SECRET = your_other_generated_secret_from_step_2
   ```

5. **Create & Install**
   - Click **Create**
   - Wait for it to finish
   - Click **Run NPM Install**
   - Wait 2-5 minutes for dependencies to install

6. **Start Application**
   - Click **Start** or **Restart**
   - Status should show "Running" in green

---

## STEP 6: Install SSL (2 minutes)

1. **Get SSL Certificate**
   - cPanel → **Security** → **SSL/TLS**
   - Click **Manage SSL Sites**
   - Select domain: `boyzapp.com`
   - Click **Install AutoSSL Certificate** (Free - Let's Encrypt)

2. **Enable HTTPS Redirect**
   - cPanel → **Domains** → **Domains**
   - Find `boyzapp.com`
   - Toggle **Force HTTPS Redirect** to ON

---

## STEP 7: Test Your Site! (1 minute)

1. **Open Browser**
   - Go to: `https://boyzapp.com`
   - You should see your BoyFanz site!

2. **Test API**
   - Go to: `https://boyzapp.com/api/health`
   - Should show: `{"status":"ok","database":"connected"}`

3. **Check Logs** (if something's wrong)
   - cPanel → **Setup Node.js App** → Click on your app
   - Click **View Logs**

---

## ✅ THAT'S IT - YOU'RE LIVE!

**Your site should now be running at:** https://boyzapp.com

---

## 📝 QUICK CHECKLIST

- [  ] Got Supabase password
- [  ] Got Supabase API keys (anon + service_role)
- [  ] Generated 2 random secrets
- [  ] Extracted package on cPanel
- [  ] Created .env file with credentials
- [  ] Created Node.js app
- [  ] Installed dependencies
- [  ] Started application
- [  ] Installed SSL certificate
- [  ] Tested website

---

## 🆘 TROUBLESHOOTING

### Site Won't Load
- Check Node.js app status is "Running"
- Check logs for errors
- Verify .env file has correct credentials

### Database Connection Error
- Double-check Supabase password is correct
- Make sure you replaced it in all 3 places
- Verify SUPABASE_ANON_KEY and SERVICE_ROLE_KEY are set

### Can't Install Dependencies
- Try clicking "Run NPM Install" again
- Check logs for specific error
- May need to wait - sometimes takes 5+ minutes

---

## 📞 FILES YOU NEED

All in: `/home/boyzapp/boyfanz-deploy/`

- **READY_TO_USE.env** - Template with instructions
- **.env** - Your copy with real credentials
- **dist/** - Built application
- **DEPLOY_NOW.md** - This guide

---

**Total Time:** 20-25 minutes
**Difficulty:** Easy - just copy/paste
**Status:** Ready to deploy NOW!

---

**Generated:** 2025-11-16
**Package:** boyfanz-deploy-20251116-194255.tar.gz (already uploaded ✅)
