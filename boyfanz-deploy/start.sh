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
