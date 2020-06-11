/* This sets up a proxy between the React server and Node server. All React requests to /api/* 
   will be redirected to the target address below. */

const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = app => {
  app.use(createProxyMiddleware("/api/*", { target: "http://localhost:9977/" }));
};
