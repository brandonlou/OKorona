const express = require("express");
const path = require("path");
const foodbanks = require("./foodbanks");
const covidtests = require("./covidtests");
const common = require("./common.js");
const stores = require("./stores.js");
const mongo = require("mongodb").MongoClient;
const stdin = process.openStdin();
const ObjectId = require("mongodb").ObjectId;

const app = express();
app.use(express.json());

// Handles getting all values within a rectangular area.
app.post("/api/get_resource", async (req, res) => {
  const content = req.body;
  let trLon, trLat, blLon, blLat;
  try {
    trLon = parseFloat(content.trLon);
    trLat = parseFloat(content.trLat);
    blLon = parseFloat(content.blLon);
    blLat = parseFloat(content.blLat);
  } catch (err) {
    console.log(err);
    res
      .status(404)
      .send("Did not specify top right and/or bottom left coordinates.");
    return;
  }
  const locations = await getResourcesMongo([trLon, trLat], [blLon, blLat]);
  if (locations) {
    res.status(200).json(locations);
  } else {
    console.log("No locations");
    res.status(200).json({});
  }
});

// Handles user registration.
app.post("/api/register", async (req, res) => {
  const content = req.body;
  if (!content.username || !content.password || !content.email) {
    console.log("Did not specify username, password, or email.");
    res.status(404).send("Did not specify username, password, or email.");
  } else {
    const user = {
      username: content.username.toLowerCase(),
      password: content.password,
      email: content.email.toLowerCase(),
      upvotes: [],
      downvotes: [],
      theme: "Day",
    };
    const success = await addUserMongo(user);
    if (success) {
      res.status(200).send("User registration success!");
    } else {
      res.status(404).send("Registration error in MongoDB.");
    }
  }
});

// Handles logging in. Responds with the user ID and array of upvotes and dowvotes.
app.post("/api/login", async (req, res) => {
  const content = req.body;
  const username = content.username.toLowerCase();
  const password = content.password;
  const userInfo = await findUserMongo(username, password);
  if (userInfo) {
    console.log("Found user: " + username);
    res.status(200).json({
      id: userInfo._id,
      upvotes: userInfo.upvotes,
      downvotes: userInfo.downvotes,
      theme: userInfo.theme,
    });
  } else {
    console.log("Incorrect username or password.");
    res.status(404).send("Incorrect username or password.");
  }
});

// Handles logging in. Responds with the user ID and array of upvotes and dowvotes.
app.post("/api/set_theme", async (req, res) => {
  const content = req.body;
  const userID = content.userID;
  const theme = content.theme;
  console.log(theme + " " + userID);
  if (!userID || !theme) {
    console.log("No user or theme specified.");
    res.status(404).send("No user or theme specified.");
    return;
  }
  const success = await updateThemeMongo(userID, theme);
  if (success) {
    console.log("Update theme success!");
    res.status(200).send("Update theme success!");
  } else {
    console.log("Error updating theme in MongoDB.");
    res.status(404).send("Error updating theme in MongoDB.");
  }
});

// Handles adding a resource.
app.post("/api/add_resource", async (req, res) => {
  const content = req.body;
  const name = content.name;
  const type = content.type;
  const address = content.address;

  // Check each field has a value.
  if (!name || !type || !address) {
    console.log("Received bad data.");
    res.status(404).send("Received bad data.");
  } else {
    // Package data to be inserted into MongoDB.
    const coords = await common.convertAddressToCoords(address);
    console.log(coords);
    if (!coords) {
      res.status(404).send("Not a valid address.");
      return;
    }
    const resource = {
      name: name,
      type: type,
      address: address,
      location: {
        type: "Point",
        coordinates: [parseFloat(coords.lon), parseFloat(coords.lat)],
      },
      votes: 0,
    };
    const data = [resource];
    addResourceMongo(data);
    res.status(200).send("Success!");
  }
});

// Handles up voting.
app.post("/api/upvote", async (req, res) => {
  const content = req.body;
  const resourceID = content.resourceID;
  const userID = content.userID;

  // Check resourceID and userID are not null.
  if (!resourceID || !userID) {
    console.log("Received bad data");
    res.status(404).send("resourceID or userID invalid.");
  } else {
    const userVotes = await findVotesMongo(userID);
    // Make sure values are not null.
    if (!userVotes.downvotes) userVotes.downvotes = [];
    if (!userVotes.upvotes) userVotes.upvotes = [];

    // Remove resource from downvote list if in downvote list.
    if (userVotes.downvotes.includes(resourceID)) {
      userVotes.downvotes.splice(userVotes.downvotes.indexOf(resourceID), 1);

      // Do nothing if resource already upvoted by user.
    } else if (userVotes.upvotes.includes(resourceID)) {
      res.status(404).send("Resource already upvoted by user!");
      return;

      // Otherwise, add to upvote list.
    } else {
      userVotes.upvotes.push(resourceID);
    }

    await updateUserVotes(userID, userVotes);
    await updateResourceVotes(resourceID, -1);
    res.status(200).send("Upvote Success!");
  }
});

// Handles down voting.
app.post("/api/downvote", async (req, res) => {
  const content = req.body;
  const resourceID = content.resourceID;
  const userID = content.userID;

  // Check resourceID and userID are not null.
  if (!resourceID || !userID) {
    console.log("Received bad data");
    res.status(404).send("resourceID or userID invalid.");
  } else {
    const userVotes = await findVotesMongo(userID);
    // Make sure values are not null.
    if (!userVotes.downvotes) userVotes.downvotes = [];
    if (!userVotes.upvotes) userVotes.upvotes = [];

    // Remove resource from upvote list if in upvote list.
    if (userVotes.upvotes.includes(resourceID)) {
      userVotes.upvotes.splice(userVotes.upvotes.indexOf(resourceID), 1);

      // Do nothing if resource already upvoted by user.
    } else if (userVotes.downvotes.includes(resourceID)) {
      res.status(404).send("Resource already downvoted by user!");
      return;

      // Otherwise, add to upvote list.
    } else {
      userVotes.downvotes.push(resourceID);
    }

    await updateUserVotes(userID, userVotes);
    await updateResourceVotes(resourceID, 1);
    res.status(200).send("Downvote Success!");
  }
});

