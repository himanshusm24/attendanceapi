const express = require("express");

const router = express.Router();

const verifyJwt = require("../middelware/jwt-toke");

const all_pages = require("./../controllers/projects");

router.post("/addProject", verifyJwt, all_pages.addProject);

router.post("/addProjectMob", verifyJwt, all_pages.addProjectMob);

router.post("/addSubProject", verifyJwt, all_pages.addSubProject);

router.get("/getProject", verifyJwt, all_pages.getProjects);

// router.get("/getProjectSearch", verifyJwt, all_pages.projectSearch);

router.get("/subProject", verifyJwt, all_pages.subprojects);

router.get("/getSubProject", verifyJwt, all_pages.getSubProjects);

router.put("/editProject/:id", verifyJwt, all_pages.editProject);

router.put("/deleteProject/:id", verifyJwt, all_pages.deleteProject);

router.put("/deleteMainProject/:id", verifyJwt, all_pages.deleteMainProject);

router.post("/allocateUser", verifyJwt, all_pages.allocateProjectUser);

router.get(
  "/getallocatedProjectUser",
  verifyJwt,
  all_pages.getAllocatedProjectUsers
);

router.get(
  "/getallocatedProjectUserassingee",
  verifyJwt,
  all_pages.allocatedAssigneeUsers
);

router.put(
  "/deleteAllocatedProjectUser/:id",
  verifyJwt,
  all_pages.deleteAllocateProjectUsers
);

module.exports = router;
