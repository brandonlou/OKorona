const express = require('express');
const path = require('path');
const foodbanks = require('./foodbanks');
const covidtests = require('./covidtests');
const mongo = require('mongodb').MongoClient;
const stdin = process.openStdin();

const app = express();

app.get('/foodbanks/:zipcode', (req, res) => {
    const zipcode = req.params.zipcode;
    console.log(zipcode);
    (async () => {
        const localFoodbanks = await foodbanks.getData(zipcode);
        res.json(localFoodbanks);
    })()
});

// Serve static assets if in production.
if(process.env.NODE_ENV === 'production') {
    // Set static folder.
    app.use(express.static('client/build'));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

let PORT = process.env.PORT;
if(PORT == null || PORT == "") {
    PORT = 9977;
}
app.listen(PORT, () => console.log(`Server has started on port ${PORT}.`));

stdin.addListener("data", (input) => {
    const command = input.toString().trim();
    if(command === "updateFoodbank") {
        updateFoodbankData();
    } else if(command === "u") {
        covidtests.getData();
    }
});


const mongoURL = "mongodb://nodeClient:cs97isgreat@ds253388.mlab.com:53388/heroku_bvrv3598";
const updateFoodbankData = () => {
    console.log("hi");
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