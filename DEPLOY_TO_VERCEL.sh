#!/bin/bash

# BoyFanz Vercel Deployment Script
# This script automates the entire deployment process

set -e  # Exit on any error

echo "🚀 BoyFanz Vercel Deployment"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Vercel CLI...${NC}"
    npm install -g vercel
fi

echo -e "${GREEN}✅ Vercel CLI installed${NC}"
echo ""

# Check if user is logged in
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}Please login to Vercel...${NC}"
    vercel login
fi

echo -e "${GREEN}✅ Authenticated${NC}"
echo ""

# Create vercel.json if it doesn't exist
if [ ! -f "vercel.json" ]; then
    echo "📝 Creating vercel.json configuration..."
    cat > vercel.json << 'EOF'
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": null,
  "env": {
    "NODE_ENV": "production"
  },
  "regions": ["iad1"]
}
EOF
    echo -e "${GREEN}✅ Created vercel.json${NC}"
fi

echo ""
echo "🚀 Deploying to Vercel..."
echo ""

# Deploy to production
vercel --prod --yes

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Add environment variables:"
echo "   vercel env add DATABASE_URL production"
echo "   vercel env add SUPABASE_URL production"
echo "   vercel env add SUPABASE_ANON_KEY production"
echo "   vercel env add SUPABASE_SERVICE_ROLE_KEY production"
echo "   vercel env add JWT_SECRET production"
echo "   vercel env add SESSION_SECRET production"
echo "   vercel env add BOYFANZ_API_KEY production"
echo ""
echo "2. Add custom domain:"
echo "   vercel domains add boyzapp.com"
echo ""
echo "3. Get your deployment URL:"
echo "   vercel ls"
echo ""
echo "Your environment variables are in: .env.production.ready"
echo ""
