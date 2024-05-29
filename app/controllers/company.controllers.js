const express = require("express");

const companyModel = require("../model/model");

const encPassword = require("./../middelware/enc-password");

const decPassword = require("./../middelware/dec-password");

const authKey = require("./../config/jwt");

const jwt = require("jsonwebtoken");

const table_name = "branch";

exports.getCompany = (req, res, next) => {
  let branch_id = req.query.branch_id;

  // let qry = `select * from ${table_name} where status = 1`;
  let qry = `SELECT branch.*, COUNT(users.id) AS user_count
  FROM branch
  LEFT JOIN users ON branch.id = users.branch_id
  WHERE branch.status = 1
  GROUP BY branch.id`;

  if (branch_id > 0) {
    qry += ` AND branch.id = ${branch_id}`;
  }

  qry += " Order by branch.id desc";

  companyModel.getAll(qry, (err, result) => {
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

exports.createCompany = async (req, res, next) => {
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
    data.address != "" &&
    data.address != null &&
    data.checkin_time != "" &&
    data.checkin_time != null &&
    data.checkout_time != "" &&
    data.checkout_time != null &&
    data.admin_id != "" &&
    data.admin_id != null
  ) {
    // let hashPassword = await encPassword(data.password);

    let qry1 = `select * from ${table_name} where email='${data.email}'`;

    companyModel.getAll(qry1, (err, result) => {
      if (result.data.length == 0) {
        let qry = `insert into ${table_name} (name, email, contact, head_company, password, address, checkin_time, checkout_time) values('${data.name}','${data.email}','${data.contact}', '${data.admin_id}','${data.password}','${data.address}', '${data.checkin_time}', '${data.checkout_time}')`;

        companyModel.getAll(qry, (err, result) => {
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
      message: "Please Provide Name, Email, Contact Number, Password & Address",
      status: false,
      data: [],
    });
  }
};

exports.updateCompany = async (req, res, next) => {
  let data = req.body;
  const id = req.params.id;
  if (
    data.name != "" &&
    data.name != null &&
    data.contact != "" &&
    data.contact != null &&
    data.address != "" &&
    data.address != null &&
    data.checkin_time != "" &&
    data.checkin_time != null &&
    data.checkout_time != "" &&
    data.checkout_time != null
  ) {
    let fields = `name = '${data.name}', contact = '${data.contact}', address = '${data.address}', checkin_time = '${data.checkin_time}', checkout_time = '${data.checkout_time}'`;
    // let fields = `name = '${data.name}', contact = '${data.contact}', address = '${data.address}' checkin_time = '${data.checkin_time}', checkout_time = '${data.checkout_time}'`;

    if (data.email != "") {
      fields += `, email = '${data.email}'`;
    }

    if (data.password != "") {
      // let hashPassword = await encPassword(data.password);
      fields += `, password = '${data.password}'`;
    }
    let qry = `UPDATE ${table_name} SET ${fields} WHERE id = '${id}'`;
    companyModel.getAll(qry, (err, result) => {
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
      message: "Please Provide Name,  Contact Number & Address",
      status: false,
      data: [],
    });
  }
};

exports.deleteCompany = async (req, res, next) => {
  const id = req.params.id;

  if (id != "" && id != null && id > 0) {
    let fields = `status = 0`;

    let qry = `UPDATE ${table_name} SET ${fields} WHERE id = '${id}'`;

    companyModel.getAll(qry, (err, result) => {
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
      message: "Please Provide Company id",
      status: false,
      data: [],
    });
  }
};

exports.login = async (req, res, next) => {
  let data = req.body;
  const id = req.params.id;

  if (
    data.email != "" &&
    data.email != null &&
    data.password != "" &&
    data.password != null
  ) {
    let fields = ` email = '${data.email}'`;

    let qry = `SELECT * FROM ${table_name}  WHERE  ${fields}`;

    companyModel.getAll(qry, async (error, result) => {
      if (result.data.length > 0) {
        // let newPassword = "";

        let dbPassword = result.data[0].password;

        // newPassword = await decPassword(data.password, dbPassword);

        let fields2 = ` ${table_name}.email = '${data.email}'`;

        if (dbPassword == data.password) {
          let qry2 = `SELECT ${table_name}.id, ${table_name}.name, ${table_name}.email, ${table_name}.contact, ${table_name}.address, admin.company_name FROM ${table_name} JOIN admin ON admin.id = ${table_name}.head_company  WHERE  ${fields2}`;

          companyModel.getAll(qry2, (err, userData) => {
            if (err) {
              res.status(err.statucode).send({
                message: err.message,
                status: err.status,
                data: err.data,
              });
            } else {
              jwt.sign(
                { userData },
                authKey.key,
                { expiresIn: "3000000s" },
                (error, result2) => {
                  res.status(userData.statucode).send({
                    message: "Company Login Successfully",
                    status: userData.status,
                    data: userData.data[0],
                    token: result2,
                  });
                }
              );
            }
          });
        } else {
          res.status(result.statucode).send({
            message: "Please enter a valid Email & Password",
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

exports.getHeadCompany = (req, res, next) => {
  let company_id = req.query.company_id;

  // let qry = `select * from ${table_name} where status = 1`;
  let qry = `SELECT *
  FROM company
  WHERE company.status = 1 AND company.id = ${company_id}`;

  qry += " Order by company.id desc";

  companyModel.getAll(qry, (err, result) => {
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

exports.updateHeadCompany = async (req, res, next) => {
  let data = req.body;
  const id = req.params.id;
  if (
    data.name != "" &&
    data.name != null &&
    data.contact != "" &&
    data.contact != null &&
    data.address != "" &&
    data.address != null
  ) {
    let fields = `name = '${data.name}', contact = '${data.contact}', address = '${data.address}'`;

    if (data.email != "") {
      fields += `, email = '${data.email}'`;
    }
    if (data.company_bussiness_type != "") {
      fields += `, company_bussiness_type = '${data.company_bussiness_type}'`;
    }
    if (data.company_pan_no != "") {
      fields += `, company_pan_no = '${data.company_pan_no}'`;
    }
    if (data.company_registration_no != "") {
      fields += `, company_registration_no = '${data.company_registration_no}'`;
    }
    if (data.company_epf_no != "") {
      fields += `, company_epf_no = '${data.company_epf_no}'`;
    }
    if (data.company_gst_no != "") {
      fields += `, company_gst_no = '${data.company_gst_no}'`;
    }
    if (data.company_established_date != "") {
      fields += `, company_established_date = '${data.company_established_date}'`;
    }

    let qry = `UPDATE company SET ${fields} WHERE id = '${id}'`;
    companyModel.getAll(qry, (err, result) => {
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
      message: "Please Provide Name,  Contact Number & Address",
      status: false,
      data: [],
    });
  }
};
