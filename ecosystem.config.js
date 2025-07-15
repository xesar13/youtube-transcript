module.exports = {
  apps: [
    {
      name: "youtube-transcript-api",
      script: "index.js",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3003
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 3003,
        watch: true,
        ignore_watch: ["node_modules", "temp", "logs", ".git"]
      },
      env_staging: {
        NODE_ENV: "staging",
        PORT: 3005
      },
      log_type: "json",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      kill_timeout: 5000,
      listen_timeout: 8000,
      graceful_shutdown: true,
      shutdown_with_message: true,
      cron_restart: "0 2 * * *",
      merge_logs: true,
      append_env_to_name: false
    }
  ]
};
