const express = require('express');
const foodbanks = require('./foodbanks');

const app = express();

app.get('/', (req, res) => {
    res.send('Server is up and running');
});

app.get('/foodbanks/:zipcode', (req, res) => {
    const zipcode = req.params;
    console.log(zipcode);
    console.log("hi");
});

const PORT = process.env.PORT || 9797;
app.listen(PORT, () => console.log(`Server has started on port ${PORT}`));

(async () => {
    const localFoodbanks = await foodbanks.getData(90054);
    console.log(localFoodbanks);
})()