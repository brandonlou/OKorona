// To get website HTML.
const axios = require('axios');

// To parse HTML.
const $ = require('cheerio');

// First source.
let alphaScrape = (html) => {

    let listOfFoodbanks = [];
    
    $('table tbody tr', html).each((i, elem) => {
        const name = $('span[itemprop=name]', elem).text();
        const address = $('div[itemprop=address]', elem).text();
        const location = {
            "name": name,
            "address": address
        }
        listOfFoodbanks.push(location);
    });

    return listOfFoodbanks;
}

// Second source.
let betaScrape = (html) => {

    let listOfFoodbanks = [];

    const name = $('OrganizationID', html).next().text();
    const address = $('MailAddress Address1', html).text() + " " +
                    $('MailAddress City', html).text() + " " +
                    $('MailAddress State', html).text() + " " +
                    $('MailAddress Zip', html).text();

    const location = {
        "name": name,
        "address": address
    }
    listOfFoodbanks.push(location);

    return listOfFoodbanks;
}

const foodbanks = {};

// For each source, get its HTML. Then pass the HTML to its corresponding
// scraping function.
foodbanks.getData = async (zipcode) => {

    const alpha = "https://www.foodbanks.net/search.php?q=" + zipcode;
    const beta = "https://ws2.feedingamerica.org/fawebservice.asmx/GetOrganizationsByZip?zip=" + zipcode;

    const sources = {
        [alpha]: alphaScrape,
        [beta]: betaScrape
    };

    let nearbyFoodbanks = [];

    for(const key in sources) {
        const response = await axios.get(key);
        const locations = sources[key](response.data);
        for(let i = 0; i < locations.length; i++) {
            const place = locations[i];
            const placeData = {
                type: "foodbank",
                name: place.name,
                address: place.address
            }

            // Ignore if empty location. This is because of faulty scraping.
            if(placeData.name == "") {
                continue;
            }

            nearbyFoodbanks.push(placeData);
        }
    }

    return nearbyFoodbanks;
}

module.exports = foodbanks;