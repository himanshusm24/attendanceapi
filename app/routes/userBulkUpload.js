const express = require("express");

const router = express.Router();

const all_pages = require("./../controllers/userBulkUpload");

const { upload } = require("../middelware/fileUpload");

router.post("/bulkImport", upload.single("filename"), all_pages.BulkUploadUser);

router.get("/sampleCSVUser", all_pages.sampleCSV);

module.exports = router;
