const express = require("express");

const router = express.Router();

const verifyJwt = require("../middelware/jwt-toke");

const all_pages = require("../controllers/userdailylocation");

router.post("/punchIn", verifyJwt, all_pages.punchIn);

router.post("/punchOut", verifyJwt, all_pages.punchOut);

router.get("/allVisits", verifyJwt, all_pages.getVisitDetails);

module.exports = router;
