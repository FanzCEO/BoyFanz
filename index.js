#!/usr/bin/env node
// BoyFanz Platform Server
// FANZ Ecosystem - Creator Platform for Gay Content Creators

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 5178;

// Simple logger that respects NODE_ENV
const logger = {
  log: (...args) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(...args);
    }
  },
  error: (...args) => {
    if (process.env.NODE_ENV !== 'test') {
      console.error(...args);
    }
  }
};

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'BoyFanz Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    ecosystem: 'FANZ'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>BoyFanz - Creator Platform</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #1a1a2e; color: #eee; }
            .container { max-width: 800px; margin: 0 auto; text-align: center; }
            .logo { font-size: 3em; font-weight: bold; color: #ff1744; margin-bottom: 20px; }
            .status { background: #16213e; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .feature { background: #0f1419; padding: 15px; margin: 10px; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">🏳️‍🌈 BoyFanz</div>
            <h2>Gay Creator Platform</h2>
            <div class="status">
                <h3>🚀 Service Status: ONLINE</h3>
                <p>Part of the FANZ Ecosystem</p>
                <p>Port: ${PORT} | Environment: ${process.env.NODE_ENV || 'development'}</p>
            </div>
            <div class="feature">
                <h4>🎥 Creator Tools</h4>
                <p>Content management and monetization tools for gay creators</p>
            </div>
            <div class="feature">
                <h4>💰 Revenue Management</h4>
                <p>100% creator ownership with transparent payouts</p>
            </div>
            <div class="feature">
                <h4>🛡️ Safe & Inclusive</h4>
                <p>LGBTQIA+ focused platform with comprehensive safety features</p>
            </div>
        </div>
    </body>
    </html>
  `);
});

// API endpoints
app.get('/api/status', (req, res) => {
  res.json({
    platform: 'BoyFanz',
    description: 'Gay Creator Platform',
    ecosystem: 'FANZ',
    port: PORT,
    status: 'operational',
    features: [
      'Content Management',
      'Creator Monetization', 
      'LGBTQIA+ Community',
      'Safe Content Sharing'
    ]
  });
});

// Start server - listen on all interfaces for Render deployment
app.listen(PORT, '0.0.0.0', () => {
  logger.log(`🏳️‍🌈 BoyFanz Platform running on port ${PORT}`);
  logger.log(`🌐 Access at: http://0.0.0.0:${PORT}`);
  logger.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.log('🏳️‍🌈 BoyFanz Platform shutting down...');
  process.exit(0);
});