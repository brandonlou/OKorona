const fs = require('fs');

let stores = {};
stores.getData = async () => {
    let listOfStores = [];
    let data;

    try {
        data = await fs.readFileSync('./whole_foods.json', 'utf8');
    } catch(err) {
        console.log(err);
        return [];
    }

    const wholeFoods = await JSON.parse(data);

    for(const s of wholeFoods) {
        const name = "Whole Foods | " + s.name;
        const address = s.location.address.line1 + " " + s.location.address.city + " " + s.location.address.state + " " + s.location.address.postalCode;
        const lon = s.location.geometry.coordinates[0];
        const lat = s.location.geometry.coordinates[1];
        const location = {
            name: name,
            type: "store",
            address: address,
            location: {
                type: "Point",
                coordinates: [lon, lat]
            },
            votes: 0
        };
        listOfStores.push(location);
    }

    return listOfStores;

}

module.exports = stores;