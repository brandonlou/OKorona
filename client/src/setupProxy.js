const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = app => {
  app.use(createProxyMiddleware("/foodbanks/*", { target: "http://localhost:9977/" }));
};
