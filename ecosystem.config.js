module.exports = {
  apps : [{
    name        : "OMP API",
    script      : "./server.js",
    watch       : true,
    watch       : ["./"],
    ignore_watch: ["node_modules", "./omp-config.yml"],
    env: {
      "NODE_ENV": "development",
    },
    env_production : {
       "NODE_ENV": "production"
    }
  }]
}
