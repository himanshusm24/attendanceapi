const express = require('express');

const app = express();

const all_pages = require('./index');

const port = process.env.PORT || 3008;

app.use(all_pages);

app.listen(port, (req, res) => {
    console.log("Project listening on port " + port);
});