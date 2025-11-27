#!/bin/bash

# BoyFanz Deployment Package Creator
# Creates a ready-to-upload package for cPanel deployment

set -e

echo "=================================================="
echo "BoyFanz v1 - Deployment Package Creator"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_DIR="boyfanz-deploy"
ARCHIVE_NAME="boyfanz-deploy-$(date +%Y%m%d-%H%M%S).tar.gz"

echo -e "${BLUE}Step 1: Cleaning up old deployment packages...${NC}"
rm -rf $DEPLOY_DIR
rm -f boyfanz-deploy-*.tar.gz
echo -e "${GREEN}✓ Cleanup complete${NC}"
echo ""

echo -e "${BLUE}Step 2: Creating deployment directory...${NC}"
mkdir -p $DEPLOY_DIR
echo -e "${GREEN}✓ Directory created${NC}"
echo ""

echo -e "${BLUE}Step 3: Building production version...${NC}"
pnpm build
echo -e "${GREEN}✓ Build complete${NC}"
echo ""

echo -e "${BLUE}Step 4: Copying essential files...${NC}"

# Copy built files
cp -r dist/ $DEPLOY_DIR/
echo "  ✓ Copied dist/"

# Copy package files
cp package.json $DEPLOY_DIR/
cp package-lock.json $DEPLOY_DIR/ 2>/dev/null || cp pnpm-lock.yaml $DEPLOY_DIR/ 2>/dev/null || echo "  ⚠ No lock file found"
echo "  ✓ Copied package files"

# Copy environment configuration
cp .env.production $DEPLOY_DIR/.env.example
echo "  ✓ Copied environment template"

# Copy database files
cp -r database/ $DEPLOY_DIR/
echo "  ✓ Copied database files"

# Copy documentation
cp CPANEL_DEPLOYMENT_GUIDE.md $DEPLOY_DIR/
cp README.md $DEPLOY_DIR/ 2>/dev/null || echo "  ⚠ No README found"
echo "  ✓ Copied documentation"

# Copy server configuration
cp -r server/ $DEPLOY_DIR/ 2>/dev/null || echo "  ⚠ Server source not needed (bundled in dist)"
echo "  ✓ Copied server files"

# Copy shared files if they exist
if [ -d "shared" ]; then
    cp -r shared/ $DEPLOY_DIR/
    echo "  ✓ Copied shared files"
fi

echo -e "${GREEN}✓ Files copied successfully${NC}"
echo ""

echo -e "${BLUE}Step 5: Creating deployment scripts...${NC}"

# Create startup script
cat > $DEPLOY_DIR/start.sh << 'EOF'
#!/bin/bash
# BoyFanz Startup Script

echo "Starting BoyFanz application..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Start application with PM2
if command -v pm2 &> /dev/null; then
    pm2 start dist/index.js --name boyfanz --env production
    echo "✓ Application started with PM2"
else
    # Fallback to node
    NODE_ENV=production node dist/index.js
fi
EOF

chmod +x $DEPLOY_DIR/start.sh
echo "  ✓ Created start.sh"

# Create stop script
cat > $DEPLOY_DIR/stop.sh << 'EOF'
#!/bin/bash
# BoyFanz Stop Script

echo "Stopping BoyFanz application..."

if command -v pm2 &> /dev/null; then
    pm2 stop boyfanz
    echo "✓ Application stopped"
else
    # Find and kill node process
    pkill -f "node dist/index.js"
    echo "✓ Application stopped"
fi
EOF

chmod +x $DEPLOY_DIR/stop.sh
echo "  ✓ Created stop.sh"

# Create database setup script
cat > $DEPLOY_DIR/setup-database.sh << 'EOF'
#!/bin/bash
# BoyFanz Database Setup Script

echo "=================================================="
echo "BoyFanz Database Setup"
echo "=================================================="
echo ""

# Load environment variables
if [ -f .env ]; then
    source .env
else
    echo "Error: .env file not found!"
    echo "Please copy .env.example to .env and configure your database settings"
    exit 1
fi

# Extract database credentials from DATABASE_URL or use individual vars
DB_USER=${PGUSER:-"boyzapp_user"}
DB_NAME=${PGDATABASE:-"boyzapp_db"}
DB_HOST=${PGHOST:-"localhost"}

echo "Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

read -p "Continue with database setup? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled"
    exit 1
fi

echo ""
echo "Importing database schema..."

if [ -f "database/complete-schema.sql" ]; then
    psql -U $DB_USER -d $DB_NAME -h $DB_HOST -f database/complete-schema.sql
    echo "✓ Database schema imported successfully"
else
    echo "Error: database/complete-schema.sql not found!"
    exit 1
fi

echo ""
echo "Database setup complete!"
EOF

chmod +x $DEPLOY_DIR/setup-database.sh
echo "  ✓ Created setup-database.sh"

# Create installation instructions
cat > $DEPLOY_DIR/INSTALL.txt << 'EOF'
BoyFanz v1 - Installation Instructions
=======================================

Server Information:
- Domain: boyzapp.com
- IP: 67.217.54.66
- cPanel User: boyzapp
- cPanel Password: Bama@11061990

Quick Start:
1. Extract this archive to /home/boyzapp/boyfanz
2. Copy .env.example to .env and configure
3. Run: ./setup-database.sh
4. Install dependencies: npm install --production
5. Run: ./start.sh

For detailed instructions, see CPANEL_DEPLOYMENT_GUIDE.md

Support: Josh@fanzunlimited.com
EOF

echo "  ✓ Created INSTALL.txt"

echo -e "${GREEN}✓ Deployment scripts created${NC}"
echo ""

echo -e "${BLUE}Step 6: Creating archive...${NC}"
tar -czf $ARCHIVE_NAME -C . $DEPLOY_DIR
echo -e "${GREEN}✓ Archive created: $ARCHIVE_NAME${NC}"
echo ""

# Get archive size
ARCHIVE_SIZE=$(du -h $ARCHIVE_NAME | cut -f1)

echo "=================================================="
echo -e "${GREEN}Deployment package created successfully!${NC}"
echo "=================================================="
echo ""
echo "Package Details:"
echo "  File: $ARCHIVE_NAME"
echo "  Size: $ARCHIVE_SIZE"
echo "  Location: $(pwd)/$ARCHIVE_NAME"
echo ""
echo "Next Steps:"
echo "  1. Upload $ARCHIVE_NAME to your cPanel server"
echo "  2. Extract: tar -xzf $ARCHIVE_NAME"
echo "  3. Follow instructions in CPANEL_DEPLOYMENT_GUIDE.md"
echo ""
echo "Upload Command:"
echo "  scp $ARCHIVE_NAME boyzapp@67.217.54.66:/home/boyzapp/"
echo ""
echo "=================================================="
