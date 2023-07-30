module.exports = {
  apps: [
    {
      name: 'veralink-smartshield',
      script: 'app.js',
      env_production: {
        NODE_ENV: 'prod',
      },
      env_development: {
        NODE_ENV: 'dev',
      },
    },
  ],
};
