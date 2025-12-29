module.exports = {
  apps: [{
    name: "boyfanz",
    script: "dist/index.js",
    cwd: "/var/www/boyfanz",
    node_args: "--no-warnings",
    env: {
      NODE_ENV: "production",
      NODE_TLS_REJECT_UNAUTHORIZED: "0",
      PORT: 3001,
      DATABASE_URL: "postgresql://postgres:Dg1FcM4jk5XkKE3B@db.mcayxybcgxhfttvwmhgm.supabase.co:6543/postgres?sslmode=require",
      SESSION_SECRET: "ebea78fe51f49e603c7aaa6581809d6b46744a265d66529105bf1f62452441de"
    }
  }]
};
