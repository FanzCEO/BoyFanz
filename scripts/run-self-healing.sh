#!/bin/bash
# PROPRIETARY – Owned by Joshua Stone (Wyatt Cole).
# Licensed for Use by FANZ Group Holdings LLC.
# 30 N Gould Street, Sheridan, WY 82801.
# ™ FANZ — Patent Pending (2025).

# Daily Self-Healing Bot Execution Script
# This script runs the autonomous AI bots that detect and fix platform issues

cd /var/www/boyfanz

# Load environment variables
export NODE_ENV=production

# Run the self-healing bots
npx tsx -r dotenv/config -e "import('./server/bots/selfHealingBots.js').then(m => m.runDailySelfHealing()).catch(err => { console.error('Self-healing failed:', err); process.exit(1); })" >> /var/log/fanz-self-healing.log 2>&1

# Log completion
echo "✅ Self-healing cycle completed at $(date)" >> /var/log/fanz-self-healing.log
