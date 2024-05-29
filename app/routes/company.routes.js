const express = require("express");

const router = express.Router();

const all_pages = require("./../controllers/company.controllers");

const baseUrl = "/company";

router.get(baseUrl, all_pages.getCompany);

router.post(baseUrl, all_pages.createCompany);

router.put(baseUrl + "/:id", all_pages.updateCompany);

router.delete(baseUrl + "/:id", all_pages.deleteCompany);

router.post(baseUrl + "/login", all_pages.login);

router.get(baseUrl + "/head", all_pages.getHeadCompany);

router.put(baseUrl + "/head/:id", all_pages.updateHeadCompany);

module.exports = router;
