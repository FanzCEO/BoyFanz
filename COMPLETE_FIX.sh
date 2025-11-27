#!/bin/bash
# Complete BoyFanz Deployment Fix Script
# Run this on the server as boyzapp user

set -e

echo "======================================"
echo "🔧 BoyFanz Complete Deployment Fix"
echo "======================================"
echo ""

cd /home/boyzapp/boyfanz-deploy

echo "1️⃣ Checking current state..."
echo "Files in directory:"
ls -lah | head -20
echo ""

echo "2️⃣ Looking for startup file..."
if [ -f "index.js" ]; then
    STARTUP_FILE="index.js"
    echo "✅ Found: index.js"
elif [ -f "dist/index.js" ]; then
    STARTUP_FILE="dist/index.js"
    echo "✅ Found: dist/index.js"
elif [ -f "server/index.js" ]; then
    STARTUP_FILE="server/index.js"
    echo "✅ Found: server/index.js"
else
    echo "❌ ERROR: Cannot find index.js"
    echo "Available JS files:"
    find . -name "*.js" -type f | grep -E "(index|server|app|main)" | head -10
    exit 1
fi
echo ""

echo "3️⃣ Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies (this takes 2-3 minutes)..."
    npm install --production
    echo "✅ Dependencies installed"
else
    echo "✅ node_modules exists"
    MODULE_COUNT=$(ls node_modules/ | wc -l)
    echo "   Found $MODULE_COUNT packages"
    if [ "$MODULE_COUNT" -lt 50 ]; then
        echo "⚠️  Too few packages, reinstalling..."
        rm -rf node_modules package-lock.json
        npm install --production
    fi
fi
echo ""

echo "4️⃣ Checking .env file..."
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    grep -q "DATABASE_URL" .env && echo "   ✓ DATABASE_URL found" || echo "   ✗ DATABASE_URL missing"
    grep -q "SUPABASE_URL" .env && echo "   ✓ SUPABASE_URL found" || echo "   ✗ SUPABASE_URL missing"
else
    echo "❌ .env file missing!"
fi
echo ""

echo "5️⃣ Stopping old PM2 processes..."
pm2 delete all 2>/dev/null || echo "   (no processes to delete)"
pm2 kill 2>/dev/null || true
echo ""

echo "6️⃣ Starting application..."
echo "   Using: $STARTUP_FILE"
pm2 start "$STARTUP_FILE" --name boyfanz --env production
echo ""

echo "7️⃣ Waiting for app to start..."
sleep 5
echo ""

echo "8️⃣ Checking status..."
pm2 status
echo ""

echo "9️⃣ Checking logs..."
pm2 logs boyfanz --lines 30 --nostream
echo ""

echo "🔟 Testing application..."
if curl -f -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
    echo "✅ SUCCESS! App is responding on port 3000"
    echo ""
    echo "======================================"
    echo "✅ DEPLOYMENT COMPLETE!"
    echo "======================================"
    echo ""
    echo "Your app is now running!"
    echo "Visit: http://boyzapp.com"
    echo ""
    pm2 save
    echo "PM2 configuration saved."
else
    echo "❌ App not responding on port 3000"
    echo ""
    echo "Checking for errors..."
    pm2 logs boyfanz --err --lines 50
fi
