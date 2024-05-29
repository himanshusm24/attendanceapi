const db = require("../model/db");

const table_name = "user_type";

exports.addUserType = async (req, res) => {
  const { name } = req.body;
  try {
    let qry = `INSERT INTO ${table_name} (name) VALUES (?)`;
    await db.query(qry, [name]);
    return res.status(201).json({ message: "User type created successfully" });
  } catch (err) {
    console.error("Error executing query", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getUserType = async (req, res) => {
  const statusId = req.query.id;
  try {
    let qry = `SELECT * FROM ${table_name} WHERE status = 0`;

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

exports.editUserType = async (req, res) => {
  const { name } = req.body;
  //   console.log("project_status: ", project_status);
  try {
    const qry = `UPDATE ${table_name} SET name = '${name}' WHERE id = ${req.params.id}`;

    await db.query(qry);

    return res.status(200).json({ message: "User type updated successfully" });
  } catch (err) {
    console.error("Error executing query", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteUserType = async (req, res) => {
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
