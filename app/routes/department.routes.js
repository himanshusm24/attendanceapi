const express = require("express");

const router = express.Router();

const all_pages = require("./../controllers/department.controller");

const verifyJWT = require("./../middelware/jwt-toke");

const baseUrl = "/department";

router.post(baseUrl, all_pages.addDepartment);

router.get(baseUrl, all_pages.getDepartment);

router.put(baseUrl + "/:id", all_pages.updateDepartment);

router.delete(baseUrl + "/:id", all_pages.deleteDepartment);

module.exports = router;
