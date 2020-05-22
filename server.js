const express = require('express');
const http = require('http');
const router = require('./router');

const PORT = process.env.PORT || 9797;

const app = express();
const server = http.createServer(app);

app.use(router);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
