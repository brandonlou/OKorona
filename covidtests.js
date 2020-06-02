const fetch = require("node-fetch");

const states = [
  "alabama",
  "alaska",
  "arizona",
  "arkansas",
  "california"/*,
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
  "wyoming", */
];

const baseurl = "https://covid-19-testing.github.io/locations/"; // add :state/complete.json

// /* Part of fetch code in this function borrowed from:
//   https://developers.google.com/web/updates/2015/03/introduction-to-fetch
// */

const convertAddressToCoords = async (address) => {

  // Sleep for 2 seconds before continuing to prevent massive requests to OSM.
  await new Promise(r => setTimeout(r, 2000));

  // No address specified.
  if(!address) {
    return null;
  }

  // Convert whitespace to %20 for and remove #[num]
  address = await address.replace(/\s+/g, "%20");
  address = await address.replace(/#.*\s/, "%20");

  const res = await fetch("https://nominatim.openstreetmap.org/search?q=" + address + "&format=json");

  if(!res.ok) {
      console.log(res.statusText);
      return null;
  }

  let data;
  try { // Try to parse JSON response.
    data = await res.json();
  } catch(err) {
    console.log(err);
    return null;
  }

  const location = data[0]; // Get first search result.

  // Location exists!
  if(location) {
      return {
        lat: location.lat,
        lon: location.lon
      }

  // Location doesn't exist :(
  } else {
      console.log(address + " not found on OSM!");
      return null;
  }

};

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
    const address = obj.physical_address[0];
    let addressString;

    try {
      addressString = address.address_1 + " " + address.city + " " + address.state_province + " " + address.postal_code;
    } catch(err) { // No address specified for particular testing site.
      console.log(err);
      continue;
    }

    const coords = await convertAddressToCoords(addressString);
    
    // Cannot get coordinates from address.
    if(!coords) {
      continue;
    }

    const siteData = {
      type: "testing_site",
      name: name,
      address: addressString,
      location: {
        type: "Point",
        coordinates: [coords.lat, coords.lon]
      }
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