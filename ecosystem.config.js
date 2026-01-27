module.exports = {
  apps: [
    {
      name: 'ifrc-report',
      cwd: __dirname,
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 'max',
      exec_mode: 'cluster',
      max_memory_restart: '1G',
      exp_backoff_restart_delay: 100
    }
  ]
};
