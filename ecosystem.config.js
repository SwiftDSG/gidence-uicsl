module.exports = {
  apps: [
    {
      name: 'redian-uics',
      exec_mode: 'cluster',
      instances: 'max',
      script: './.output/server/index.mjs',
      env: {
        "NUXT_APP_BASE_URL": "/",
        "PORT": 3000
      }
    }
  ]
}
