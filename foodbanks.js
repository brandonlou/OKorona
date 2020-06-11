// To get website source.
const axios = require('axios');

// To parse HTML and XML.
const cheerio = require('cheerio');

// First source.
const betaScrape = (html) => {
    let listOfFoodbanks = [];

    for(const e of html) {
        const name = e.name;
        const address = e.street_address + " " + e.city + " " + e.state + " " + e.zip_code;
        const lon = parseFloat(e.longitude);
        const lat = parseFloat(e.latitude);

        const location = {
            name: name,
            type: "foodbank",
            address: address,
            location: {
                type: "Point",
                coordinates: [lon, lat]
            },
            votes: 0
        };

        listOfFoodbanks.push(location);
    }

    return listOfFoodbanks;
}

// Second source.
const gammaScrape = (html) => {

    let listOfFoodbanks = [];
    let $ = cheerio.load(html, { xmlMode: true });

    $('Organization OrganizationID').each((i, elem) => {
        const name = $(elem).next().text();
        const addressField = $(elem).next().next();
        const address = $('Address1', addressField).text() + " " + $('City', addressField).text() + " " + $('State', addressField).text() + " " + $('Zip', addressField).text();
        const lon = $('Longitude', addressField).text();
        const lat = $('Latitude', addressField).text();
        const location = {
            name: name,
            type: "foodbank",
            address: address,
            location: {
                type: "Point",
                coordinates: [parseFloat(lon), parseFloat(lat)]
            },
            votes: 0
        }
        listOfFoodbanks.push(location);
    });

    return listOfFoodbanks;
}

const foodbanks = {};

// For each source, get its HTML. Then pass the HTML to its corresponding
// scraping function.
foodbanks.getData = async () => {

    const beta = "https://controllerdata.lacity.org/resource/v2mg-qsxf.json";
    const gamma = "https://ws2.feedingamerica.org/fawebservice.asmx/GetAllOrganizations";

    const sources = {
        [beta]: betaScrape,
        [gamma]: gammaScrape
    };

    let allFoodbanks = [];

    for(const key in sources) {
        const response = await axios.get(key); // Get HTML from each source.
        const locations = await sources[key](response.data); // Pass the HTML to its scraping function.
        for(const e of locations) { // Combine all information into one list.
            allFoodbanks.push(e);
        }
    }

    console.log(allFoodbanks);
    return allFoodbanks;

}

module.exports = foodbanks;