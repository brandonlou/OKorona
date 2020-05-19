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

const zipcode = "94122";
const firstURL = "https://www.foodbanks.net/search.php?q=" + zipcode;
const secondURL = "https://ws2.feedingamerica.org/fawebservice.asmx/GetOrganizationsByZip?zip=" + zipcode;

axios.get(firstURL)
    .then(response => {
        getFoodBankData1(response.data);
    })
    .catch(error => {
        console.log(error);
    });

let getFoodBankData1 = html => {

    $('table tbody tr', html).each((i, elem) => {

        const name = $('span[itemprop=name]', elem).text();
        const address = $('div[itemprop=address]', elem).text();
        console.log(name);
        console.log("\t" + address);

    });
}

axios.get(secondURL)
    .then(response => {
        getFoodBankData2(response.data);
    })
    .catch(error => {
        console.log(error);
    });

let getFoodBankData2 = html => {
    const name = $('OrganizationID', html).next().text();
    const address = $('MailAddress Address1', html).text() + " " +
                    $('MailAddress City', html).text() + " " +
                    $('MailAddress State', html).text() + " " +
                    $('MailAddress Zip', html).text();

    console.log(name);
    console.log("\t" + address);
}