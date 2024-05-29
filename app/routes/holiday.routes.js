const express = require("express");

const router = express.Router();

const all_pages = require("./../controllers/holiday.controllers");

const verifyJWT = require("./../middelware/jwt-toke");

const baseUrl = "/holiday";

router.get(baseUrl, verifyJWT, all_pages.getHoliday);

router.post(baseUrl, verifyJWT, all_pages.createHoliday);

router.put(baseUrl + "/:id", verifyJWT, all_pages.updateHoliday);

router.delete(baseUrl + "/:id",verifyJWT, all_pages.deleteHoliday);

module.exports = router;
