#!/bin/bash
# BoyFanz Theme Integrity Verification
# Run this to verify theme hasn't been modified

echo "🔒 Verifying BoyFanz Theme Integrity..."

CSS_FILE="/var/www/boyfanz/dist/assets/index-BulGGwzi.css"
HTML_FILE="/var/www/boyfanz/dist/index.html"

if [ ! -f "$CSS_FILE" ]; then
    echo "❌ ERROR: Theme CSS file missing!"
    echo "Theme may have been replaced. Restore from: /Users/wyattcole/The Correct Platforms/boyfanz/"
    exit 1
fi

# Check for blue/red color presence
if grep -q '#00d2ff' "$CSS_FILE" && grep -q '#ff0000' "$CSS_FILE"; then
    echo "✅ Theme colors verified: Blue & Red present"
else
    echo "❌ WARNING: Theme colors missing!"
    echo "Expected: #00d2ff (cyan) and #ff0000 (red)"
    exit 1
fi

# Check for underground theme markers
if grep -q 'UNDERGROUND' "$CSS_FILE" || grep -q 'underground' "$CSS_FILE"; then
    echo "✅ Underground theme markers found"
else
    echo "❌ WARNING: Underground theme markers missing!"
    exit 1
fi

echo ""
echo "✅ Theme integrity verified!"
echo "Theme: Blue & Red Underground Club"
echo "Status: LOCKED & PROTECTED"
