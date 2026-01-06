module.exports = {
  apps: [{
    name: 'boyfanz',
    script: './dist/index.js',
    cwd: '/var/www/boyfanz',
    env: {
      NODE_ENV: 'production',
      PORT: '3202',
      DATABASE_URL: 'postgresql://postgres:71XY-2%25%3B@127.0.0.1:5432/boyfanz_db'
    },
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '1G'
  }]
};
