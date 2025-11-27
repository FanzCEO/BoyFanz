#!/bin/bash

# BoyFanz Automated Deployment Script
# This script will set up everything automatically

set -e

echo "🚀 BoyFanz Automated Deployment"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
CPANEL_USER="boyzapp"
CPANEL_PASS="Bama@11061990"
SERVER="67.217.54.66"
DOMAIN="boyzapp.com"
APP_ROOT="/home/boyzapp/boyfanz-deploy"

echo -e "${BLUE}Step 1: Testing SSH connection...${NC}"
sshpass -p "$CPANEL_PASS" ssh -o StrictHostKeyChecking=no $CPANEL_USER@$SERVER "echo 'SSH connected!'" && echo -e "${GREEN}✓ SSH working${NC}" || { echo "SSH failed"; exit 1; }
echo ""

echo -e "${BLUE}Step 2: Verifying files on server...${NC}"
sshpass -p "$CPANEL_PASS" ssh $CPANEL_USER@$SERVER << 'ENDSSH'
cd /home/boyzapp/boyfanz-deploy
echo "Files in deployment directory:"
ls -lh | grep -E "(\.env|dist|package\.json)" || echo "Warning: Some files missing"
echo ""
echo "Checking .env file:"
if [ -f .env ]; then
    echo "✓ .env exists ($(wc -l < .env) lines)"
else
    echo "✗ .env missing!"
    exit 1
fi
ENDSSH
echo -e "${GREEN}✓ Files verified${NC}"
echo ""

echo -e "${BLUE}Step 3: Installing dependencies...${NC}"
echo "Note: npm not available via SSH, will need cPanel interface"
echo -e "${YELLOW}⚠ Manual step required: Run NPM Install in cPanel${NC}"
echo ""

echo -e "${BLUE}Step 4: Creating startup script...${NC}"
sshpass -p "$CPANEL_PASS" ssh $CPANEL_USER@$SERVER << 'ENDSSH'
cd /home/boyzapp/boyfanz-deploy
cat > start-app.sh << 'EOF'
#!/bin/bash
cd /home/boyzapp/boyfanz-deploy
export NODE_ENV=production
export PORT=3000
source .env
node dist/index.js
EOF
chmod +x start-app.sh
echo "✓ Startup script created"
ENDSSH
echo -e "${GREEN}✓ Startup script ready${NC}"
echo ""

echo "================================"
echo -e "${GREEN}Automated setup complete!${NC}"
echo ""
echo "Next steps (via cPanel web interface):"
echo "1. Login: https://67.217.54.66:2083"
echo "2. Go to: Software → Setup Node.js App"
echo "3. Click: Create Application"
echo "4. Configure:"
echo "   - Node.js version: 18.x"
echo "   - App root: /home/boyzapp/boyfanz-deploy"
echo "   - Startup: dist/index.js"
echo "   - URL: boyzapp.com"
echo "5. Click: Run NPM Install"
echo "6. Click: Start"
echo ""
echo "Then install SSL certificate and you're live!"
echo "================================"
