const fetch = require("node-fetch");

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
  "wyoming",
];

const baseurl = "https://covid-19-testing.github.io/locations/"; // add :state/complete.json

// /* Part of fetch code in this function borrowed from:
//   https://developers.google.com/web/updates/2015/03/introduction-to-fetch
// */

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
const convertAddressToCoords = async (address) => {
  await sleep(2000);
  if (address == "") {
    return {
      lat: 0.0,
      lon: 0.0,
    };
  }

  address = address.replace(/\s/g, "%20");
  const response = await fetch(
    "https://nominatim.openstreetmap.org/search?q=" +
      address +
      "&email=ashleytz@g.ucla.edu&format=json&"
  ).then(await sleep(2000));
  if (!response.ok) {
    console.log(response.statusText);
    return;
  }
  const json = await response.json();
  const lat = json[0].lat;
  const lon = json[0].lon;
  return {
    lat: lat,
    lon: lon,
  };
};
const getJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    console.log(response.statusText);
    return;
  }

  const json = await response.json();

  let testingSites = [];
  json.forEach(async (obj) => {
    const name = obj.name;

    // Some testing sites do not have addresses :/
    let address;
    try {
      address =
        obj.physical_address[0].address_1 +
        " " +
        obj.physical_address[0].city +
        " " +
        obj.physical_address[0].state_province +
        " " +
        obj.physical_address[0].postal_code;
    } catch (error) {
      address = "";
    }
    await sleep(2000);
    const coords = await convertAddressToCoords(address);
    await sleep(2000);
    console.log(coords);
    if (!coords) return;
    const siteData = {
      type: "testing_site",
      name: name,
      address: address,
      lat: coords.lat,
      lon: coords.lon,
    };
    testingSites.push(siteData);
  });
  return testingSites;
};

const covidtests = {};
covidtests.getData = async () => {
  let testingSites = [];
  for (const state of states) {
    const stateSites = await getJson(baseurl + state + "/complete.json");
    // Concatenate state data into testingSites array.
    testingSites = [...testingSites, ...stateSites];
  }
  return testingSites;
};
covidtests.getData();

console.log("Success");
//module.exports = covidtests;

// console.log("Sleep Loop");
// (async () => {
//   for (let i = 0; i < 100; i++) {
//     console.log("Sleep");
//     await sleep(5000);
//   }
// })();
