const express = require("express");

const router = express.Router();

const all_pages = require("./../controllers/roles.controller");

const verifyJWT = require("./../middelware/jwt-toke");

const baseUrl = "/roles";

router.post(baseUrl, verifyJWT, all_pages.addRoles);

router.get(baseUrl, verifyJWT, all_pages.getRoles);

router.put(baseUrl + "/:id", verifyJWT, all_pages.updateRoles);

router.delete(baseUrl + "/:id", verifyJWT, all_pages.deleteRoles);

module.exports = router;
