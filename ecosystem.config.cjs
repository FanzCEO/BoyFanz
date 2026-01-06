module.exports = {
  apps: [{
    name: "boyfanz",
    script: "./dist/index.js",
    cwd: "/var/www/boyfanz",
    instances: "max",
    exec_mode: "cluster",
    interpreter_args: "-r dotenv/config",
    env: {
      NODE_ENV: "production",
      PORT: "3202"
    },
    max_memory_restart: "1G",
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    shutdown_with_message: true,
    error_file: "/var/log/pm2/boyfanz-error.log",
    out_file: "/var/log/pm2/boyfanz-out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    merge_logs: true,
    cron_restart: "0 3 * * *"
  }]
};
