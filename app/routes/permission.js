const express = require("express");

const router = express.Router();

const permissionController = require("../controllers/permission");

const verifyJWT = require("../middelware/jwt-toke");

const baseUrl = "/permission";

router.post(baseUrl, verifyJWT, permissionController.addPermission);

router.put(baseUrl + "/:id", verifyJWT, permissionController.editPermission);

router.get(baseUrl, verifyJWT, permissionController.getPermission);

router.delete(
  baseUrl + "/:id",
  verifyJWT,
  permissionController.deletePermission
);

router.get(
  baseUrl + 
  "/allowedRoles",
  verifyJWT,
  permissionController.allowedroles
);

module.exports = router;
