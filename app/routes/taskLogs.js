const express = require("express");

const router = express.Router();

const verifyJwt = require("../middelware/jwt-toke");

const all_pages = require("./../controllers/taskLogs");

router.post("/create", verifyJwt, all_pages.createLog);

router.get("/getTaskLog", verifyJwt, all_pages.getTaskLogs);

module.exports = router;
