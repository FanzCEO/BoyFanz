module.exports = {
  apps: [{
    name: "boyfanz",
    script: "./dist/index.js",
    cwd: "/var/www/boyfanz",
    instances: 1,
    exec_mode: "fork",
    node_args: "--max-old-space-size=2048",
    env: {
      NODE_ENV: "production",
      PORT: "3000",
      SSO_SHARED_SECRET: "fb7b900a70893b288cc46741c9715efc07f7dacc9cf873e97755643c156cc436",
      HEALTH_MONITORING_ENABLED: "false",
      SERVICE_DISCOVERY_ENABLED: "false",
      GATEWAY_FORWARDING_ENABLED: "false",
      DRM_ENCRYPTION_KEY: "5cd3dc814ba270e44e6bc857b065fee4b7d8f770e867cd931ecedafa51dad1a1",
      DATA_RETENTION_ENABLED: "false",
      SCHEDULER_ENABLED: "false",
      ENABLE_DATA_RETENTION_SCHEDULER: "false"
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
