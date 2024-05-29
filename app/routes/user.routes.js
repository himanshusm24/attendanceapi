const express = require("express");

const router = express.Router();

const all_pages = require("./../controllers/user.controllers");

const verifyJWT = require("./../middelware/jwt-toke");

const baseUrl = "/user";

router.post(baseUrl, all_pages.createUser);

router.put(baseUrl + "/:id", all_pages.updateUser);

router.delete(baseUrl + "/:id", all_pages.deleteUser);

router.post(baseUrl + "/login", all_pages.login);

router.post(baseUrl + "/adminLogin", all_pages.adminLogin);

router.put(baseUrl + "-profile-img/:id", all_pages.updateUserImage);

router.get(baseUrl + "/List", all_pages.getUserList);

router.get(baseUrl, verifyJWT, all_pages.getUser);

router.get(baseUrl + "-list", verifyJWT, all_pages.getUserForAdmin);

router.get(baseUrl + "/head", verifyJWT, all_pages.getHeadUsers);

module.exports = router;
