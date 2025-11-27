# 🔧 Fix White Screen - BoyFanz

The white screen means the Node.js app isn't running on port 3000. Let's fix it!

---

## 🚀 Quick Fix (Copy/Paste This)

**SSH into your server as boyzapp user:**

```bash
ssh boyzapp@67.217.54.66
```

**Then copy and paste this entire block:**

```bash
cd /home/boyzapp/boyfanz-deploy

# Check what files we have
echo "=== Files in directory ==="
ls -lah

# Check if index.js exists
if [ -f "index.js" ]; then
    echo "✅ Found index.js"
    STARTUP_FILE="index.js"
elif [ -f "dist/index.js" ]; then
    echo "✅ Found dist/index.js"
    STARTUP_FILE="dist/index.js"
elif [ -f "server/index.js" ]; then
    echo "✅ Found server/index.js"
    STARTUP_FILE="server/index.js"
else
    echo "❌ Cannot find index.js"
    echo "Available files:"
    find . -name "*.js" -type f | head -20
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --production
fi

# Stop any existing PM2 processes
pm2 delete all 2>/dev/null || true

# Start the app
echo "🚀 Starting app with: $STARTUP_FILE"
pm2 start "$STARTUP_FILE" --name boyfanz --env production

# Wait a moment
sleep 3

# Check status
pm2 status

# Check logs
echo "=== Recent logs ==="
pm2 logs boyfanz --lines 20 --nostream

# Test if app is responding
echo "=== Testing app ==="
curl -I http://localhost:3000

echo ""
echo "✅ If you see 'HTTP/1.1 200 OK' above, the app is working!"
echo "Now visit: http://boyzapp.com"
```

---

## 📊 What This Does

1. **Finds your startup file** (index.js or dist/index.js)
2. **Installs dependencies** if needed
3. **Starts the app** with PM2
4. **Shows you the status** and logs
5. **Tests** if it's working

---

## ✅ Success Signs

You should see:

```
┌─────┬──────────┬─────────┬─────────┐
│ id  │ name     │ mode    │ status  │
├─────┼──────────┼─────────┼─────────┤
│ 0   │ boyfanz  │ fork    │ online  │
└─────┴──────────┴─────────┴─────────┘
```

And then:

```
HTTP/1.1 200 OK
```

---

## 🐛 If You See Errors

### Error: "Cannot find module"

**Solution:**
```bash
cd /home/boyzapp/boyfanz-deploy
npm install --production
pm2 restart boyfanz
```

### Error: "EADDRINUSE :::3000"

**Solution:**
```bash
# Port 3000 is already in use, kill it
lsof -ti:3000 | xargs kill -9
pm2 restart boyfanz
```

### Error: Database connection failed

**Solution:**
```bash
# Check .env file
cat /home/boyzapp/boyfanz-deploy/.env | grep DATABASE_URL

# Should show: DATABASE_URL=postgresql://postgres:Bama@1106199@...
```

---

## 🔍 Alternative: Manual Test

If PM2 isn't working, test manually:

```bash
cd /home/boyzapp/boyfanz-deploy

# Try starting manually
node index.js
# or
node dist/index.js

# You'll see errors directly - share them with me!
```

Press `Ctrl+C` to stop manual test, then start with PM2 again.

---

## 📞 Quick Reference

**What to run:** SSH as boyzapp → Copy/paste the big block above → Done!

**Expected result:** PM2 shows "online", curl shows "200 OK", website loads

**Time:** 2-3 minutes

---

**Run the commands above and let me know what you see!**

If you see any errors in the PM2 logs, copy/paste them and I'll help you fix them.
