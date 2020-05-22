const express = require('express');
const foodbanks = require('./foodbanks');

const app = express();

// Apparently if you comment the function below it still works (???)
app.get('/', (req, res) => {
    res.send('Server is up and running');
});

app.get('/foodbanks/:zipcode', (req, res) => {
    const zipcode = req.params.zipcode;
    console.log(zipcode);
    (async () => {
        const localFoodbanks = await foodbanks.getData(zipcode);
        res.json(localFoodbanks);
    })()
});

const PORT = process.env.PORT || 9797;
app.listen(PORT, () => console.log(`Server has started on port ${PORT}`));