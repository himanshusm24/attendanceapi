const express = require('express');

const route = express.Router();

const all_pages = require('../controllers/admin.controllers');

const adminbaseUrl = "/admin";

route.post(adminbaseUrl + "/login", all_pages.login);

module.exports = route;