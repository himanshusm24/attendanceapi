const express = require("express");

const router = express.Router();

const userTypeController = require("../controllers/userType");

const verifyJWT = require("../middelware/jwt-toke");

const baseUrl = "/user-type";

router.post(baseUrl, verifyJWT, userTypeController.addUserType);

router.put(baseUrl + "/:id", verifyJWT, userTypeController.editUserType);

router.get(baseUrl, verifyJWT, userTypeController.getUserType);

router.delete(baseUrl + "/:id", verifyJWT, userTypeController.deleteUserType);

module.exports = router;
