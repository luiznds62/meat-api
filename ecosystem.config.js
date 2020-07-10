module.exports = {
  apps: [{
    name: "meat-api",
    script: 'dist/main.js',
    instances: 0,
    exec_mode: "cluster",
    watch: true,
    merge_logs: true,
    error_file: "logs/err.log",
    out_file: "logs/out.log",
    env: {
      SERVER_PORT: 3000,
      DB_URL: "mongodb://localhost/meat-api",
      NODE_ENV: "development"
    },
    env_production: {
      SERVER_PORT: 5000,
      DB_URL: "mongodb://localhost/meat-api",
      NODE_ENV: "production"
    }
  }],
  deploy: {
    production: {
      user: 'SSH_USERNAME',
      host: 'SSH_HOSTMACHINE',
      ref: 'origin/master',
      repo: 'GIT_REPOSITORY',
      path: 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
