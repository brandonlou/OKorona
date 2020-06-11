/*
 * The common.js module includes common functions that other server related modules may use.
 */

const fetch = require("node-fetch");

const common = {};

common.convertAddressToCoords = async (address) => {

    // Sleep for 2 seconds before continuing to prevent massive requests to OSM.
    await new Promise(r => setTimeout(r, 2000));
  
    // No address specified.
    if(!address) {
      return null;
    }
  
    // Convert whitespace to %20 for and remove #[num]
    address = await address.replace(/\s+/g, "%20");
    // address = await address.replace(/#.*\s/, "%20");
  
    let res;
    try {
      res = await fetch("https://nominatim.openstreetmap.org/search?q=" + address + "&format=json");
    } catch(err) {
      console.log(err);
      return null;
    }
  
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

module.exports = common;