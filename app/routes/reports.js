const express = require("express");

const router = express.Router();

const all_pages = require("./../controllers/reports");

router.post("/dailyAttendanceReport", all_pages.DailyAttendanceReport);

module.exports = router;
