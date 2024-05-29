const express = require("express");

const router = express.Router();

const all_pages = require("../controllers/user-leave.controller");

const verifyJWT = require("../middelware/jwt-toke");

const baseUrl = "/user-leave";

router.post(baseUrl, verifyJWT, all_pages.applyLeave);

router.put(baseUrl + "/approve/:id", verifyJWT, all_pages.approveLeave);

router.get(baseUrl + "/list", verifyJWT, all_pages.leaveList);

module.exports = router;
