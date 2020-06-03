const express = require('express');
const path = require('path');
const foodbanks = require('./foodbanks');
const covidtests = require('./covidtests');
const common = require('./common.js');
const mongo = require('mongodb').MongoClient;
const stdin = process.openStdin();

const app = express();
app.use(express.json());

// Handles getting all values within a rectangular area.
app.get('/api/get_resource', async (req, res) => {
    const content = req.body;
    const topRight = content.topRight;
    const botLeft = content.botLeft;

    if(!topRight || !botLeft) {
        console.log("Did not specify top right and/or bottom left coordinate.");
        res.json();
        return;
    }

    const locations = await getResourcesMongo(topRight, botLeft);
    if(locations) {
        res.json(locations);

    } else {
        console.log("No locations");
        res.json();
    }

});

// Handles logging in. Responds with the user ID.
app.post('/api/login', async (req, res) => {
    const content = req.body;
    const username = content.username;
    const password = content.password;
    const userID = await findUserMongo(username, password);
    if(userID) {
        console.log("Found user ID: " + userID);
        res.send(userID);
    } else {
        console.log("Could not find user ID.");
        res.send("Error");
    }
});

// Handles adding a resource.
app.post('/api/add_resource', async (req, res) => {
    const content = req.body;
    const name = content.name;
    const type = content.type;
    const address = content.address;

    // Check each field has a value.
    if(!name || !type || !address) {
        console.log("Received bad data.");
        res.send("Error");

    } else {
        // Package data to be inserted into MongoDB.
        const coords = await common.convertAddressToCoords(address);
        console.log(coords);
        if(!coords) {
            res.send("Error");
            return;
        }
        const resource = {
            name: name,
            type: type,
            address: address,
            location: {
                type: "Point",
                coordinates: [parseFloat(coords.lon), parseFloat(coords.lat)]
            },
            votes: 0
        }
        const data = [resource];
        addResourceMongo(data);
        res.send("Success!");
    }
});

// Handles thumbs up and down.
app.post('/api/vote', (req, res) => {
    const content = req.body;
    const resourceID = content.id;
    const value = content.value;

    // Check resource ID is not null and value is a number.
    if(!resourceID || isNaN(value)) {
        console.log("Received bad data");
        res.send("Error!");
    } else {
        updateResourceMongo(resourceID, value);
        res.send("Success!");
    }
});

// Serve static assets if in production.
if(process.env.NODE_ENV === 'production') {
    // Set static folder.
    app.use(express.static('client/build'));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

// Start up server.
let PORT = process.env.PORT;
if(PORT == null || PORT == "") {
    PORT = 9977;
}
app.listen(PORT, () => console.log(`Server has started on port ${PORT}.`));

// Command line options to update database.
stdin.addListener("data", async (input) => {
    const command = input.toString().trim();
    if(command === "f") {
        updateCovidTestingData();
        // const hi = await getResourcesMongo([-122.522060, 37.807606], [-122.356954, 37.707973]);
        // console.log(hi);
    }
});

const mongoURL = "mongodb://nodeClient:cs97isgreat@ds253388.mlab.com:53388/heroku_bvrv3598";

const findUserMongo = async (username, password) => {
    
    const client = await mongo.connect(mongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).catch((err) =>{
        console.log(err);
        return null;
    });

    let userID = null;

    try {
        const db = client.db("heroku_bvrv3598");
        const collection = db.collection("Users");
        const query = { "username": username, "password": password };
        const res = await collection.findOne(query);
        if(res) {
            userID = res._id;
        }
        
    } catch(err) {
        console.log(err);
        return null;
    } finally {
        client.close();
    }

    return userID;

};

// Adds data to Resource collection in MongoDB. Data must be an array of objects.
const addResourceMongo = async (data) => {

    const client = await mongo.connect(mongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).catch((err) =>{
        console.log(err);
        return null;
    });

    try {
        const db = client.db("heroku_bvrv3598");
        const collection = db.collection("Resources");
        await collection.insertMany(data);
        console.log("Successfully inserted data into database.");
    } catch(err) {
        console.log(err);
    } finally {
        client.close();
    }

}

// Updates number of upvotes by resource ID. num must be a number.
const updateResourceMongo = (id, num) => {
    mongo.connect(mongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, (err, client) => {
        if(err) {
            console.error(err);
            return;
        }
        const db = client.db("heroku_bvrv3598");
        const query = { "_id" : ObjectId(id) };
        const newValue = { $set: {votes: num} }
        db.collection("Resources").updateOne(query, newValue, (err, result) => {
            if(err) {
                console.error(err);
                return;
            }
            client.close();
            console.log("Successfully updated database.");
        });
    });
};

const getResourcesMongo = async (topRight, botLeft) => {
    const client = await mongo.connect(mongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).catch((err) =>{
        console.log(err);
        return null;
    });

    let resources = null;

    try {
        const db = client.db("heroku_bvrv3598");
        const collection = db.collection("Resources");
        const query = {"location": {"$geoWithin": {"$box": [[topRight[0], topRight[1]], [botLeft[0], botLeft[1]]]}}};
        const res = await collection.find(query).toArray();
        console.log("Found nearby resources: " + res.length);
        resources = res;
        
    } catch(err) {
        console.log(err);

    } finally {
        client.close();
    }

    return resources;

};

const updateCovidTestingData = async () => {
    const data = await covidtests.getData();
    await addResourceMongo(data);
    console.log("Update covid testing data success!");
};

// const updateFoodbankData = () => {
//     mongo.connect(mongoURL, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true
//     }, (err, client) => {
//         if(err) {
//             console.error(err);
//             return;
//         }
//         const db = client.db("heroku_bvrv3598");
//         let localFoodbanks;
//         (async () => {
//             localFoodbanks = await foodbanks.getData(90054);
//             console.log(localFoodbanks);
//             db.collection("Resources").insertMany(localFoodbanks, (err, result) => {
//                 if(err) {
//                     console.error(err);
//                     return;
//                 }
//                 console.log("Inserted!");
//                 client.close();
//             });
//         })()
//     });
// }