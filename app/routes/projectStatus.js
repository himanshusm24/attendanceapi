const express = require("express");

const router = express.Router();

const verifyJwt = require("../middelware/jwt-toke");

const all_pages = require("./../controllers/projectStatus");

router.post("/addProjectStatus", verifyJwt, all_pages.addProjectStatus);

router.get("/getProjectStatus", verifyJwt, all_pages.getProjectStatus);

router.put("/editProjectStatus/:id", verifyJwt, all_pages.editProjectStatus);

router.put(
  "/deleteProjectStatus/:id",
  verifyJwt,
  all_pages.deleteProjectStatus
);

module.exports = router;
