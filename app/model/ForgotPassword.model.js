const express = require("express");

const routes = express.Router();

const db = require("./db");

const sendEmail = require("./../middelware/sendEmail");

const encPassword = require("./../middelware/enc-password");

const table_name = "users";

const table_otp = "otp_verification";

routes.forgotPassword = async (req, res) => {
  let userData = req.userData || "";

  let where = `status = '1' `;

  if (userData != "") {
    where += ` AND email = '${userData}' OR contact = '${userData}'`;
  }

  let sql = `select id, name, email, contact, gender, dob from ${table_name} where ${where} `;

  db.query(sql, async (err, result) => {
    if (err) {
      res(
        {
          message: "Something went wrong " + err.message,
          statusCode: 500,
          status: false,
          data: [],
        },
        null
      );
    } else {
      if (result.length > 0) {
        let userDetails = result[0];

        let otp = Math.floor(100000 + Math.random() * 900000);

        let sql2 = `insert into ${table_otp} (user_id, user_email, user_contact, otp_for,  otp) values('${userDetails.id}','${userDetails.email}','${userDetails.contact}','users','${otp}')`;

        let userEmail = userDetails.email;
        let userSubject = "Forgot Password";
        let userMessage = `Dear User your Forgot Password OTP is <h2>${otp}</h2>
                
                    Please do not share otp with others due to security issues <br/><br/>
                    
                    <p>
                        Thanks & Regards<br/>
                        Team Second Medic
                    </p>`;

        let mailResponse = sendEmail(userEmail, userSubject, userMessage);

        userDetails = { ...userDetails, otp: otp };

        db.query(sql2, (err, result) => {
          res(null, {
            message: "OTP Send successfully",
            statusCode: 200,
            status: true,
            data: userDetails,
          });
        });
      } else {
        res(null, {
          message: "User Not Exist",
          statusCode: 400,
          status: false,
          data: [],
        });
      }
    }
  });
};

routes.verifyOtp = (req, res) => {
  let userData = req.userData || "";

  let userOtp = req.userOtp || "";

  let optFor = req.otpFor || "";

  let where = `otp_status = '0' AND otp_for = '${optFor}'`;

  if (userData != "") {
    where += ` AND user_email = '${userData}' OR user_contact = '${userData}'`;
  }

  let sql = `select user_id, user_email, user_contact, otp from ${table_otp} where ${where} ORDER BY id DESC`;

  db.query(sql, (err, result) => {
    console.log("result: ", result);
    if (err) {
      res(
        {
          message: "Something went wrong " + err.message,
          statusCode: 500,
          status: false,
          data: [],
        },
        null
      );
    } else {
      if (result.length > 0) {
        let userDetails = result[0];

        if (userDetails.otp == userOtp) {
          let sql2 = `update ${table_otp} set otp_status = '1' where user_id = '${userDetails.user_id}'`;

          db.query(sql2, (err, result2) => {});

          let tableData = userDetails["otp_for"];

          let sql3;

          if (tableData == "company") {
            sql3 = `select id, name, email, contact, gender, dob from company where id = '${userDetails.user_id}'`;
          } else {
            sql3 = `select id, name, email, contact, gender, dob from ${table_name} where id = '${userDetails.user_id}'`;
          }

          db.query(sql3, (err, result3) => {
            res(null, {
              message: "OTP Verify successfully",
              statusCode: 200,
              status: true,
              data: "",
            });
          });
        } else {
          res(null, {
            message: "Please Enter Correct Otp",
            statusCode: 403,
            status: false,
            data: [],
          });
        }
      } else {
        res(null, {
          message: "User Not Exist",
          statusCode: 400,
          status: false,
          data: [],
        });
      }
    }
  });
};

routes.changePassword = (req, res) => {
  let userId = req.userId || "";

  let userData = req.userData || "";

  let userPassword = req.userPassword || "";

  let where = `status = '1'`;

  if (userData != "") {
    where += ` AND id = '${userId}' AND email = '${userData}'`;
  }

  let sql = `select * from ${table_name} where ${where}`;

  db.query(sql, async (err, result) => {
    if (err) {
      res(
        {
          message: "Something went wrong " + err.message,
          statusCode: 500,
          status: false,
          data: [],
        },
        null
      );
    } else {
      if (result.length > 0) {
        let userDetails = result[0];

        let newPassword = await encPassword(userPassword);

        let sql2 = `update ${table_name} set password = '${newPassword}' where id = '${userDetails.id}'`;

        db.query(sql2, (err, result2) => {
          if (err) {
            res(
              {
                message: "Something went wrong " + err.message,
                statusCode: 500,
                status: false,
                data: [],
              },
              null
            );
          } else {
            res(null, {
              message: "Password changed Successfully",
              statusCode: 200,
              status: true,
              data: result2,
            });
          }
        });
      } else {
        res(null, {
          message: "User Not Exist",
          statusCode: 400,
          status: false,
          data: [],
        });
      }
    }
  });
};

module.exports = routes;
