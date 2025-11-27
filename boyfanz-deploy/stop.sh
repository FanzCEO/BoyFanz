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
