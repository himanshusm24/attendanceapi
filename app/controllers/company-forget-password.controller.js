const express = require("express");

const routes = express.Router();

const db = require("../model/db");

const sendEmail = require("./../middelware/sendEmail");

const encPassword = require("./../middelware/enc-password");

const table_name = "company";

const admintable_name = "admin";

const table_otp = "otp_verification";

exports.forgotPassword = async (req, res) => {
  let companyData = req.body.userData || "";
  let userType = req.body.optFor;

  let where = `status = '1' `;

  if (companyData != "") {
    where += `AND email = '${companyData}'`;
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
      //   console.log("result: ", result);
      if (result.length > 0) {
        let companyDetails = result[0];

        let otp = Math.floor(100000 + Math.random() * 900000);

        let sql2 = `insert into ${table_otp} (user_id, user_email, user_contact, otp_for,  otp) values('${companyDetails.id}','${companyDetails.email}','${companyDetails.contact}','${userType}','${otp}')`;

        let companyEmail = companyDetails.email;
        let companySubject = "Forgot Password";
        let companyMessage = `Dear User your Forgot Password OTP is <h2>${otp}</h2>
                
                    Please do not share otp with others due to security issues <br/><br/>
                    
                    <p>
                        Thanks & Regards<br/>
                        Team Second Medic
                    </p>`;

        let mailResponse = sendEmail(
          companyEmail,
          companySubject,
          companyMessage
        );

        companyDetails = { ...companyDetails, otp: otp };

        db.query(sql2, (err, result) => {
          res.status(200).send({
            message: result.message,
            status: result.status,
            data: companyDetails,
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
  let companyData = req.body.companyData || "";
  let companyOtp = req.body.companyOtp || "";
  let where = `otp_status = '0' AND otp_for = 'company' `;
  if (companyData != "") {
    where += ` AND user_email = '${companyData}' OR user_contact = '${companyData}'`;
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
        let companyDetails = result[0];

        if (companyDetails.otp == companyOtp) {
          let sql2 = `update ${table_otp} set otp_status = '1' where user_id = '${companyDetails.user_id}'`;

          db.query(sql2, (err, result2) => {});

          let sql3 = `select * from ${table_name} where id = '${companyDetails.user_id}'`;
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
          message: "Company Not Exist",
          status: false,
          data: [],
        });
      }
    }
  });
};

exports.changePassword = (req, res) => {
  let companyId = req.body.userId || "";

  let companyData = req.body.userData || "";

  let companyPassword = req.body.userPassword || "";

  let companyConfirmPassword = req.body.userConfirmPassword || "";

  let where = `status = '1'`;

  if (companyData != "") {
    where += ` AND id = '${companyId}' AND email = '${companyData}'`;
  }

  let sql = `select * from ${table_name} where ${where}`;

  db.query(sql, async (err, result) => {
    if (err) {
      return res.status(500).send({
        message: "Something went wrong " + err.message,
        status: false,
        data: [],
      });
    } else {
      if (companyPassword != companyConfirmPassword) {
        return res.send("Password didn't match");
      }

      if (result.length > 0) {
        let companyDetails = result[0];

        // let newPassword = await encPassword(companyPassword);

        let sql2 = `update ${table_name} set password = '${companyPassword}' where id = '${companyDetails.id}'`;

        db.query(sql2, (err, result2) => {
          if (err) {
            return res.status(500).send({
              message: "Something went wrong " + err.message,
              status: false,
              data: [],
            });
          } else {
            return res.status(200).send({
              message: "Password changed Successfully",
              status: true,
              data: result2,
            });
          }
        });
      } else {
        return res.status(400).send({
          message: "User Not Exist",
          status: false,
          data: [],
        });
      }
    }
  });
};

exports.adminforgotPassword = async (req, res, next) => {
  let adminData = req.body.userData || "";

  let where = `status = '1' `;

  if (adminData != "") {
    where += `AND email = '${adminData}'`;
  }

  let sql = `select * from ${admintable_name} where ${where} `;

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
            data: adminDetails,
          });
        });
      } else {
        return res.status(404).send({
          message: "Email not registered",
          status: false,
          data: [],
        });
      }
    }
  });
};

exports.adminchangePassword = (req, res) => {
  let adminId = req.body.userId || "";

  let adminData = req.body.userData || "";

  let adminPassword = req.body.userPassword || "";

  let where = `status = '1'`;

  if (adminData != "") {
    where += ` AND id = '${adminId}' AND email = '${adminData}'`;
  }

  let sql = `select * from ${admintable_name} where ${where}`;

  db.query(sql, async (err, result) => {
    if (err) {
      return res.status(500).send({
        message: "Something went wrong " + err.message,
        status: false,
        data: [],
      });
    } else {
      if (result.length > 0) {
        let adminDetails = result[0];

        let newPassword = await encPassword(adminPassword);

        let sql2 = `update ${admintable_name} set password = '${newPassword}' where id = '${adminDetails.id}'`;

        db.query(sql2, (err, result2) => {
          if (err) {
            return res.status(500).send({
              message: "Something went wrong " + err.message,
              status: false,
              data: [],
            });
          } else {
            return res.status(200).send({
              message: "Password changed Successfully",
              status: true,
              data: result2,
            });
          }
        });
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