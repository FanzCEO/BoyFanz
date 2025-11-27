# 🔑 Get Your Supabase Credentials - 2 Minutes

## STEP 1: Get Supabase Password & Keys

### Open This Link:
**👉 https://supabase.com/dashboard/project/ysjondxpwvfjofbneqki/settings/database**

You'll see a page with "Connection string"

### Copy The Password:
1. Look for the "URI" tab
2. You'll see something like: `postgresql://postgres:[YOUR-PASSWORD]@db...`
3. **Copy just the password part** (between `:` and `@`)
4. Save it - you need it!

---

## STEP 2: Get API Keys

### Open This Link:
**👉 https://supabase.com/dashboard/project/ysjondxpwvfjofbneqki/settings/api**

### Copy These 3 Things:

1. **Project URL** (already correct, but verify):
   ```
   https://ysjondxpwvfjofbneqki.supabase.co
   ```

2. **anon public key** (long string starting with `eyJ...`)
   - Look for "anon public" section
   - Click the copy icon
   - This is safe to expose to clients

3. **service_role key** (another long string starting with `eyJ...`)
   - Look for "service_role" section
   - Click the copy icon
   - ⚠️ KEEP THIS SECRET - never expose in client code

---

## STEP 3: Generate Random Secrets

### Open This Link:
**👉 https://randomkeygen.com/**

### Copy Two "CodeIgniter Encryption Keys":
1. Scroll to "CodeIgniter Encryption Keys"
2. Copy the first one → This is your **JWT_SECRET**
3. Copy another one → This is your **SESSION_SECRET**

---

## ✅ NOW YOU HAVE ALL 5 CREDENTIALS:

1. ✅ Supabase Password
2. ✅ Supabase Anon Key
3. ✅ Supabase Service Role Key
4. ✅ JWT Secret (random)
5. ✅ Session Secret (random)

---

## 🚀 NEXT: Use These in Your .env File

On your cPanel server at `/home/boyzapp/boyfanz-deploy/.env`:

```env
# Replace these 5 values:
DATABASE_URL=postgresql://postgres:PASTE_PASSWORD_HERE@db.ysjondxpwvfjofbneqki.supabase.co:5432/postgres
SUPABASE_ANON_KEY=PASTE_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=PASTE_SERVICE_ROLE_KEY_HERE
JWT_SECRET=PASTE_RANDOM_SECRET_1_HERE
SESSION_SECRET=PASTE_RANDOM_SECRET_2_HERE
```

---

**That's it!** These are the only credentials you need to get the site running.

Everything else in the .env file can be left as-is or configured later.
