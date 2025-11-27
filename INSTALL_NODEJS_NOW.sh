#!/bin/bash
# Run this script as ROOT on your WHM server
# SSH as: ssh root@67.217.54.66
# Then run: bash install_nodejs.sh

set -e

echo "================================"
echo "🚀 Installing Node.js on WHM Server"
echo "================================"
echo ""

# Check OS
echo "📋 Checking OS type..."
if grep -q "CloudLinux" /etc/redhat-release 2>/dev/null; then
    echo "✅ CloudLinux detected - Using CloudLinux method"
    OS_TYPE="cloudlinux"
elif grep -q "AlmaLinux\|CentOS\|Rocky" /etc/redhat-release 2>/dev/null; then
    echo "✅ AlmaLinux/CentOS detected - Using standard method"
    OS_TYPE="standard"
else
    echo "⚠️  Unknown OS - Using standard method"
    OS_TYPE="standard"
fi

echo ""
echo "================================"
echo "📦 Installing Node.js..."
echo "================================"
echo ""

if [ "$OS_TYPE" = "cloudlinux" ]; then
    echo "Installing CloudLinux Node.js Selector..."
    yum groupinstall alt-nodejs20 -y
    yum install lvemanager -y
    yum install ea-apache24-mod-alt-passenger -y

    echo "Enabling Node.js versions..."
    cloudlinux-selector set --json --interpreter nodejs --selector-status enabled --version 18.20 2>/dev/null || true
    cloudlinux-selector set --json --interpreter nodejs --selector-status enabled --version 20.10 2>/dev/null || true
else
    echo "Installing Node.js from NodeSource..."
    curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
    yum install nodejs -y

    echo "Installing PM2..."
    npm install -g pm2

    echo "Installing Passenger..."
    yum install -y epel-release pygpgme curl
    curl --fail -sSLo /etc/yum.repos.d/passenger.repo https://oss-binaries.phusionpassenger.com/yum/definitions/el-passenger.repo
    yum install -y mod_passenger || yum install -y ea-apache24-mod-passenger
fi

echo ""
echo "================================"
echo "✅ Verifying Installation..."
echo "================================"
echo ""

node --version
npm --version

echo ""
echo "================================"
echo "🔧 Configuring Apache..."
echo "================================"
echo ""

# Rebuild Apache config
/scripts/rebuildhttpdconf

# Restart services
echo "Restarting Apache..."
/scripts/restartsrv_httpd

echo "Restarting cPanel..."
/scripts/restartsrv_cpsrvd

echo ""
echo "================================"
echo "✅ Installation Complete!"
echo "================================"
echo ""
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Enable 'Setup Node.js App' in WHM Feature Manager:"
echo "   WHM → Feature Manager → Edit 'default' → Enable 'Setup Node.js App'"
echo ""
echo "2. Login to cPanel as boyzapp and search for 'node'"
echo "   https://67.217.54.66:2083"
echo ""
echo "3. You should now see 'Setup Node.js App' icon"
echo ""
