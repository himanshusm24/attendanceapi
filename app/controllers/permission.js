const db = require("../model/db");

const table_name = "permissions";

exports.addPermission = async (req, res) => {
  const { permission_type } = req.body;
  console.log("permission_type:", permission_type);
  try {
    for (let type = 1; type <= 4; type++) {
      let qry = `INSERT INTO ${table_name} (module, type) VALUES (?, ?)`;
      await db.query(qry, [permission_type, type]);
      console.log(
        `Inserted permission_type: ${permission_type}, type: ${type}`
      );
    }
    return res
      .status(201)
      .json({ message: "Permissions created successfully" });
  } catch (err) {
    console.error("Error executing query", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getPermission = async (req, res) => {
  const statusId = req.query.id;
  const userTypeId = req.query.usertypeId;
  try {
    let qry = `SELECT * FROM permissions GROUP BY module`;

    if (statusId) {
      qry += ` HAVING id = ${statusId}`;
    }

    db.query(qry, (error, result) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          message: "Something went wrong, please try again",
          status: false,
          statusCode: 500,
          data: error,
        });
      } else {
        const moduleQueries = result.map((res) => {
          return new Promise((resolve, reject) => {
            db.query(
              `SELECT * FROM permissions WHERE module = '${res.module}'`,
              (err, newresult) => {
                if (err) {
                  console.error(err);
                  reject(err);
                } else {
                  resolve(newresult);
                }
              }
            );
          });
        });

        Promise.all(moduleQueries)
          .then((data) => {
            let sendData = [];
            data.forEach((newresult, index) => {
              const permissionIds = newresult.map(
                (permission) => permission.id
              );

              Promise.all(
                permissionIds.map((permissionId) => {
                  return new Promise((resolve, reject) => {
                    const permissionCheckQry = `SELECT COUNT(*) AS count FROM user_permission_relation WHERE usertypeId = '${userTypeId}' AND permissionId = ${permissionId}`;
                    db.query(permissionCheckQry, (err, newresult1) => {
                      if (err) {
                        console.error(err);
                        reject(err);
                      } else {
                        resolve(newresult1[0].count);
                      }
                    });
                  });
                })
              )
                .then((permissionCounts) => {
                  const permissionsWithCheck = newresult.map(
                    (permission, idx) => ({
                      ...permission,
                      check: permissionCounts[idx],
                    })
                  );

                  sendData.push({
                    module: result[index].module,
                    permissions: permissionsWithCheck,
                  });

                  if (sendData.length === data.length) {
                    res.status(200).json({
                      message: "Data fetched successfully",
                      status: true,
                      statusCode: 200,
                      data: sendData,
                    });
                  }
                })
                .catch((err) => {
                  console.error("Error executing query", err);
                  res.status(500).json({ error: "Internal server error" });
                });
            });
          })
          .catch((err) => {
            console.error("Error executing query", err);
            res.status(500).json({ error: "Internal server error" });
          });
      }
    });
  } catch (err) {
    console.error("Error executing query", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.editPermission = async (req, res) => {
  const {
    permission_type,
    add_option,
    view_option,
    update_option,
    delete_option,
  } = req.body;

  //   console.log("project_status: ", project_status);
  try {
    const qry = `UPDATE ${table_name} SET permission_type = '${permission_type}', add_option = ${add_option}, view_option = ${view_option}, update_option = ${update_option}, delete_option = ${delete_option} WHERE id = ${req.params.id}`;

    await db.query(qry);

    return res.status(200).json({ message: "Permission updated successfully" });
  } catch (err) {
    console.error("Error executing query", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.deletePermission = async (req, res) => {
  const permissionId = req.params.id;
  try {
    let qry = `UPDATE ${table_name} SET status = 1 WHERE id = ${permissionId}`;
    await db.query(qry, [permissionId]);
    return res.status(201).json({ message: "Permission deleted" });
  } catch (err) {
    console.error("Error executing query", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.allowedroles = async (req, res) => {

  const usertypeId = req.query.usertypeId

  try {
    let qry = `SELECT permissions.module, permissions.type FROM permissions
    LEFT JOIN user_permission_relation ON permissions.id = user_permission_relation.permissionId
    WHERE user_permission_relation.usertypeId = ${usertypeId};`;

    await db.query(qry, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(201).json({ message: "Not Allowed" });
      } else {
        // console.log(result);
        return res.status(201).json({ data: result });
      }
    });
  } catch (err) {
    console.error("Error executing query", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
