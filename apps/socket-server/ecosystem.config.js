module.exports = {
  apps: [
    {
      name: "socket-server",
      script: "./server.js",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
