const db = require("../model/db");

exports.createLog = async (req, res) => {
  const { followUpId, type, message, data_id, data_type, oldValue, newValue } =
    req.body;
  try {
    let qry = `INSERT INTO tasklogs (followUpId, type, message, data_id, data_type, oldValue, newValue) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      followUpId,
      type,
      message,
      data_id,
      data_type,
      oldValue,
      newValue,
    ];
    const sanitizedValues = values.map((value) =>
      value !== undefined ? value : null
    );
    await db.query(qry, sanitizedValues);
    res.status(201).json({ message: "Logs created successfully" });
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getTaskLogs = async (req, res) => {
  const taskId = req.query.taskId;
  const projectId = req.query.projectId;
  try {
    let qry = `SELECT tasklogs.*, users.name AS userName, users.email AS usersEmail, users.name AS userName, users.email AS userEmail, users.branch_id, users.role_id, users.department_id, users.designation FROM tasklogs`;

    if (taskId) {
      qry += ` INNER JOIN tasks ON tasklogs.data_id = tasks.task_id`;
    } else if (projectId) {
      qry += ` INNER JOIN projects ON tasklogs.data_id = projects.project_id`;
    }

    // qry += ` LEFT JOIN users ON tasklogs.followUpId = users.id AND tasklogs.type = 'users'`;

    qry += ` LEFT JOIN users ON tasklogs.followUpId = users.id AND tasklogs.type = 'users'`;

    // qry += ` LEFT JOIN users ON tasklogs.followUpId = users.id AND tasklogs.type = 'user'`;

    if (taskId) {
      qry += ` WHERE tasks.task_id = ${taskId}`;
    }
    if(projectId){
        qry += ` WHERE projects.project_id = ${projectId}`
    }

    await db.query(qry, (error, result) => {
    //   console.log("qry: ", qry);
      if (error) {
        console.log(error);
      } else {
        return res.status(201).json({ data: result });
      }
    });
  } catch (err) {
    console.error("Error executing query", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
