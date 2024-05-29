const express = require("express");

const userModel = require("../model/model");

const db = require("../model/db");

const encPassword = require("./../middelware/enc-password");

const decPassword = require("./../middelware/dec-password");

const authKey = require("./../config/jwt");

const jwt = require("jsonwebtoken");

const table_name = "users";

const image_path = "uploads/profile-img/";

const moment = require("moment");

const decodeBase64Image = require("./../middelware/base64toimage");

exports.getUser = (req, res, next) => {
  let company_id = req.query.company_id;
  let user_id = req.query.user_id;
  try {
    let qry = `SELECT u.id, u.user_type, u.branch_id, u.name, u.email, u.contact, u.gender, u.dob, u.designation, u.profile_image, u.aadhar_no, u.pan_no, u.status, u.paid_leave, u.paid_leave_taken, u.paid_leave_available, u.unpaid_leave, u.role_id, u.department_id, b.checkin_time AS company_checkin_time, b.checkout_time AS company_checkout_time
               FROM ${table_name} u
               LEFT JOIN branch b ON u.branch_id = b.id
               WHERE u.status = 1`;

    if (company_id > 0) {
      qry += ` AND u.branch_id = ${company_id}`;
    }
    if (user_id > 0) {
      qry += ` AND u.id = ${user_id}`;
    }

    qry += " ORDER BY u.id DESC";

    db.query(qry, (err, result) => {
      if (err) {
        res.status(500).send({
          message: "Internal servor error",
          data: err,
        });
      } else {
        res.status(200).send({
          message: "Data fetched successfully",
          data: result,
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: "Internal servor error", data: error });
  }
};

// For TasK management
exports.getUserList = async (req, res) => {
  try {
    let qry = `SELECT u.id, u.branch_id, u.name, u.email, u.designation, b.name AS branchName
    FROM ${table_name} u
    JOIN branch b ON u.branch_id = b.id
    WHERE u.status = 1`;

    userModel.getAll(qry, (err, result) => {
      if (err) {
        res.status(err.statucode).send({
          message: err.message,
          status: err.status,
          data: err.data,
        });
      } else {
        res.status(result.statucode).send({
          message: result.message,
          status: result.status,
          data: result.data,
        });
      }
    });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Some internal problem", data: error });
  }
};

exports.createUser = async (req, res, next) => {
  let data = req.body;

  if (
    data.name != "" &&
    data.name != null &&
    data.email != "" &&
    data.email != null &&
    data.contact != "" &&
    data.contact != null &&
    data.password != "" &&
    data.password != null &&
    data.gender != "" &&
    data.gender != null &&
    data.designation != "" &&
    data.designation != null &&
    data.paid_leave != "" &&
    data.paid_leave != null &&
    data.role_id != "" &&
    data.role_id != null &&
    data.department_id != "" &&
    data.department_id != null &&
    data.user_type != "" &&
    data.user_type != null
  ) {
    let hashPassword = await encPassword(data.password);

    let qry1 = `select * from ${table_name} where email='${data.email}'`;

    userModel.getAll(qry1, (err, result) => {
      if (result.data.length == 0) {
        let columns = [
          "user_type",
          "branch_id",
          "role_id",
          "department_id",
          "name",
          "email",
          "contact",
          "password",
          "gender",
          "dob",
          "designation",
          "paid_leave",
          "aadhar_no",
          "pan_no",
        ];
        let values = [
          data.user_type,
          data.branch_id,
          data.role_id,
          data.department_id,
          data.name,
          data.email,
          data.contact,
          hashPassword,
          data.gender,
          data.dob,
          data.designation,
          data.paid_leave,
          data.aadhar_no,
          data.pan_no,
        ];

        const filteredPairs = columns.reduce((acc, column, index) => {
          if (
            values[index] !== undefined &&
            values[index] !== "" &&
            values[index] !== null
          ) {
            acc.push(`${column} = '${values[index]}'`);
          }
          return acc;
        }, []);
        let qry;

        if (filteredPairs.length === 0) {
          console.error("No data provided to insert.");
        } else {
          qry = `INSERT INTO ${table_name} SET ${filteredPairs.join(", ")}`;
        }
        // let qry = `insert into ${table_name} (company_id,role_id, department_id, name, email, contact, password, gender, dob, designation, paid_leave) values('${data.company_id}', '${data.role_id}', '${data.department_id}',  '${data.name}','${data.email}','${data.contact}','${hashPassword}','${data.gender}','${data.dob}','${data.designation}', '${data.paid_leave}')`;
        userModel.getAll(qry, (err, result) => {
          if (err) {
            res.status(err.statucode).send({
              message: err.message,
              status: err.status,
              data: err.data,
            });
          } else {
            res.status(result.statucode).send({
              message: result.message,
              status: result.status,
              data: result.data,
            });
          }
        });
      } else {
        res.status(403).send({
          message: "User already exists",
          status: false,
          data: [],
        });
      }
    });
  } else {
    res.status(400).send({
      message:
        "Please Provide Name, Email, Contact Number, Gender, Password, designation & Paid leave",
      status: false,
      data: [],
    });
  }
};

exports.updateUser = async (req, res, next) => {
  let data = req.body;

  const id = req.params.id;

  if (
    data.name != "" &&
    data.name != null &&
    data.contact != "" &&
    data.contact != null
  ) {
    let fields = `name = '${data.name}', contact = '${data.contact}', designation = '${data.designation}' `;

    if (data.paid_leave != "" && data.paid_leave != null) {
      fields += `, paid_leave = '${data.paid_leave}'`;
    }

    if (data.role_id != "" && data.role_id != null) {
      fields += `, role_id = '${data.role_id}'`;
    }

    if (data.department_id != "" && data.department_id != null) {
      fields += `, department_id = '${data.department_id}'`;
    }

    if (data.password != "" && data.password != null) {
      let hashPassword = await encPassword(data.password);

      fields += `, password = '${hashPassword}'`;
    }

    if (data.gender != "" && data.gender != null) {
      fields += `, gender = '${data.gender}'`;
    }

    if (data.dob != "" && data.dob != null) {
      fields += `, dob = '${data.dob}'`;
    }

    if (data.aadhar_no != null) {
      fields += `, aadhar_no = '${data.aadhar_no}'`;
    }

    if (data.pan_no != null) {
      fields += `, pan_no = '${data.pan_no}'`;
    }

    if (data.paid_leave != "" && data.paid_leave != null) {
      fields += `, paid_leave = '${data.paid_leave}'`;
    }

    if (data.email != "" && data.email != null) {
      fields += `, email = '${data.email}'`;
    }

    if (data.branch_id != "" && data.branch_id != null) {
      fields += `, branch_id = '${data.branch_id}'`;
    }

    let qry = `UPDATE ${table_name} SET ${fields} WHERE id = '${id}'`;
    console.log("qry: ", qry);

    userModel.getAll(qry, (err, result) => {
      if (err) {
        res.status(err.statucode).send({
          message: err.message,
          status: err.status,
          data: err.data,
        });
      } else {
        res.status(result.statucode).send({
          message: result.message,
          status: result.status,
          data: result.data,
        });
      }
    });
  } else {
    res.status(400).send({
      message: "Please Provide User Details",
      status: false,
      data: [],
    });
  }
};

exports.deleteUser = async (req, res, next) => {
  const id = req.params.id;

  if (id != "" && id != null && id > 0) {
    let qry1 = `select * from ${table_name} where id='${id}' AND status='1'`;

    userModel.getAll(qry1, (err, response) => {
      if (response.data.length > 0) {
        let fields = `status = 0`;

        let qry = `UPDATE ${table_name} SET ${fields} WHERE id = '${id}'`;

        userModel.getAll(qry, (err, result) => {
          if (err) {
            res.status(err.statucode).send({
              message: err.message,
              status: err.status,
              data: err.data,
            });
          } else {
            res.status(result.statucode).send({
              message: "User Deleted Successfully",
              status: result.status,
              data: result.data,
            });
          }
        });
      } else {
        res.status(403).send({
          message: "User Not exists",
          status: false,
          data: [],
        });
      }
    });
  } else {
    res.status(400).send({
      message: "Please Provide User id",
      status: false,
      data: [],
    });
  }
};

exports.login = async (req, res, next) => {
  let data = req.body;

  if (
    data.email != "" &&
    data.email != null &&
    data.password != "" &&
    data.password != null
  ) {
    let fields = ` email = '${data.email}'`;
    let fields2 = ` u.email = '${data.email}'`;

    let qry = `SELECT * FROM ${table_name}  WHERE ${fields}`;

    userModel.getAll(qry, async (error, result) => {
      if (result.data.length > 0) {
        let newPassword = "";

        let dbPassword = result.data[0].password;

        newPassword = await decPassword(data.password, dbPassword);

        if (newPassword == true) {
          let qry2 = `SELECT u.*, b.name AS branchName, b.checkin_time AS branchCheckinTime, b.checkout_time AS branchCheckoutTime, b.company_id, ut.name AS userTypeName, c.name AS company_name
          FROM 
              ${table_name} AS u
          JOIN 
              branch AS b ON u.branch_id = b.id
          JOIN company AS c ON b.company_id = c.id
          JOIN user_type AS ut ON u.user_type = ut.id 
          WHERE 
              ${fields2};
      `;

          userModel.getAll(qry2, (err, userData) => {
            if (err) {
              res.status(err.statucode).send({
                message: err.message,
                status: err.status,
                data: err.data,
              });
            } else {
              // console.log("userData: ", userData);
              jwt.sign({ userData }, authKey.key, (error, result2) => {
                res.status(userData.statucode).send({
                  message: "User Login Successfully",
                  status: userData.status,
                  data: userData.data[0],
                  token: result2,
                });
              });
            }
          });
        } else {
          res.status(result.statucode).send({
            message: "Please enter a valid Password",
            status: false,
            data: [],
          });
        }
      } else {
        res.status(403).send({
          message: "User Not Exist",
          status: false,
          data: [],
        });
      }
    });
  } else {
    res.status(400).send({
      message: "Please provide a Email Address & Password",
      status: false,
      data: [],
    });
  }
};
// admin login
exports.adminLogin = async (req, res, next) => {
  let data = req.body;
  console.log("data: ", data);

  if (
    data.email != "" &&
    data.email != null &&
    data.password != "" &&
    data.password != null
  ) {
    let fields = ` email = '${data.email}'`;
    let fields2 = ` u.email = '${data.email}'`;

    let checkUserType = `SELECT * FROM ${table_name} WHERE user_type = ${data.user_type}`;

    db.query(checkUserType, async (error, result) => {
      if (error) {
        console.log(error);
      } else {
        if (!Array.isArray(result)) {
          return res.send("Invalid result format");
        }

        const isEmailFound = result.some(
          (usertypecheck) => usertypecheck.email === data.email
        );

        if (!isEmailFound) {
          return res.status(405).send({ message: "User type not allowed" });
        }

        let qry = `SELECT * FROM ${table_name}  WHERE ${fields}`;

        userModel.getAll(qry, async (error, result) => {
          if (result.data.length > 0) {
            let newPassword = "";

            let dbPassword = result.data[0].password;

            newPassword = await decPassword(data.password, dbPassword);

            if (newPassword == true) {
              let qry2 = `SELECT u.*, b.name AS branchName, b.checkin_time AS branchCheckinTime, b.checkout_time AS branchCheckoutTime, b.company_id, ut.name AS userTypeName, c.name AS company_name
          FROM 
              ${table_name} AS u
          JOIN 
              branch AS b ON u.branch_id = b.id
          JOIN company AS c ON b.company_id = c.id
          JOIN user_type AS ut ON u.user_type = ut.id 
          WHERE 
              ${fields2};
      `;

              userModel.getAll(qry2, (err, userData) => {
                if (err) {
                  res.status(err.statucode).send({
                    message: err.message,
                    status: err.status,
                    data: err.data,
                  });
                } else {
                  // console.log("userData: ", userData);
                  jwt.sign({ userData }, authKey.key, (error, result2) => {
                    res.status(userData.statucode).send({
                      message: "User Login Successfully",
                      status: userData.status,
                      data: userData.data[0],
                      token: result2,
                    });
                  });
                }
              });
            } else {
              res.status(result.statucode).send({
                message: "Please enter a valid Password",
                status: false,
                data: [],
              });
            }
          } else {
            res.status(403).send({
              message: "User Not Exist",
              status: false,
              data: [],
            });
          }
        });
      }
    });
  } else {
    res.status(400).send({
      message: "Please provide a Email Address & Password",
      status: false,
      data: [],
    });
  }
};

exports.getUserForAdmin = (req, res, next) => {
  let userDetails = req.query.userDetails || "";

  let company_id = req.query.company_id || "";

  let per_page = req.query.per_page || 20;

  let skip_count = req.query.skip_count || 0;

  let where = ` u.status = '1' `;

  if (userDetails != "" && userDetails != null) {
    where += ` AND u.name LIKE '%${userDetails}%' OR u.email LIKE '%${userDetails}%' OR u.contact LIKE '%${userDetails}%' `;
  }

  if (company_id != "" && company_id != null) {
    where += ` AND company_id = '${company_id}' `;
  }

  let order = " Order by u.id desc";

  let qry = `SELECT u.id, u.branch_id, c.name AS company_name, u.name, u.email, u.contact, u.gender, u.dob, u.designation, u.profile_image, u.aadhar_no, u.pan_no, u.status 
  FROM users AS u 
  LEFT JOIN branch AS c ON u.branch_id = c.id 
  WHERE ${where} 
  ${order} 
  LIMIT ${per_page} 
  OFFSET ${skip_count}`;

  userModel.getAll(qry, (err, result) => {
    if (err) {
      res.status(err.statucode).send({
        message: err.message,
        status: err.status,
        data: err.data,
      });
    } else {
      res.status(result.statucode).send({
        message: result.message,
        status: result.status,
        data: result.data,
      });
    }
  });
};

exports.updateUserImage = async (req, res, next) => {
  let data = req.body;

  const id = req.params.id;

  if (
    id != "" &&
    id != null &&
    id > 0 &&
    data.profile_img != "" &&
    data.profile_img != null
  ) {
    let imageName =
      image_path + "user-img-" + moment().format("YYYY-MM-DD-HH-mm-ss");

    let profile_img = "";

    if (data.profile_img != null && data.profile_img != "") {
      profile_img = await decodeBase64Image(data.profile_img, imageName);
    }

    let qry = `UPDATE ${table_name} SET profile_image = '${profile_img}' WHERE id = '${id}'`;

    userModel.getAll(qry, (err, result) => {
      if (err) {
        res.status(err.statucode).send({
          message: err.message,
          status: err.status,
          data: err.data,
        });
      } else {
        res.status(result.statucode).send({
          message: result.message,
          status: result.status,
          data: result.data,
        });
      }
    });
  } else {
    res.status(400).send({
      message: "Please Provide Basic Information",
      status: false,
      data: [],
    });
  }
};

exports.getHeadUsers = async (req, res, next) => {
  let company_id = req.query.company_id;
  let department_id = req.query.department_id;
  try {
    let qry = `SELECT * FROM ${table_name} WHERE company_id = ${company_id} AND department_id = ${department_id} AND role_id = 1 AND status = 1`;

    userModel.getAll(qry, (err, result) => {
      if (err) {
        res.status(err.statucode).send({
          message: err.message,
          status: err.status,
          data: err.data,
        });
      } else {
        res.status(result.statucode).send({
          message: result.message,
          status: result.status,
          data: result.data,
        });
      }
    });
  } catch (error) {
    return res.staus(500).send({ message: "Some internal error", data: error });
  }
};
