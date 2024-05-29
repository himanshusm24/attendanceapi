const express = require("express");

const routes = express.Router();

const attendanceList = require("../controllers/attendance-list.controllers");

const baseUrl = "/attendance-list";

const verifyJWT = require("./../middelware/jwt-toke");

routes.use(verifyJWT);

routes.post(baseUrl, attendanceList.GetAttendanceList);

routes.get(baseUrl , attendanceList.GetAttendanceCount);

routes.post(baseUrl + "/dashboard", attendanceList.GetAttendanceListDashboard);

module.exports = routes;
