const express = require('express');
const http = require('http');
const router = require('./router');
const axios = require('axios');
const $ = require('cheerio');

const PORT = process.env.PORT || 9797;

const app = express();
const server = http.createServer(app);

app.use(router);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));

const zipcode = "90095";
const url = "https://www.foodbanks.net/search.php?q=" + zipcode;
axios.get(url)
    .then(response => {
        getData(response.data);
    })
    .catch(error => {
        console.log(error);
    });

let getData = html => {

    $('table tbody tr', html).each((i, elem) => {

        const name = $('span[itemprop=name]', elem).text();
        const address = $('div[itemprop=address]', elem).text();
        console.log(name);
        console.log("\t" + address);

    });
}