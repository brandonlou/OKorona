/*
  When executed, this script fetches the latest testing center location data from the covid19-api
  For now, writing to files is handled here itself
  The plan is to instead pipe the output to a Python script which can take care of writing to file
*/

const fs = require('fs');
const fetch = require('node-fetch');

const states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
                 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 
                'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
                'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 
                'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 
                'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 
                'South Carolina', 'South Dakota', 'Tennesse', 'Texas', 'Utah', 'Vermont', 'Virginia', 
                'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];

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
          fs.appendFile('locations.txt', JSON.stringify(data), (err) => {
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
