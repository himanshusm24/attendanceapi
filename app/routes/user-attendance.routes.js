const express = require('express');

const router = express.Router();

const all_pages = require('./../controllers/user-attendance.controllers');

const baseUrl = "/attendance";

const verifyJWT = require('./../middelware/jwt-toke');

router.use(verifyJWT);

router.get(baseUrl, all_pages.getAttendacneDetails);

router.post(baseUrl + "/daily-log", all_pages.getAttendacneDailyLog);

router.post(baseUrl + "/check-in", all_pages.checkIn);

router.post(baseUrl + "/check-out", all_pages.checkOut);

router.post(baseUrl + "/monthly-log", all_pages.getAttendacneMonthlyLog);

router.post(baseUrl + "/break-in", all_pages.breakIn);
router.post(baseUrl + "/break-out", all_pages.breakOut);
router.post(baseUrl + "/breakTime", all_pages.getBreakIn);
router.post(baseUrl + "/breakUpdate", all_pages.BreakUpdate);

router.post(baseUrl + "/break-time", all_pages.BreakTime);
router.get(baseUrl + "/total-break-time", all_pages.TotalBreakTime);

module.exports = router;