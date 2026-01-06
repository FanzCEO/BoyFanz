#!/bin/bash
# BoyFanz Locked Deployment Script
# This platform requires authorization code before deployment

set -e

echo "========================================"
echo "  BOYFANZ LOCKED DEPLOYMENT"
echo "========================================"
echo ""

# Check if unlock file exists on server
UNLOCKED=$(ssh fanz 'test -f /var/www/boyfanz/.deploy-unlocked && echo "yes" || echo "no"')

if [ "$UNLOCKED" != "yes" ]; then
    echo "This platform is LOCKED."
    echo ""
    read -sp "Enter authorization code: " AUTH_CODE
    echo ""

    # Verify the code on server
    if ssh fanz "/var/www/boyfanz/verify-deploy.sh '$AUTH_CODE'"; then
        echo ""
        echo "Proceeding with deployment..."
    else
        echo ""
        echo "Deployment aborted."
        exit 1
    fi
else
    echo "Platform is temporarily unlocked. Proceeding..."
fi

echo ""
echo "Building..."
npm run build

echo ""
echo "Deploying to server..."
rsync -avz dist/ fanz:/var/www/boyfanz/dist/

echo ""
echo "Restarting service..."
ssh fanz 'pm2 restart boyfanz'

echo ""
echo "========================================"
echo "  DEPLOYMENT COMPLETE"
echo "========================================"
