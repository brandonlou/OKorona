const express = require('express');
const path = require('path');
const foodbanks = require('./foodbanks');
const covidtests = require('./covidtests');
const mongo = require('mongodb').MongoClient;
const stdin = process.openStdin();

const app = express();
app.use(express.json());

// Handles getting all values within a zipcode.
app.get('/api/get_resource', async (req, res) => {
    const content = req.body;
    const localFoodbanks = await foodbanks.getData(zipcode);
    res.json(localFoodbanks);
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
app.post('/api/add_resource', (req, res) => {
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
        let data = [];
        const resource = {
            name: name,
            type: type,
            address: address
        }
        data.push(resource);
        console.log("Received: " + data);
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
stdin.addListener("data", (input) => {
    const command = input.toString().trim();
    if(command === "f") {
        updateCovidTestingData();
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
const addResourceMongo = (data) => {
    mongo.connect(mongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, (err, client) => {
        if(err) {
            console.error(err);
            return;
        }
        const db = client.db("heroku_bvrv3598");
        db.collection("Resources").insertMany(data, (err, result) => {
            if(err) {
                console.error(err);
                return;
            }
            client.close();
            console.log("Successfully inserted data into database.");
        });
    });
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

const updateCovidTestingData = async () => {
    const data = await covidtests.getData();
    await addResourceMongo(data);
    console.log("Update covid testing data success!");
}

const updateFoodbankData = () => {
    mongo.connect(mongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, (err, client) => {
        if(err) {
            console.error(err);
            return;
        }
        const db = client.db("heroku_bvrv3598");
        let localFoodbanks;
        (async () => {
            localFoodbanks = await foodbanks.getData(90054);
            console.log(localFoodbanks);
            db.collection("Resources").insertMany(localFoodbanks, (err, result) => {
                if(err) {
                    console.error(err);
                    return;
                }
                console.log("Inserted!");
                client.close();
            });
        })()
    });
}