const express = require("express");

const userModel = require("../model/model");

const encPassword = require("./../middelware/enc-password");

const decPassword = require("./../middelware/dec-password");

const authKey = require("./../config/jwt");

const jwt = require("jsonwebtoken");

const table_name = "admin";

const table_otp = "otp_verification";

exports.getAdmin = (req, res, next) => {
  let user_id = req.query.user_id;

  //   let qry = `select id, name, email, contact, profile_image, status, company_name, company_email, company_address, company_bussiness_type, company_contact_no, company_pan_no, company_registration_no,company_epf_no, company_established_date from ${table_name} where status = 1`;
  let qry = `select * from ${table_name} where status = 1`;

  if (user_id > 0) {
    qry += ` AND id = ${user_id}`;
  }

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

exports.updateAdmin = async (req, res, next) => {
  let data = req.body;

  const id = req.params.id;

  if (data.company_name != "" && data.company_name != null) {
    let fields = `company_name = '${data.company_name}'`;

    if (data.company_email != "" && data.company_email != null) {
      fields += `, company_email = '${data.company_email}'`;
    }
    if (data.company_address != "" && data.company_address != null) {
      fields += `, company_address = '${data.company_address}'`;
    }
    if (
      data.company_bussiness_type != "" &&
      data.company_bussiness_type != null
    ) {
      fields += `, company_bussiness_type = '${data.company_bussiness_type}'`;
    }
    if (data.company_contact_no != "" && data.company_contact_no != null) {
      fields += `, company_contact_no = '${data.company_contact_no}'`;
    }
    if (data.company_pan_no != "" && data.company_pan_no != null) {
      fields += `, company_pan_no = '${data.company_pan_no}'`;
    }
    if (
      data.company_registration_no != "" &&
      data.company_registration_no != null
    ) {
      fields += `, company_registration_no = '${data.company_registration_no}'`;
    }
    if (data.company_epf_no != "" && data.company_epf_no != null) {
      fields += `, company_epf_no = '${data.company_epf_no}'`;
    }
    if (data.company_gst_no != "" && data.company_gst_no != null) {
      fields += `, company_gst_no = '${data.company_gst_no}'`;
    }
    if (
      data.company_established_date != "" &&
      data.company_established_date != null
    ) {
      fields += `, company_established_date = '${data.company_established_date}'`;
    }
    if (data.company_country != "" && data.company_country != null) {
      fields += `, company_country = '${data.company_country}'`;
    }
    if (data.company_state != "" && data.company_state != null) {
      fields += `, company_state = '${data.company_state}'`;
    }
    if (data.company_city != "" && data.company_city != null) {
      fields += `, company_city = '${data.company_city}'`;
    }

    if (data.password != "" && data.password != null) {
      let hashPassword = await encPassword(data.password);

      fields += `, password = '${hashPassword}'`;
    }

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
          message: result.message,
          status: result.status,
          data: result.data,
        });
      }
    });
  } else {
    res.status(400).send({
      message: "Please Provide Name & Contact Number",
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

    let qry = `SELECT * FROM ${table_name}  WHERE ${fields}`;

    userModel.getAll(qry, async (error, result) => {
      if (result.data.length > 0) {
        let newPassword = "";

        let dbPassword = result.data[0].password;

        newPassword = await decPassword(data.password, dbPassword);

        if (newPassword == true) {
          let qry2 = `SELECT id, name, email, contact, company_name FROM ${table_name}  WHERE  ${fields}`;

          userModel.getAll(qry2, (err, userData) => {
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
                (error, result2) => {
                  res.status(userData.statucode).send({
                    message: "Admin Login Successfully",
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
            message: "Please Enter a valid Email & Password",
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

exports.forgotPassword = async (req, res, next) => {
  let adminData = req.body.userData || "";

  let where = `status = '1' `;

  if (adminData != "") {
    where += `AND email = '${adminData}'`;
  }

  let sql = `select * from ${table_name} where ${where} `;

  db.query(sql, async (err, result) => {
    if (err) {
      return res.status(500).send({
        message: "Something went wrong " + err.message,
        status: false,
        data: [],
      });
    } else {
      // console.log("result: ", result);
      if (result.length > 0) {
        let adminDetails = result[0];

        let otp = Math.floor(100000 + Math.random() * 900000);

        let sql2 = `insert into ${table_otp} (user_id, user_email, user_contact, otp_for,  otp) values('${adminDetails.id}','${adminDetails.email}','${adminDetails.contact}','admin','${otp}')`;

        let adminEmail = adminDetails.email;
        let adminSubject = "Forgot Password";
        let adminMessage = `Dear User your Forgot Password OTP is <h2>${otp}</h2>
                
                    Please do not share otp with others due to security issues <br/><br/>
                    
                    <p>
                        Thanks & Regards<br/>
                        Team Second Medic
                    </p>`;

        let mailResponse = sendEmail(adminEmail, adminSubject, adminMessage);

        adminDetails = { ...adminDetails, otp: otp };

        db.query(sql2, (err, result) => {
          res.status(200).send({
            message: result.message,
            status: result.status,
            data: result.data,
          });
        });
      } else {
        return res.status(404).send({
          message: "Company data not found",
          status: false,
          data: [],
        });
      }
    }
  });
};

exports.verifyOtp = (req, res) => {
  let adminData = req.body.adminData || "";
  let adminOtp = req.body.adminOtp || "";
  let where = `otp_status = '0' AND otp_for = 'admin' `;
  if (adminData != "") {
    where += ` AND user_email = '${adminData}' OR user_contact = '${adminData}'`;
  }
  let sql = `select user_id, user_email, user_contact, otp from ${table_otp} where ${where} ORDER BY id DESC`;
  db.query(sql, (err, result) => {
    console.log("sql: ", sql);
    if (err) {
      return res.status(500).send({
        message: "Something went wrong " + err.message,
        status: false,
        data: [],
      });
    } else {
      if (result.length > 0) {
        let adminDetails = result[0];

        if (adminDetails.otp == adminOtp) {
          let sql2 = `update ${table_otp} set otp_status = '1' where user_id = '${adminDetails.user_id}'`;

          db.query(sql2, (err, result2) => {});

          let sql3 = `select * from ${table_name} where id = '${adminDetails.user_id}'`;
          db.query(sql3, (err, result3) => {
            return res.status(200).send({
              message: "OTP Verify successfully",
              status: true,
              data: result3,
            });
          });
        } else {
          return res.status(403).send({
            message: "Please Enter Correct Otp",
            status: false,
            data: [],
          });
        }
      } else {
        return res.status(400).send({
          message: "Admin Not Exist",
          status: false,
          data: [],
        });
      }
    }
  });
};
