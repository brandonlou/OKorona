/*
  States for which data is not available:
  Rhode Island, Tennesse, South Dakota
*/


const fs = require('fs');
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

let getJson = function(url) {
  fetch(url)
  .then(
      (response) => {
        if (response.status !== 200) {
          console.log('Could\'t fetch data successfully ' + response.status);
          return;
        }

        // If we received an OK, append the text to our locations file
        response.json().then((data) => {
          fs.appendFile('locations.txt', JSON.stringify(data, '\n'), (err) => {
              if (err) throw err;
          });
        });
      }
    )
    .catch((err) => {
      console.log('Fetch Error :-S', err);
    });
}

for (const state of states) {
  getJson(baseurl + state + '/complete.json');
}
