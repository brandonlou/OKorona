const fetch = require("node-fetch");
const common = require('./common');

const states = [
  "alabama",
  "alaska",
  "arizona",
  "arkansas",
  "california",
  "colorado",
  "connecticut",
  "delaware",
  "florida",
  "georgia",
  "hawaii",
  "idaho",
  "illinois",
  "indiana",
  "iowa",
  "kansas",
  "kentucky",
  "louisiana",
  "maine",
  "maryland",
  "massachusetts",
  "michigan",
  "minnesota",
  "mississippi",
  "missouri",
  "montana",
  "nebraska",
  "nevada",
  "new-hampshire",
  "new-jersey",
  "new-mexico",
  "new-york",
  "north-carolina",
  "north-dakota",
  "ohio",
  "oklahoma",
  "oregon",
  "pennsylvania",
  "south-carolina",
  "texas",
  "utah",
  "vermont",
  "virginia",
  "washington",
  "west-virginia",
  "wisconsin",
  "wyoming"
];

const baseurl = "https://covid-19-testing.github.io/locations/"; // add :state/complete.json

// /* Part of fetch code in this function borrowed from:
//   https://developers.google.com/web/updates/2015/03/introduction-to-fetch
// */

const getJson = async (url) => {

  const res = await fetch(url);
  if (!res.ok) {
    console.log(res.statusText);
    return;
  }
  const json = await res.json();

  let testingSites = [];
  for(const obj of json) {
    const name = obj.name;
    let addressString;

    try {
      const address = obj.physical_address[0];
      addressString = address.address_1 + " " + address.city + " " + address.state_province + " " + address.postal_code;
    } catch(err) { // No address specified for particular testing site.
      console.log(err);
      continue;
    }

    const coords = await common.convertAddressToCoords(addressString);
    
    // Cannot get coordinates from address.
    if(!coords) {
      continue;
    }

    const siteData = {
      name: name,
      type: "testing_site",
      address: addressString,
      location: {
        type: "Point",
        coordinates: [parseFloat(coords.lon), parseFloat(coords.lat)]
      },
      votes: 0
    };

    console.log(siteData);
    testingSites.push(siteData);

  }
    
  return testingSites;
};

const covidtests = {};
covidtests.getData = async () => {
  let testingSites = [];
  for (const s of states) {
    const stateSites = await getJson(baseurl + s + "/complete.json");
    // Concatenate state data into testingSites array.
    testingSites = [...testingSites, ...stateSites];
  }
  return testingSites;
};

module.exports = covidtests;