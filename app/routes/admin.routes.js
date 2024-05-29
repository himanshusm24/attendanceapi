const express = require("express");

const app = express();

const route = express.Router();

const all_pages = require("./../controllers/admin.controllers");

const verifyJWT = require("./../middelware/jwt-toke");

const baseUrl = "/admin";

route.get(baseUrl, all_pages.getAdmin);

route.put(baseUrl + "/:id", all_pages.updateAdmin);

route.post(baseUrl + "/verify-otp", all_pages.verifyOtp);

module.exports = route;
