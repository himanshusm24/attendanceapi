const express = require("express");

const router = express.Router();

const permissionController = require("../controllers/userPermissionRelation");

const verifyJWT = require("../middelware/jwt-toke");

const baseUrl = "/user-permission-relation";

router.post(baseUrl, verifyJWT, permissionController.addUserPermissionRelation);

router.put(
  baseUrl + "/:id",
  verifyJWT,
  permissionController.editUserPermissionRelation
);

router.get(baseUrl, verifyJWT, permissionController.getUserPermissionRelation);

router.delete(
  baseUrl + "/:id",
  verifyJWT,
  permissionController.deleteUserPermissionRelation
);

router.post(
  baseUrl + "/setPermission",
  verifyJWT,
  permissionController.setUserPermissionRelation
);

module.exports = router;