// Serve static assets if in production.
if (process.env.NODE_ENV === "production") {
  // Set static folder.
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

// Start up server.
let PORT = process.env.PORT;
if (PORT == null || PORT == "") {
  PORT = 9977;
}
app.listen(PORT, () => console.log(`Server has started on port ${PORT}.`));

// Command line options to update database.
stdin.addListener("data", async (input) => {
  const command = input.toString().trim();
  if (command === "f") {
    findVotesMongo("5ed6bc327c213e044cc115e3");
  }
});

const mongoURL =
  "mongodb://nodeClient:cs97isgreat@ds253388.mlab.com:53388/heroku_bvrv3598";

const updateThemeMongo = async (userID, theme) => {
  const client = await mongo
    .connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .catch((err) => {
      console.log(err);
      return false;
    });

  try {
    const db = client.db("heroku_bvrv3598");
    const collection = db.collection("Users");
    const query = { _id: new ObjectId(userID) };
    const newValues = { $set: { theme: theme } };
    const res = await collection.updateOne(query, newValues);
    console.log("MongoDB theme update successful!");
    client.close();
    return true;
  } catch (err) {
    console.log(err);
    client.close();
    return false;
  }
};

const updateResourceVotes = async (resourceID, amt) => {
  const client = await mongo
    .connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .catch((err) => {
      console.log(err);
      return;
    });
  try {
    const db = client.db("heroku_bvrv3598");
    const collection = db.collection("Resources");
    const query = { _id: new ObjectId(resourceID) };
    const newValues = { $inc: { votes: amt } };
    const res = await collection.updateOne(query, newValues);
    console.log("Update resource vote successful!");
  } catch (err) {
    console.log(err);
    return;
  } finally {
    client.close();
  }
};

const updateUserVotes = async (userID, votes) => {
  const client = await mongo
    .connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .catch((err) => {
      console.log(err);
      return;
    });
  try {
    const db = client.db("heroku_bvrv3598");
    const collection = db.collection("Users");
    const query = { _id: new ObjectId(userID) };
    const newValues = {
      $set: { upvotes: votes.upvotes, downvotes: votes.downvotes },
    };
    const res = await collection.updateOne(query, newValues);
    console.log("Update user votes successful!");
  } catch (err) {
    console.log(err);
    return;
  } finally {
    client.close();
  }
};

const findVotesMongo = async (userID) => {
  const client = await mongo
    .connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .catch((err) => {
      console.log(err);
      return null;
    });
  let votes = {};
  const id = new ObjectId(userID);
  try {
    const db = client.db("heroku_bvrv3598");
    const collection = db.collection("Users");
    const query = { _id: id };
    const res = await collection.findOne(query);
    if (res) {
      votes.upvotes = res.upvotes;
      votes.downvotes = res.downvotes;
    }
  } catch (err) {
    console.log(err);
    return null;
  } finally {
    client.close();
  }
  return votes;
};

const findUserMongo = async (username, password) => {
  const client = await mongo
    .connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .catch((err) => {
      console.log(err);
      return null;
    });

  let userID = null;

  try {
    const db = client.db("heroku_bvrv3598");
    const collection = db.collection("Users");
    const query = { username: username, password: password };
    const res = await collection.findOne(query);
    if (res) {
      userID = {
        _id: res._id,
        upvotes: res.upvotes,
        downvotes: res.downvotes,
        theme: res.theme,
      };
    }
  } catch (err) {
    console.log(err);
    return null;
  } finally {
    client.close();
  }

  return userID;
};

// Adds data to Resource collection in MongoDB. Data must be an array of objects.
const addResourceMongo = async (data) => {
  const client = await mongo
    .connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .catch((err) => {
      console.log(err);
      return null;
    });

  try {
    const db = client.db("heroku_bvrv3598");
    const collection = db.collection("Resources");
    await collection.insertMany(data);
    console.log("Successfully inserted data into database.");
  } catch (err) {
    console.log(err);
  } finally {
    client.close();
  }
};

// Adds a single user to the Users collection.
const addUserMongo = async (data) => {
  const client = await mongo
    .connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .catch((err) => {
      console.log(err);
      return false;
    });

  try {
    const db = client.db("heroku_bvrv3598");
    const collection = db.collection("Users");
    await collection.insertOne(data);
    console.log("Successfully added user into database.");
    client.close();
    return true;
  } catch (err) {
    console.log(err);
    client.close();
    return false;
  }
};

const getResourcesMongo = async (topRight, botLeft) => {
  const client = await mongo
    .connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .catch((err) => {
      console.log(err);
      return null;
    });

  let resources = null;

  try {
    const db = client.db("heroku_bvrv3598");
    const collection = db.collection("Resources");
    const query = {
      location: {
        $geoWithin: {
          $box: [
            [topRight[0], topRight[1]],
            [botLeft[0], botLeft[1]],
          ],
        },
      },
    };
    const res = await collection.find(query).toArray();
    console.log("Found nearby resources: " + res.length);
    resources = res;
  } catch (err) {
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

const updateFoodbankData = async () => {
  const data = await foodbanks.getData();
  await addResourceMongo(data);
  console.log("Update foodbank data success!");
};

const updateStoreData = async () => {
  const data = await stores.getData();
  await addResourceMongo(data);
  console.log("Update store data success!");
};
