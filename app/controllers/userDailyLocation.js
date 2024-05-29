const db = require("../model/db");
const moment = require("moment");
const decodeBase64Image = require("./../middelware/base64toimage");
const table_name = "userdailylocation";
const image_path = "uploads/visits/";

exports.punchIn = async (req, res, next) => {
  let data = req.body;

  try {
    if (
      data.user_id != "" &&
      data.user_id != null &&
      data.branch_id != "" &&
      data.branch_id != null &&
      data.checkin_time != "" &&
      data.checkin_time != null &&
      data.attendance_date != "" &&
      data.attendance_date != null &&
      data.reason != "" &&
      data.reason != null
    ) {
      let imageName =
        image_path +
        data.user_id +
        `check-in-${moment().format("YYYY-MM-DD-HH-mm-ss")}`;

      let checkin_img = "";

      let attendance_date = moment().format("YYYY-MM-DD");
      let checkin_time = moment().format("YYYY-MM-DD HH:mm:ss");

      if (data.checkin_img != null && data.checkin_img != "") {
        checkin_img = await decodeBase64Image(data.checkin_img, imageName);
      }

      let checkin = 1;

      let checkin_address = "";
      if (data.checkin_address != undefined) {
        checkin_address = data.checkin_address;
      }

      let checkin_latitude = "";
      if (data.checkin_latitude != undefined) {
        checkin_latitude = data.checkin_latitude;
      }

      let checkin_longitude = "";
      if (data.checkin_longitude != undefined) {
        checkin_longitude = data.checkin_longitude;
      }

      let qry = `insert into ${table_name} (branch_id, user_id, checkin_address, checkin_latitude, checkin_longitude, checkin_time, checkin, checkin_img, attendance_date, reason) values('${data.branch_id}', '${data.user_id}','${checkin_address}','${checkin_latitude}','${checkin_longitude}','${checkin_time}', '${checkin}', '${checkin_img}', '${attendance_date}', '${data.reason}')`;

      db.query(qry, (err, result) => {
        if (err) {
          console.log("err: ", err);
          return res.status(500).send({
            message: "Something went wrong, please try again",
            status: true,
            data: err,
          });
        } else {
          return res.status(200).send({
            message: "Data fetched successfully",
            status: true,
            data: result,
          });
        }
      });
    } else {
      return res.status(400).send({
        message:
          "Please Provide User id, Company id, Check In Time & Attendance Date",
        status: false,
        data: [],
      });
    }
  } catch (err) {
    console.log("err: ", err);
    return res.status(500).send({
      status: false,
      data: err,
    });
  }
};

exports.punchOut = async (req, res, next) => {
  let data = req.body;

  try {
    if (
      data.user_id != "" &&
      data.user_id != null &&
      data.branch_id != "" &&
      data.branch_id != null &&
      data.checkout_time != "" &&
      data.checkout_time != null &&
      data.attendance_date != "" &&
      data.attendance_date != null &&
      data.id != "" &&
      data.id != null &&
      data.feedback != null &&
      data.feedback != null
    ) {
      let imageName =
        image_path + `check-out-${moment().format("YYYY-MM-DD-HH-mm-ss")}`;

      let checkout_img = "";

      let attendance_date = moment().format("YYYY-MM-DD");
      let checkout_time = moment().format("YYYY-MM-DD HH:mm:ss");

      if (data.checkout_img != null && data.checkout_img != "") {
        checkout_img = await decodeBase64Image(data.checkout_img, imageName);
      }

      let checkout = 1;

      let checkout_address = "";
      if (data.checkout_address != undefined) {
        checkout_address = data.checkout_address;
      }

      let checkout_latitude = "";
      if (data.checkout_latitude != undefined) {
        checkout_latitude = data.checkout_latitude;
      }

      let checkout_longitude = "";
      if (data.checkout_longitude != undefined) {
        checkout_longitude = data.checkout_longitude;
      }

      let qry = `UPDATE ${table_name} SET checkout_address = '${checkout_address}', checkout_latitude = '${checkout_latitude}',  checkout_longitude = '${checkout_longitude}', checkout_time = '${checkout_time}', checkout = ${checkout},  checkout_img = '${checkout_img}'`;

      if (data.feedback != "") {
        qry += `, checkout_feedback = '${data.feedback}'`;
      }

      qry += ` WHERE branch_id = ${data.branch_id} AND user_id = ${data.user_id} AND attendance_date = '${attendance_date}' AND id = ${data.id}`;

      // let qry = `UPDATE ${table_name} AS t1
      // INNER JOIN (
      //     SELECT MAX(id) AS max_id
      //     FROM ${table_name}
      //     WHERE branch_id = ${data.company_id}
      //     AND user_id = ${data.user_id}
      //     AND attendance_date = '${data.attendance_date}'
      // ) AS t2 ON t1.id = t2.max_id
      // SET
      //     t1.checkout_address = '${checkout_address}',
      //     t1.checkout_latitude = '${checkout_latitude}',
      //     t1.checkout_longitude = '${checkout_longitude}',
      //     t1.checkout_time = '${data.checkout_time}',
      //     t1.checkout = ${checkout},
      //     t1.checkout_img = '${checkout_img}';
      // `;

      db.query(qry, (err, result) => {
        if (err) {
          console.log("err: ", err);
          return res.status(500).send({
            message: "Something went wrong, please try again",
            status: true,
            data: err,
          });
        } else {
          return res.status(200).send({
            message: "Data fetched successfully",
            status: true,
            data: result,
          });
        }
      });
    } else {
      return res.status(400).send({
        message: "Please Provide Basic Information",
        status: false,
        data: [],
      });
    }
  } catch (err) {
    console.log("err: ", err);
    return res.status(500).send({
      status: false,
      data: err,
    });
  }
};

exports.getVisitDetails = (req, res, next) => {
  try {
    let branch_id = req.query.branch_id;
    let user_id = req.query.user_id;
    let attendance_date = req.query.attendance_date;

    let qry = `select * from ${table_name} where status = 1`;

    if (
      user_id > 0 &&
      branch_id > 0 &&
      attendance_date != "" &&
      attendance_date != null
    ) {
      qry += ` AND user_id = ${user_id} AND branch_id = ${branch_id} AND attendance_date = '${attendance_date}'`;

      db.query(qry, (err, result) => {
        if (err) {
          return res.status(500).send({
            message: "Something went wrong, please try again",
            status: true,
            data: err,
          });
        } else {
          return res.status(200).send({
            message: "Data fetched successfully",
            status: true,
            data: result,
          });
        }
      });
    } else {
      return res.status(403).send({
        message: "Please Provide User Id, companyId, attendance date",
        status: false,
        data: [],
      });
    }
  } catch (err) {
    return res.status(500).send({
      status: false,
      data: err,
    });
  }
};
