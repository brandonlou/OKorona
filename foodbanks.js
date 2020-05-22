const axios = require('axios');
const $ = require('cheerio');


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
    let id = 0;

    for(const key in sources) {
        const response = await axios.get(key);
        const locations = sources[key](response.data);
        for(let i = 0; i < locations.length; i++) {
            const place = locations[i];
            const placeData = {
                "id": id,
                "name": place.name,
                "address": place.address
            }

            // Ignore if empty location. This is because of faulty scraping.
            if(placeData.name == "") {
                continue;
            }

            nearbyFoodbanks.push(placeData);
            id = id + 1;
        }

    }

    return nearbyFoodbanks;
}

module.exports = foodbanks;