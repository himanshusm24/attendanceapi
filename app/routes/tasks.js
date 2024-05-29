const express = require("express");

const router = express.Router();

const all_pages = require("./../controllers/tasks");

const verifyJWT = require("../middelware/jwt-toke");

router.post("/addTask", verifyJWT, all_pages.addTask);

router.get("/getTask", verifyJWT, all_pages.getTasks);

router.get("/getTaskMob", verifyJWT, all_pages.getTasksMob);

router.put("/editTask/:id", verifyJWT, all_pages.editTasks);

router.put("/deleteTask/:id", verifyJWT, all_pages.deleteTasks);

router.post("/uploadAttachment", verifyJWT, all_pages.uploadTaskAttachment);

router.put(
  "/deleteAttachment/:attachmentId",
  verifyJWT,
  all_pages.deleteuploadTaskAttachment
);
router.put("/updateAttachement", verifyJWT, all_pages.updateTaskAttachment);

router.get("/dashboard", verifyJWT, all_pages.dashboard);

router.get("/mobDashboard", verifyJWT, all_pages.mobDashboard);

module.exports = router;
