const db = require("../model/db");

const decodeBase64Image = require("./../middelware/base64toimage");

const image_path = "uploads/taskAttachment/";

const moment = require("moment");

const { uploadAnyFile } = require("../middelware/fileUpload");

exports.addTask = async (req, res) => {
  const createdBy = req.userData.userData.data[0].id;
  const {
    description,
    due_date,
    assigned_to,
    created_by,
    project_id,
    issue_type,
    priority,
    reporter,
    summary,
  } = req.body;
  try {
    let projectName;
    const projectData = await db.query(
      "SELECT * FROM projects WHERE project_id = ?",
      [project_id],
      (err, resp) => {
        if (err) {
          console.log(err);
        } else {
          if (resp && resp.length == 0) {
            return res
              .status(500)
              .json({ message: "First select project", data: "" });
          }

          if (
            (!resp[0].parent_project_id &&
              resp[0].parent_project_id == undefined) ||
            resp[0].parent_project_id == null
          ) {
            projectName = resp[0]?.project_name;
            console.log("elseprojectName: ", projectName);
          } else {
            db.query(
              `SELECT p.*, parent.project_id AS parentProjectId, parent.project_name AS parent_project_name
                FROM projects p
                JOIN projects parent ON p.parent_project_id = parent.project_id
                WHERE p.project_id = ?`,
              [project_id],
              (err, newresp) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log("parentProjectIDData", newresp);
                  projectName = newresp[0]?.parent_project_name;
                  console.log("ifprojectName: ", projectName);
                }
              }
            );
          }
          db.query(
            "INSERT INTO tasks (description, due_date, assigned_to, created_by, project_id, issue_type, priority, reporter, summary, task_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              description,
              due_date,
              assigned_to,
              createdBy,
              project_id,
              issue_type,
              priority,
              reporter,
              summary,
              "Open",
            ],
            (err, result) => {
              if (err) {
                console.log(err);
              } else {
                let updateqry = `UPDATE tasks SET task_name = ? WHERE task_id = ?`;
                console.log("projectName: ", projectName);
                let values = [
                  projectName[0] + "-" + result.insertId,
                  result.insertId,
                ];
                // console.log("updateqry: ", updateqry);
                db.query(updateqry, values, (err, newresult) => {
                  if (err) {
                    console.error("Error updating task:", err);
                  } else {
                    // console.log("Task updated successfully!");
                    return res.status(201).json({
                      message: "Task created successfully",
                      data: result,
                    });
                  }
                });
              }
            }
          );
          // }
        }
      }
    );
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const project_id = req.query.project_id;
    const sub_project_Id = req.query.sub_project_Id;
    const task_id = req.query.task_id;
    const user_id = req.query.user_id;
    const reporter = req.query.reporter;
    const task_status = req.query.task_status;
    const task_name = req.query.task_name;
    const created_to_date = req.query.created_to_date;
    const created_from_date = req.query.created_from_date;

    let qry = `SELECT tasks.*,
        assigned_to_user.name AS assigned_to_name,
        reporter_user.name AS reporter_name,
        projects.project_name AS subProject,
        CASE
          WHEN projects.parent_project_id IS NOT NULL THEN projects.parent_project_id
          ELSE projects.project_id
        END AS subProjectId,
        parent_project.project_name AS mainProject
    FROM
        tasks
    LEFT JOIN
        users AS assigned_to_user ON tasks.assigned_to = assigned_to_user.id
    LEFT JOIN
        users AS reporter_user ON tasks.reporter = reporter_user.id
    LEFT JOIN
        projects ON tasks.project_id = projects.project_id
    LEFT JOIN
        projects AS parent_project ON projects.parent_project_id = parent_project.project_id
    WHERE
        tasks.status = 0`;
    if (project_id) {
      qry += ` AND (tasks.project_id = ${project_id} OR projects.parent_project_id = ${project_id})`;
    }
    if (sub_project_Id) {
      qry += ` AND projects.parent_project_id = ${sub_project_Id}`;
    }
    if (task_name) {
      qry += ` AND tasks.task_name LIKE '%${task_name}%'`;
    }
    if (task_id && task_id != undefined && task_id != "") {
      qry += ` AND tasks.task_id = ${task_id}`;
    }
    if (user_id) {
      qry += ` AND tasks.assigned_to = ${user_id}`;
    }
    if (reporter) {
      qry += ` AND tasks.reporter = ${reporter}`;
    }
    if (task_status) {
      qry += ` AND tasks.task_status = ${task_status}`;
    }

    if (created_to_date && created_from_date) {
      const startDateTime = `${moment(created_from_date).format(
        "YYYY-MM-DD"
      )} 00:00:00`;
      const endDateTime = `${moment(created_to_date).format(
        "YYYY-MM-DD"
      )} 23:59:59`;

      qry += ` AND tasks.created_at BETWEEN '${startDateTime}' AND '${endDateTime}'`;
    }

    qry += " ORDER BY tasks.task_id DESC";
    // console.log("qry: ", qry);

    let taskAttachmentquery = `SELECT * FROM taskattachment WHERE status = 0`;

    if (task_id && task_id != undefined && task_id != "") {
      taskAttachmentquery += ` AND task_id = ${task_id}`;
    }

    let attachmentData;
    db.query(taskAttachmentquery, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        // console.log(res);
        attachmentData = res;
      }
    });

    db.query(qry, (error, result) => {
      // result.push({ attachmentData: attachmentData });
      if (error) {
        console.log(error);
        return res.send({
          message: "Something went wrong, please try again",
          status: false,
          statucode: 500,
          data: error,
        });
      } else {
        return res.send({
          message: "Data fetched successfully",
          status: true,
          statucode: 200,
          data: result,
          attachmentData: attachmentData,
        });
      }
    });
  } catch (err) {
    console.error("Error executing query", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getTasksMob = async (req, res) => {
  try {
    const project_id = req.query.project_id;
    const task_id = req.query.task_id;
    const task_name = req.query.task_name;
    const user_id = req.query.user_id;
    const reporter_id = req.query.reporter_id;
    const task_status = req.query.task_status;
    const filterStartDate = req.query.filterStartDate;
    const filterEndDate = req.query.filterEndDate;
    // console.log("query: ", req.query);

    let qry = `SELECT tasks.*,
        assigned_to_user.name AS assigned_to_name,
        reporter_user.name AS reporter_name,
        projects.project_name AS subProject,
        projects.parent_project_id AS subProjectId,
        parent_project.project_name AS mainProject
    FROM
        tasks
    LEFT JOIN
        users AS assigned_to_user ON tasks.assigned_to = assigned_to_user.id
    LEFT JOIN
        users AS reporter_user ON tasks.reporter = reporter_user.id
    LEFT JOIN
        projects ON tasks.project_id = projects.project_id
    LEFT JOIN
        projects AS parent_project ON projects.parent_project_id = parent_project.project_id
    WHERE
        tasks.status = 0
    `;
    if (project_id) {
      qry += ` AND (tasks.project_id = ${project_id} OR (projects.parent_project_id = ${project_id}))`;
    }
    if (task_id && task_id != undefined && task_id != "") {
      qry += ` AND tasks.task_id = ${task_id}`;
    }
    if (task_name) {
      qry += ` AND tasks.task_name LIKE '%${task_name}%'`;
    }
    if (user_id) {
      qry += ` AND tasks.assigned_to = ${user_id}`;
    }
    if (reporter_id) {
      qry += ` AND tasks.reporter = ${reporter_id}`;
    }
    if (task_status) {
      qry += ` AND tasks.task_status = '${task_status}'`;
    }
    if (filterStartDate && filterEndDate) {
      const startDateTime = `${filterStartDate} 00:00:00`;
      const endDateTime = `${filterEndDate} 23:59:59`;

      qry += ` AND tasks.created_at BETWEEN '${startDateTime}' AND '${endDateTime}'`;
    }

    qry += " ORDER BY tasks.task_id DESC";

    let attachmentData;
    if (task_id) {
      let taskAttachmentquery = `SELECT * FROM taskattachment WHERE task_id = ${task_id} AND status = 0`;
      db.query(taskAttachmentquery, (err, res) => {
        if (err) {
          console.log(err);
        } else {
          // console.log(res);
          attachmentData = res;
        }
      });
    }

    db.query(qry, (error, result) => {
      // result.push({ attachmentData: attachmentData });
      if (error) {
        console.log(error);
        return res.send({
          message: "Something went wrong, please try again",
          status: false,
          statucode: 500,
          data: error,
        });
      } else {
        return res.send({
          message: "Data fetched successfully",
          status: true,
          statucode: 200,
          data: result,
          attachmentData: attachmentData,
        });
      }
    });
  } catch (err) {
    console.error("Error executing query", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.editTasks = async (req, res) => {
  const {
    description,
    due_date,
    assigned_to,
    created_by,
    project_id,
    issue_type,
    priority,
    reporter,
    attachment,
    task_status,
    summary,
  } = req.body;
  const taskId = req.params.id;
  try {
    // let qry = `UPDATE tasks SET task_name = ?, description = ?, due_date = ?, assigned_to = ?, created_by = ?, project_id = ?, issue_type = ?, priority = ?, reporter = ?, summary = ?, task_status = ? WHERE task_id = ?`;
    let fields = [];

    if (
      description !== undefined &&
      description !== null &&
      description !== ""
    ) {
      fields.push(`description = '${description}'`);
    }
    if (due_date !== undefined && due_date !== null && due_date !== "") {
      fields.push(`due_date = '${due_date}'`);
    }
    if (
      assigned_to !== undefined &&
      assigned_to !== null &&
      assigned_to !== ""
    ) {
      fields.push(`assigned_to = '${assigned_to}'`);
    }
    if (created_by !== undefined && created_by !== null && created_by !== "") {
      fields.push(`created_by = '${created_by}'`);
    }
    if (project_id !== undefined && project_id !== null && project_id !== "") {
      fields.push(`project_id = '${project_id}'`);
    }
    if (issue_type !== undefined && issue_type !== null && issue_type !== "") {
      fields.push(`issue_type = '${issue_type}'`);
    }
    if (priority !== undefined && priority !== null && priority !== "") {
      fields.push(`priority = '${priority}'`);
    }
    if (reporter !== undefined && reporter !== null && reporter !== "") {
      fields.push(`reporter = '${reporter}'`);
    }
    if (summary !== undefined && summary !== null && summary !== "") {
      fields.push(`summary = '${summary}'`);
    }
    if (
      task_status !== undefined &&
      task_status !== null &&
      task_status !== ""
    ) {
      fields.push(`task_status = '${task_status}'`);
    }
    // if (taskId !== undefined && taskId !== null && taskId !== "") {
    //   fields.push(`taskId = '${taskId}'`);
    // }
    const fieldsString = fields.join(", ");
    const qry = `UPDATE tasks SET ${fieldsString} WHERE task_id = ${taskId}`;

    // console.log("qry: ", qry);

    await db.query(qry);

    let imageName =
      image_path + "user-img-" + moment().format("YYYY-MM-DD-HH-mm-ss");

    if (attachment && attachment.length > 0) {
      attachment.forEach(async (imageUrls) => {
        profile_img = await decodeBase64Image(imageUrls, imageName);

        db.query(
          "INSERT INTO taskattachment (task_id, imageURL) VALUES (?, ?)",
          [taskId, profile_img],
          (error, results, fields) => {
            if (error) {
              console.error("Error inserting image URL:", error);
            } else {
              console.log("Image URL inserted successfully:", profile_img);
            }
          }
        );
      });
    } else {
      console.log("No attachment found to insert.");
    }

    res.status(200).json({ message: "Task updated successfully" });
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteTasks = async (req, res) => {
  const task_id = req.params.id;
  try {
    let qry = `UPDATE tasks SET status = 1 WHERE task_id = ${task_id}`;

    await db.query(qry, [task_id]);

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.uploadTaskAttachment = async (req, res) => {
  uploadAnyFile.single("attachment")(req, res, (err) => {
    if (err) {
      return res.status(400).send("File upload failed");
    }
    const attachment = req.file;
    const taskId = req.query.taskId;
    db.query(
      "INSERT INTO taskAttachment (task_id, files) VALUES (?, ?)",
      [
        taskId,
        process.env.IMAGE_BASEURL +
          "uploads/taskAttachment/" +
          attachment.filename,
      ],
      (err, result) => {
        if (err) throw err;
        return res.send({
          message: "Attachment uploaded successfully!",
          data: result,
        });
      }
    );
  });
};

exports.updateTaskAttachment = async (req, res) => {
  const taskId = req.query.taskId;
  const id = req.query.id;
  try {
    let qry = `UPDATE taskAttachment set task_id = ${taskId} WHERE id = ${id}`;
    await db.query(qry, [taskId, id]);
    return res.status(201).json({ message: "Attachment updated" });
    // Send response to client indicating successful upload
    // res.send("Attachment uploaded successfully!");
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteuploadTaskAttachment = async (req, res) => {
  const attachmentid = req.params.attachmentId;
  // console.log("attachmentid: ", attachmentid);
  try {
    let qry = `UPDATE taskAttachment SET status = 1 WHERE id = ${attachmentid}`;
    await db.query(qry, [attachmentid]);
    return res.status(201).json({ message: "Attachment deleted" });
  } catch (err) {
    console.error("Error executing query", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.dashboard = async (req, res) => {
  try {
    let qry = `SELECT
        (
          SELECT COUNT(*)
          FROM tasks WHERE status = 0
        ) AS task_count,
        (
          SELECT COUNT(*)
          FROM tasks
          WHERE task_status = 'In Progress' AND status = 0
        ) AS in_progress_task_count,
        (
          SELECT COUNT(*)
          FROM tasks
          WHERE task_status = 'In Review' AND status = 0
        ) AS in_review_task_count,
        (
          SELECT COUNT(*)
          FROM tasks
          WHERE task_status = 'Open' AND status = 0
        ) AS open_task_count,
        (
          SELECT COUNT(*)
          FROM tasks
          WHERE task_status = 'Done' AND status = 0
        ) AS done_task_count,
        (
          SELECT COUNT(*)
          FROM tasks
          WHERE task_status = 'On hold' AND status = 0
        ) AS on_hold_task_count,
        (
          SELECT COUNT(*)
          FROM projects
          WHERE status = 0
          AND parent_project_id IS NULL
        ) AS total_project_count`;

    let userQry = `SELECT
          (
          SELECT COUNT(*)
          FROM projects
          WHERE status = 0
            AND parent_project_id IS NULL
        ) AS project_count,u.name AS userName, u.id AS userId,
        (
          SELECT COUNT(*)
          FROM tasks t
          WHERE t.assigned_to = u.id AND status = 0
        ) AS user_task_count
    FROM
        users u
    WHERE
        u.id IN (SELECT user_id FROM projectallocatedusers)`;
    // let newUserQry = `SELECT
    //     (
    //         SELECT COUNT(*)
    //         FROM projects
    //         WHERE status = 0
    //           AND parent_project_id IS NULL
    //     ) AS project_count,
    //     u.name AS userName,
    //     u.id AS userId,
    //     (
    //         SELECT COUNT(*)
    //         FROM tasks t
    //         WHERE t.assigned_to = u.id AND status = 0
    //     ) AS user_task_count
    // FROM
    //     users u
    // WHERE
    //     u.id IN (SELECT user_id FROM projectallocatedusers)
    // `;

    let userResult = {};

    await db.query(userQry, (error, result) => {
      if (error) {
        console.log(error);
      } else {
        // console.log(result);
        userResult = result;

        db.query(qry, async (error, result) => {
          if (error) {
            console.log(error);
          } else {
            // console.log(result);
            return res.status(201).json({ data: result, userResult });
          }
        });
      }
    });
  } catch (err) {
    console.error("Error executing query", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.mobDashboard = async (req, res) => {
  let user_id = req.query.user_id;
  try {
    let qry = `SELECT
        (
          SELECT COUNT(*)
          FROM tasks
          WHERE assigned_to = ${user_id} AND status = 0
        ) AS task_count,
        (
          SELECT COUNT(*)
          FROM tasks
          WHERE task_status = 'In Progress' AND assigned_to = ${user_id} AND status = 0
        ) AS in_progress_task_count,
        (
          SELECT COUNT(*)
          FROM tasks
          WHERE task_status = 'In Review' AND assigned_to = ${user_id} AND status = 0
        ) AS in_review_task_count,
        (
          SELECT COUNT(*)
          FROM tasks
          WHERE task_status = 'Open' AND assigned_to = ${user_id} AND status = 0
        ) AS open_task_count,
        (
          SELECT COUNT(*)
          FROM tasks
          WHERE task_status = 'Done' AND assigned_to = ${user_id} AND status = 0
        ) AS done_task_count,
        (
          SELECT COUNT(*)
          FROM tasks
          WHERE task_status = 'On hold' AND assigned_to = ${user_id} AND status = 0
        ) AS on_hold_task_count,
        (
          SELECT COUNT(*)
          FROM projects
          WHERE status = 0
          AND parent_project_id IS NULL
        ) AS total_project_count`;

    // let userQry = `SELECT
    //       (
    //       SELECT COUNT(*)
    //       FROM projects
    //       WHERE status = 0
    //         AND parent_project_id IS NULL
    //     ) AS project_count,u.name AS userName, u.id AS userId,
    //     (
    //       SELECT COUNT(*)
    //       FROM tasks t
    //       WHERE t.assigned_to = u.id AND status = 0
    //     ) AS user_task_count
    // FROM
    //     users u`;

    let newUserQry = `SELECT
    (
        SELECT COUNT(*)
        FROM projects
        WHERE status = 0
          AND parent_project_id IS NULL
    ) AS project_count,
    u.name AS userName,
    u.id AS userId,
    (
        SELECT COUNT(*)
        FROM tasks t
        WHERE t.assigned_to = u.id AND status = 0
    ) AS user_task_count
FROM
    users u
WHERE
    u.id IN (SELECT user_id FROM projectallocatedusers)
`;

    let userResult = [];

    await db.query(newUserQry, (error, result) => {
      if (error) {
        console.log(error);
      } else {
        // console.log(result);
        userResult = result;
        db.query(qry, async (error, result) => {
          // console.log("qry: ", qry);
          if (error) {
            console.log(error);
          } else {
            // console.log(result);
            return res.status(201).json({ data: result, userResult });
          }
        });
      }
    });
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
