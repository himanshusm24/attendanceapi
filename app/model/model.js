const express = require("express");

const routes = express.Router();

const db = require("./db");

routes.getAll = (req, res) => {
  db.query(req, (error, result) => {
    if (error) {
      console.log(error);
      res(
        {
          message: "Something went wrong, please try again",
          status: false,
          statucode: 500,
          data: error,
        },
        null
      );
    } else {
      res(null, {
        message: "Data fetched successfully",
        status: true,
        statucode: 200,
        data: result,
      });
    }
  });
};

module.exports = routes;
