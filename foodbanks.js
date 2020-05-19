const axios = require('axios');
const $ = require('cheerio');

const zipcode = "90054";
const alpha = "https://www.foodbanks.net/search.php?q=" + zipcode;
const beta = "https://ws2.feedingamerica.org/fawebservice.asmx/GetOrganizationsByZip?zip=" + zipcode;

let alphaScrape = html => {
    $('table tbody tr', html).each((i, elem) => {
        const name = $('span[itemprop=name]', elem).text();
        const address = $('div[itemprop=address]', elem).text();
        console.log(name);
        console.log("\t" + address);

    });
}

let betaScrape = html => {
    const name = $('OrganizationID', html).next().text();
    const address = $('MailAddress Address1', html).text() + " " +
                    $('MailAddress City', html).text() + " " +
                    $('MailAddress State', html).text() + " " +
                    $('MailAddress Zip', html).text();

    console.log(name);
    console.log("\t" + address);
}

// Associates each web link with its scraping function.
const sources = {
    [alpha]: alphaScrape,
    [beta]: betaScrape
};

const foodbanks = {};

// For each source, get its HTML. Then pass the HTML to its corresponding
// scraping function.
foodbanks.getData = () => {
    for(const key in sources) {
        axios.get(key)
        .then(response => {
            sources[key](response.data);
        })
        .catch(error => {
            console.log(error);
        });
    }
}

module.exports = foodbanks;