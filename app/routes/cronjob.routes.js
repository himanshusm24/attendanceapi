const express = require("express");

const router = express.Router();

const all_pages = require("../controllers/cronjob.controller");

const baseUrl = "/mark-attendance";

router.get(baseUrl, all_pages.MarkAllUsersAbsent);

router.get(baseUrl + "/ClockoutAllUsers", all_pages.ClockOutAllUsers);

module.exports = router;
