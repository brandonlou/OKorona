const express = require('express');
const path = require('path');
const foodbanks = require('./foodbanks');

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
    // Set static folder
    app.use(express.static('client/build'));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

let PORT = process.env.PORT;
if(PORT == null || PORT == "") {
    PORT = 9977;
}
app.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
