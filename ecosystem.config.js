module.exports = {
  apps: [{
    name: "mp-euro-bot",
    script: "./index.js",
    wait_ready: true,
    listen_timeout: 10000,
    max_memory_restart: "500M",
    restart_delay: 120000,
  }]
}
