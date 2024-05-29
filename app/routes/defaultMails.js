const express = require("express");

const router = express.Router();

const all_pages = require("./../controllers/defaultMails");

const baseUrl = "/defaultMail";

router.post(baseUrl, all_pages.adddefaultMails);

router.get(baseUrl, all_pages.getDefaultMails);

router.put(baseUrl + "/:id", all_pages.updateDefaultMail);

router.delete(baseUrl + "/:id", all_pages.deleteDefaultMails);

module.exports = router;
