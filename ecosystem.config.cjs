// Load environment variables from .env file
require('dotenv').config({ path: '/var/www/boyfanz/.env' });

module.exports = {
  apps: [{
    name: "boyfanz",
    script: "dist/index.js",
    cwd: "/var/www/boyfanz",
    node_args: "--no-warnings",
    env: {
      NODE_ENV: "production",
      PORT: 3202,
      DATABASE_URL: process.env.DATABASE_URL,
      SESSION_SECRET: process.env.SESSION_SECRET,
      PLATFORM_NAME: process.env.PLATFORM_NAME || "Boyfanz"
    }
  }]
};
