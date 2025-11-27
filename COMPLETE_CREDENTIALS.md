# 🔐 BoyFanz - Complete Credentials Reference

## ✅ ALL CREDENTIALS CONFIGURED

**Status:** Ready for production deployment
**Server:** 67.217.54.66 (boyzapp.com)
**Location:** All credentials added to `/home/boyzapp/boyfanz-deploy/.env`

---

## 📋 ENVIRONMENT VARIABLES FOR cPanel NODE.JS APP

When setting up the Node.js application in cPanel, add these environment variables:

### Essential Configuration
```
NODE_ENV = production
PORT = 3000
WEB_APP_URL = https://boyzapp.com
API_URL = https://boyzapp.com/api
DOMAIN = boyzapp.com
```

### Database - Supabase PostgreSQL
```
DATABASE_URL = postgresql://postgres:Bama@1106199@db.ysjondxpwvfjofbneqki.supabase.co:5432/postgres

SUPABASE_URL = https://ysjondxpwvfjofbneqki.supabase.co

SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzam9uZHhwd3Zmam9mYm5lcWtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NjY1NjcsImV4cCI6MjA3MTQ0MjU2N30.72MyxK6NprjcECBs3rM_LMLLpDXMuFB69m0e5_8ER3A

SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzam9uZHhwd3Zmam9mYm5lcWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg2NjU2NywiZXhwIjoyMDcxNDQyNTY3fQ.mmBBfpS7feLB0DODh4Fj4b5GVqLutDnczyayK8H4dwg

PGHOST = db.ysjondxpwvfjofbneqki.supabase.co
PGPORT = 5432
PGDATABASE = postgres
PGUSER = postgres
PGPASSWORD = Bama@1106199
```

### Security Secrets
```
JWT_ISS = boyzapp.com
JWT_AUD = boyzapp.clients
JWT_SECRET = b9c1b3dd726019cb6efef936df806e28a3c677746bf8aa971c852a8bd90b99b5
SESSION_SECRET = 1f3896e677c9a067edf088018463ed98458d372da0b5b61f63c517b6f363a2c5
```

### BoyFanz Server API Key
```
BOYFANZ_API_KEY = SFQ87TD1FT5XMT5C4LY7GO1NMY9ODXOQ
API_KEY = SFQ87TD1FT5XMT5C4LY7GO1NMY9ODXOQ
```

### Email Configuration (Optional - configure later)
```
OTP_EMAIL_FROM = noreply@boyzapp.com
```

---

## 🗄️ DATABASE CREDENTIALS

### Supabase PostgreSQL
```
Host:     db.ysjondxpwvfjofbneqki.supabase.co
Port:     5432
Database: postgres
User:     postgres
Password: Bama@1106199
```

### Full Connection String
```
postgresql://postgres:Bama@1106199@db.ysjondxpwvfjofbneqki.supabase.co:5432/postgres
```

### Supabase Dashboard
```
URL:      https://supabase.com/dashboard/project/ysjondxpwvfjofbneqki
Project:  ysjondxpwvfjofbneqki
```

---

## 🔑 API KEYS

### Supabase API Keys
```
Project URL:         https://ysjondxpwvfjofbneqki.supabase.co

Anon Public Key:     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzam9uZHhwd3Zmam9mYm5lcWtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NjY1NjcsImV4cCI6MjA3MTQ0MjU2N30.72MyxK6NprjcECBs3rM_LMLLpDXMuFB69m0e5_8ER3A

Service Role Key:    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzam9uZHhwd3Zmam9mYm5lcWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg2NjU2NywiZXhwIjoyMDcxNDQyNTY3fQ.mmBBfpS7feLB0DODh4Fj4b5GVqLutDnczyayK8H4dwg

Legacy JWT Secret:   9WVb1bJQPRI1bvFTrncCnLfLOKFr9Z4uErFiwV7W5kY6JVHzW6RaZWUWT5SiId3hKymdl8dKfd4maPTZC47viA==
```

### BoyFanz Server API Key
```
API Key:            SFQ87TD1FT5XMT5C4LY7GO1NMY9ODXOQ
```

---

## 🔐 SECURITY SECRETS

### Generated Secrets (for JWT and Sessions)
```
JWT Secret:         b9c1b3dd726019cb6efef936df806e28a3c677746bf8aa971c852a8bd90b99b5

Session Secret:     1f3896e677c9a067edf088018463ed98458d372da0b5b61f63c517b6f363a2c5
```

---

## 🌐 SERVER ACCESS

### cPanel
```
URL:        https://67.217.54.66:2083
Username:   boyzapp
Password:   Bama@11061990
```

### SSH
```
Host:       67.217.54.66
Username:   boyzapp
Password:   Bama@11061990
Status:     ✅ Enabled
```

### Domain
```
Domain:     boyzapp.com
IP:         67.217.54.66
DNS:        ns1.fanzgroupholdings.com
            ns2.fanzgroupholdings.com
```

---

## 📁 FILE LOCATIONS ON SERVER

```
Application Root:    /home/boyzapp/boyfanz-deploy/
Environment File:    /home/boyzapp/boyfanz-deploy/.env
Application Entry:   /home/boyzapp/boyfanz-deploy/dist/index.js
Package Archive:     /home/boyzapp/boyfanz-deploy-20251116-194255.tar.gz
```

---

## ✅ CONFIGURATION STATUS

- ✅ Database: Supabase PostgreSQL connected
- ✅ API Keys: All configured
- ✅ Security: JWT and Session secrets generated
- ✅ Server API Key: Added
- ✅ Files: All uploaded and extracted
- ✅ .env: Complete with all credentials
- ✅ SSH: Enabled and working

---

## 🚀 READY FOR DEPLOYMENT

**All credentials are configured in:**
- Server: `/home/boyzapp/boyfanz-deploy/.env`
- Local: `/Users/joshuastone/FANZ-Unified-Ecosystem/boyfanz/.env.production.ready`

**Next Steps:**
1. Setup Node.js app in cPanel (Software → Setup Node.js App)
2. Add environment variables from this document
3. Run NPM Install
4. Start application
5. Install SSL certificate
6. Go live at https://boyzapp.com

---

**Generated:** 2025-11-17
**Status:** ✅ ALL CREDENTIALS CONFIGURED
**Ready:** Yes - proceed to cPanel Node.js setup
