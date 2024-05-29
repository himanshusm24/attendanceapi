const db = require("../model/db");

const table_name = "user_permission_relation";

exports.addUserPermissionRelation = async (req, res) => {
  const { usertypeId, permissionId } = req.body;
  try {
    let qry = `INSERT INTO ${table_name} (usertypeId, permissionId) VALUES (?)`;
    await db.query(qry, [usertypeId, permissionId]);
    return res.status(201).json({ message: "User type created successfully" });
  } catch (err) {
    console.error("Error executing query", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getUserPermissionRelation = async (req, res) => {
  const userTypeId = req.query.id;
  try {
    let qry = `SELECT * FROM ${table_name} WHERE status = 1`;

    if (userTypeId) {
      qry += ` AND usertypeId = ${userTypeId}`;
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

exports.editUserPermissionRelation = async (req, res) => {
  const { usertypeId, permissionId } = req.body;
  //   console.log("project_status: ", project_status);
  try {
    const qry = `UPDATE ${table_name} SET usertypeId = '${usertypeId}', permissionId = '${permissionId}  WHERE id = ${req.params.id}`;

    await db.query(qry);

    return res.status(200).json({ message: "User type updated successfully" });
  } catch (err) {
    console.error("Error executing query", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteUserPermissionRelation = async (req, res) => {
  const userTypeId = req.params.id;
  try {
    let qry = `UPDATE ${table_name} SET status = 1 WHERE id = ${userTypeId}`;
    await db.query(qry, [userTypeId]);
    return res.status(201).json({ message: "User type deleted" });
  } catch (err) {
    console.error("Error executing query", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.setUserPermissionRelation = async (req, res) => {
  const data = req.body.data;
  try {
    const deleteqry = ` DELETE FROM user_permission_relation WHERE usertypeId = ${data[0].usertypeId}`;

    const insertQuery = `INSERT INTO user_permission_relation (usertypeId, permissionId) VALUES ? ON DUPLICATE KEY UPDATE usertypeId = VALUES(usertypeId), permissionId = VALUES(permissionId)`;

    const insertValues = data
      .filter(({ check }) => check === 1) // Filter data to insert/update
      .map(({ usertypeId, permissionId }) => [usertypeId, permissionId]);

    db.query(deleteqry, (err, result) => {
      if (err) {
        console.error("Error deleting user_permission_relation:", err);
        return;
      }
      //   console.log("User permissions deleted successfully:", result);

      // After the DELETE query, execute the INSERT query
      db.query(insertQuery, [insertValues], (err, result) => {
        if (err) {
          console.error("Error inserting user_permission_relation:", err);
          return;
        }
        // console.log("User permissions inserted successfully:", result);
        return res
          .status(201)
          .json({ message: "Permisiion updated successfully" });
      });
    });
  } catch (err) {
    console.error("Error executing query", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
