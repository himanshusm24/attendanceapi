const db = require("../model/db");

exports.addProjectStatus = async (req, res) => {
  const { project_status } = req.body;
  try {
    let qry = `INSERT INTO project_task_status (project_status) VALUES (?)`;
    await db.query(qry, [project_status]);
    return res
      .status(201)
      .json({ message: "Project status created successfully" });
  } catch (err) {
    console.error("Error executing query", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getProjectStatus = async (req, res) => {
  const statusId = req.query.id;
  try {
    let qry = `SELECT * FROM project_task_status WHERE status = 0`;

    if (statusId) {
      qry += ` AND id = ${statusId}`;
    }

    db.query(qry, (error, result) => {
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
        });
      }
    });
  } catch (err) {
    console.error("Error executing query", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.editProjectStatus = async (req, res) => {
  const { project_status } = req.body;
  console.log("project_status: ", project_status);
  try {
    const qry = `UPDATE project_task_status SET project_status = '${project_status}' WHERE id = ${req.params.id}`;

    await db.query(qry);

    return res
      .status(200)
      .json({ message: "Project Status updated successfully" });
  } catch (err) {
    console.error("Error executing query", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteProjectStatus = async (req, res) => {
  const projectStatusId = req.params.id;
  try {
    let qry = `UPDATE project_task_status SET status = 1 WHERE id = ${projectStatusId}`;
    await db.query(qry, [projectStatusId]);
    return res.status(201).json({ message: "Project Status deleted" });
  } catch (err) {
    console.error("Error executing query", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
