const fetch = require('node-fetch');

const states = ['alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut',
                'delaware', 'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa',
                'kansas', 'kentucky', 'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan',
                'minnesota', 'mississippi', 'missouri', 'montana', 'nebraska', 'nevada', 'new-hampshire',
                'new-jersey', 'new-mexico', 'new-york', 'north-carolina', 'north-dakota', 'ohio',
                'oklahoma', 'oregon', 'pennsylvania', 'south-carolina', 'texas', 'utah', 'vermont',
                'virginia', 'washington', 'west-virginia', 'wisconsin', 'wyoming'];

const baseurl = 'https://covid-19-testing.github.io/locations/'; // add :state/complete.json

/* Part of fetch code in this function borrowed from:
  https://developers.google.com/web/updates/2015/03/introduction-to-fetch
*/

const getJson = async (url) => {

    const response = await fetch(url);
    if(!response.ok) {
        console.log(response.statusText);
        return;
    }

    const json = await response.json();

    let testingSites = [];
    json.forEach((obj) => {
        const name = obj.name;

        // Some testing sites do not have addresses :/
        let address;
        try {
            address = obj.physical_address[0].address_1 + " " + obj.physical_address[0].city + " " + obj.physical_address[0].state_province + " " + obj.physical_address[0].postal_code;
        } catch(error) {
            address = "";
        }

        const siteData = {
            name: name,
            address: address
        };
        testingSites.push(siteData);
    });

    return testingSites;

}

const covidtests = {};
covidtests.getData = async () => {

    let testingSites = [];
    for(const state of states) {
        const stateSites = await getJson(baseurl + state + "/complete.json");
        // Concatenate state data into testingSites array.
        testingSites = [...testingSites, ...stateSites];
    }

    console.log(testingSites);

}

module.exports = covidtests;
