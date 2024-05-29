const db = require("../model/db");

// add main project
exports.addProject = async (req, res) => {
  const { project_name, description } = req.body;
  const created_by = req.userData.userData.data[0].id;
  try {
    let qry = `INSERT INTO projects (project_name, description, created_by) VALUES (?, ?, ?)`;
    await db.query(qry, [project_name, description, created_by]);
    res.status(201).json({ message: "Project created successfully" });
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.addProjectMob = async (req, res) => {
  const { project_name, description } = req.body;
  const created_by = req.userData.userData?.data[0]?.id || null;
  console.log("created_by: ", created_by);

  try {
    let qry = `INSERT INTO projects (project_name, description, created_by) VALUES (?, ?, ?)`;
    let params = [project_name || null, description || null, created_by];
    await db.query(qry, params, async (error, result) => {
      if (error) {
        console.log(error);
      } else {
        console.log(result.insertId);
        let project_id = result.insertId;
        let user_id = created_by;
        let checkUser = `SELECT * FROM projectallocatedusers WHERE project_id = ${project_id} AND user_id = ${user_id}`;
        await db.query(checkUser, async (error, result) => {
          if (error) {
            console.log(error);
          } else {
            if (result.length > 0) {
              let updateUser = `UPDATE projectallocatedusers SET status = 0 WHERE project_id = ${project_id} AND user_id = ${user_id}`;
              await db.query(updateUser, [project_id, user_id]);
              return res.status(201).json({ message: "User updated" });
            }
            let qry = `INSERT INTO projectallocatedusers (project_id, user_id) VALUES (?, ?)`;
            await db.query(qry, [project_id, user_id]);

            return res.status(201).json({
              message: "Project created and Allocated user successfully",
            });
          }
        });
      }
    });

    // res.status(201).json({ message: "Project created successfully" });
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// add sub project
exports.addSubProject = async (req, res) => {
  const { project_name, parent_project_id, description } = req.body;
  const created_by = req.userData.userData.data[0].id;
  try {
    let qry = `INSERT INTO projects (project_name, parent_project_id, description, created_by) VALUES (?, ?, ?, ?)`;
    await db.query(qry, [
      project_name,
      parent_project_id,
      description,
      created_by,
    ]);
    res.status(201).json({ message: "Sub Project created successfully" });
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.assignUsers = async (req, res) => {
  const { project_id, user_id } = req.body;
  let qry = `INSERT INTO projectusers (project_id, user_id) VALUES (?, ?)`;

  await db.query(qry, [project_id, user_id]);
  res.status(201).json({ message: "User Assigned" });
};

// get all projects
exports.getProjects = async (req, res) => {
  try {
    let projectID = req.query.project_id;
    let projectStatus = req.query.projectStatus;
    let qry = `SELECT 
                projects.*, 
                users.name AS userName
            FROM 
                projects 
            JOIN 
                users ON projects.created_by = users.id
            WHERE
                projects.status = 0
                AND projects.parent_project_id IS NULL`;

    if (projectID) {
      qry += ` AND projects.project_id = ${projectID}`;
    }

    if (projectStatus) {
      qry += ` AND projects.projectStatus = '${projectStatus}'`;
    }

    db.query(qry, (error, result) => {
      if (error) {
        console.log(error);
        res.send({
          message: "Something went wrong, please try again",
          status: false,
          statucode: 500,
          data: error,
        });
      } else {
        res.send({
          message: "Data fetched successfully",
          status: true,
          statucode: 200,
          data: result,
        });
      }
    });
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// search filter of projects by project name
// exports.projectSearch = async (req, res) => {
//   try {
//     let projectID = req.query.project_id;
//     let projectName = req.query.projectName;

//     let qry = `SELECT
//               projects.*,
//               admin.name AS admin_name
//           FROM
//               projects
//           JOIN
//               admin ON projects.created_by = admin.id
//           WHERE
//               projects.status = 0`;

//     if (projectID) {
//       qry += ` AND projects.project_id = ${projectID}`;
//     }

//     if (projectName) {
//       qry += ` AND projects.project_name = "${projectName}"`;
//     }

//     db.query(qry, (error, result) => {
//       if (error) {
//         console.log(error);
//         res.send({
//           message: "Something went wrong, please try again",
//           status: false,
//           statucode: 500,
//           data: error,
//         });
//       } else {
//         res.send({
//           message: "Data fetched successfully",
//           status: true,
//           statucode: 200,
//           data: result,
//         });
//       }
//     });
//   } catch (err) {
//     console.error("Error executing query", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// get sub projects
exports.getSubProjects = async (req, res) => {
  try {
    let projectID = req.query.project_id;

    let qry = `SELECT 
                projects.*, 
                users.name AS users_name
            FROM 
                projects 
            JOIN 
                users ON projects.created_by = users.id
            WHERE
                projects.status = 0`;

    if (projectID) {
      qry += ` AND projects.project_id = ${projectID}`;
    }
    db.query(qry, (error, result) => {
      if (error) {
        console.log(error);
        res.send({
          message: "Something went wrong, please try again",
          status: false,
          statucode: 500,
          data: error,
        });
      } else {
        let newqry = `SELECT pau.*, p.project_name, u.name, u.email, u.designation, d.name AS departmentName
                      FROM projectallocatedusers pau
                      JOIN projects p ON pau.project_id = p.project_id
                      JOIN users u ON pau.user_id = u.id
                      JOIN department d ON u.department_id = d.id
                      WHERE pau.status = 0 AND pau.project_id = ${result[0].parent_project_id}
                      `;

        db.query(newqry, (err, response) => {
          console.log("newqry: ", newqry);
          if (err) {
            console.log(err);
          } else {
            res.send({
              message: "Data fetched successfully",
              status: true,
              statucode: 200,
              data: result,
              userData: response,
            });
          }
        });
      }
    });
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.subprojects = async (req, res) => {
  try {
    let projectID = req.query.project_id;
    let qry = `SELECT 
                projects.*, 
                users.name AS users_name
            FROM 
                projects 
            JOIN 
                users ON projects.created_by = users.id
            WHERE
                projects.status = 0`;

    if (projectID) {
      qry += ` AND projects.parent_project_id = ${projectID}`;
    }

    db.query(qry, (error, result) => {
      if (error) {
        console.log(error);
        res.send({
          message: "Something went wrong, please try again",
          status: false,
          statucode: 500,
          data: error,
        });
      } else {
        res.send({
          message: "Data fetched successfully",
          status: true,
          statucode: 200,
          data: result,
        });
      }
    });
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// edit project
exports.editProject = async (req, res) => {
  const { project_name, description, projectStatus, endDate, startDate } =
    req.body;
  try {
    let fields = [];

    if (
      project_name !== undefined &&
      project_name !== null &&
      project_name !== ""
    ) {
      fields.push(`project_name = '${project_name}'`);
    }
    if (
      description !== undefined &&
      description !== null &&
      description !== ""
    ) {
      fields.push(`description = '${description}'`);
    }
    if (
      projectStatus !== undefined &&
      projectStatus !== null &&
      projectStatus !== ""
    ) {
      fields.push(`projectStatus = '${projectStatus}'`);
    }
    if (endDate !== undefined && endDate !== null && endDate !== "") {
      fields.push(`endDate = '${endDate}'`);
    }
    if (startDate !== undefined && startDate !== null && startDate !== "") {
      fields.push(`startDate = '${startDate}'`);
    }

    const fieldsString = fields.join(", ");

    const qry = `UPDATE projects SET ${fieldsString} WHERE project_id = ${req.params.id}`;
    console.log("qry: ", qry);

    await db.query(qry);

    res.status(200).json({ message: "Project updated successfully" });
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// delete single project
exports.deleteProject = async (req, res) => {
  const { project_id } = req.params;
  try {
    // let qry = `DELETE FROM projects WHERE project_id = ${req.params.id}`;
    let qry = `UPDATE projects SET status = 1 WHERE project_id = ${req.params.id}`;

    await db.query(qry, [project_id]);

    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("Error executing query", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// delete main project along with its subproject
exports.deleteMainProject = async (req, res) => {
  const { project_id } = req.params;

  try {
    // First query
    let qry1 = `UPDATE projects SET status = 1 WHERE parent_project_id = ${req.params.id}`;
    await db.query(qry1, [project_id]);

    // Second query
    let qry2 = `UPDATE projects SET status = 1 WHERE project_id = ${req.params.id}`;
    await db.query(qry2, [project_id]);

    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    await db.rollback();
    console.error("Error executing query", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// allocate users to project
exports.allocateProjectUser = async (req, res) => {
  const { project_id, user_id } = req.body;
  try {
    let checkUser = `SELECT * FROM projectallocatedusers WHERE project_id = ${project_id} AND user_id = ${user_id}`;
    await db.query(checkUser, async (error, result) => {
      if (error) {
        console.log(error);
      } else {
        if (result.length > 0) {
          // res.send("User already exists");
          let updateUser = `UPDATE projectallocatedusers SET status = 0 WHERE project_id = ${project_id} AND user_id = ${user_id}`;
          await db.query(updateUser, [project_id, user_id]);
          return res.status(201).json({ message: "User updated" });
        }
        let qry = `INSERT INTO projectallocatedusers (project_id, user_id) VALUES (?, ?)`;
        await db.query(qry, [project_id, user_id]);

        return res.status(201).json({ message: "Project Allocated" });
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err });
  }
};

// get all users which assigned to project
exports.getAllocatedProjectUsers = async (req, res) => {
  const projectId = req.query.projectId;
  const userId = req.query.userId;
  const projectName = req.query.projectName;
  const projectStatus = req.query.projectStatus;
  try {
    let qry = `SELECT pau.*, p.project_name, p.projectStatus, u.name, u.email, u.designation, d.name AS departmentName, p.startDate, p.endDate, p.description
    FROM projectallocatedusers pau
    JOIN projects p ON pau.project_id = p.project_id
    JOIN users u ON pau.user_id = u.id
    JOIN department d ON u.department_id = d.id
    WHERE pau.status = 0
    `;

    if (projectId) {
      qry += ` AND pau.project_id = ${projectId}`;
    }

    if (userId) {
      qry += ` AND pau.user_id = ${userId}`;
    }

    if (projectName) {
      qry += ` AND p.project_name LIKE '%${projectName}%'`;
    }

    if (projectStatus) {
      qry += ` AND p.projectStatus = '${projectStatus}'`;
    }

    qry += ` ORDER BY pau.project_id DESC`;
    console.log("qry: ", qry);

    await db.query(qry, (error, result) => {
      if (error) {
        console.log(error);
      } else {
        // console.log(result);
        res.status(201).json({ data: result });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error", error: err });
  }
};

// delete users from project
exports.deleteAllocateProjectUsers = async (req, res) => {
  const id = req.params.id;
  try {
    let qry = `UPDATE projectallocatedusers SET status = 1 WHERE id = ${id}`;

    await db.query(qry, [id]);

    res.status(200).json({ message: "User deleted from project successfully" });
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// get all allocated users
exports.allocatedAssigneeUsers = async (req, res) => {
  const projectId = req.query.projectId;
  console.log("projectId: ", projectId);

  try {
    let qry = `SELECT u.id AS userId, u.name, u.branch_id, u.role_id, u.department_id, u.email, u.designation, d.name AS departmentName, b.name AS branchName, pau.* 
                FROM projectallocatedusers pau
                JOIN projects ON projects.project_id = pau.project_id 
                JOIN users u ON pau.user_id = u.id 
                JOIN department d ON u.department_id = d.id 
                JOIN branch b ON u.branch_id = b.id`;

    if (projectId) {
      qry += ` WHERE (projects.project_id = ${projectId} OR projects.parent_project_id = ${projectId}) AND pau.status = 0`;
    }

    if(!projectId){
      qr+= ` WHERE pau.status = 0`;
    }

    qry += ` ORDER BY pau.project_id DESC`;
    console.log("qry: ", qry);
    // WHERE projects.project_id = ${projectId} OR projects.parent_project_id = ${projectId}`;

    await db.query(qry, (error, result) => {
      if (error) {
        console.log(error);
      } else {
        // console.log(result);
        res.status(201).json({ data: result });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error", error: err });
  }
};
