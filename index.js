const express = require("express");

const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

const morgan = require("morgan");

require("dotenv").config();

const connection = require("./app/model/db");

const all_pages = require("./app/routes/index");

const error_page = require("./app/middelware/error");

const path = require("path");

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.use(express.json());

app.use(morgan("dev"));

// connection.connect(function (err, res) {
//     if (err) {
//         console.error('Please check our Database connection');
//         throw new Error;
//         return false;
//     } else {
//         console.log('Database connection established successfully');
//     }
// });

app.use(all_pages);

app.get("/", (req, res) => {
  res.status(200).send({
    message: "Project running successfully",
    status: true,
    data: [],
  });
});

app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

app.use(error_page);

module.exports = app;
