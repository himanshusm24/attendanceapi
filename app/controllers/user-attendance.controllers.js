const userModel = require("../model/model");

const decodeBase64Image = require("./../middelware/base64toimage");

const moment = require("moment");

const table_name = "user_attendance";
const table_name1 = "user_break";

const image_path = "uploads/selfiee/";

exports.getAttendacneDetails = (req, res, next) => {
  let user_id = req.query.user_id;

  let qry = `select * from ${table_name} where status = 1`;

  if (user_id > 0) {
    qry += ` AND id = ${user_id}`;

    userModel.getAll(qry, (err, result) => {
      if (err) {
        res.status(err.statusCode).send({
          message: err.message,
          status: err.status,
          data: err.data,
        });
      } else {
        res.status(result.statusCode).send({
          message: result.message,
          status: result.status,
          data: result.data,
        });
      }
    });
  } else {
    res.status(403).send({
      message: "Please Provide User Id",
      status: false,
      data: [],
    });
  }
};

// daily attendance login
exports.checkIn = async (req, res, next) => {
  let data = req.body;

  if (
    data.user_id != "" &&
    data.user_id != null &&
    data.branch_id != "" &&
    data.branch_id != null &&
    data.checkin_time != "" &&
    data.checkin_time != null &&
    data.attendance_date != "" &&
    data.attendance_date != null
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

    // let qry = `insert into ${table_name} (company_id, user_id, checkin_address, checkin_latitude, checkin_longitude, checkin_time, checkin, checkin_img, attendance_date) values('${data.company_id}', '${data.user_id}','${checkin_address}','${checkin_latitude}','${checkin_longitude}','${data.checkin_time}','${checkin}', '${checkin_img}', '${data.attendance_date}')`;

    let qry = `UPDATE ${table_name} SET branch_id = '${data.branch_id}', user_id = '${data.user_id}', checkin_address = '${checkin_address}', checkin_latitude = '${checkin_latitude}', checkin_longitude = '${checkin_longitude}', checkin_time = '${checkin_time}', checkin = '${checkin}', checkin_img = '${checkin_img}', attendance_date = '${attendance_date}', absent_status = 0  WHERE branch_id = ${data.branch_id} AND user_id = ${data.user_id} AND attendance_date = '${attendance_date}' `;

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
      message:
        "Please Provide User id, Company id, Check In Time & Attendance Date",
      status: false,
      data: [],
    });
  }
};

// daily attendance logout
exports.checkOut = async (req, res, next) => {
  let data = req.body;

  if (
    data.user_id != "" &&
    data.user_id != null &&
    data.company_id != "" &&
    data.company_id != null &&
    data.checkout_time != "" &&
    data.checkout_time != null &&
    data.attendance_date != "" &&
    data.attendance_date != null
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

    let qry = `UPDATE ${table_name} SET checkout_address = '${checkout_address}', checkout_latitude = '${checkout_latitude}',  checkout_longitude = '${checkout_longitude}',
         checkout_time = '${checkout_time}', checkout = ${checkout},  checkout_img = '${checkout_img}' WHERE company_id = ${data.company_id} AND user_id = ${data.user_id} AND attendance_date = '${attendance_date}'`;

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

// to check daily attendance logs
exports.getAttendacneDailyLog = (req, res, next) => {
  let branch_id = req.body.branch_id;
  let user_id = req.body.user_id;
  let attendance_date = req.body.attendance_date;

  let qry = `select * from ${table_name} where status = 1`;

  if (
    user_id > 0 &&
    branch_id > 0 &&
    attendance_date != "" &&
    attendance_date != null
  ) {
    qry += ` AND user_id = ${user_id} AND branch_id = ${branch_id} AND attendance_date = '${attendance_date}'`;

    userModel.getAll(qry, (err, result) => {
      if (err) {
        res.status(err.statucode).send({
          message: err.message,
          status: err.status,
          data: err.data,
        });
      } else {
        res.status(result.statucode).send({
          message: "Details Fetched Sucessfully",
          status: result.status,
          data: result.data[0],
        });
      }
    });
  } else {
    res.status(403).send({
      message: "Please Provide Company Id,  User Id & Attendance Date",
      status: false,
      data: [],
    });
  }
};

exports.getAttendacneMonthlyLog = (req, res, next) => {
  let branch_id = req.body.branch_id;
  let user_id = req.body.user_id;
  let attendance_date = req.body.attendance_date;

  let att_date = attendance_date.split("-");

  let qry = `select * from ${table_name} where status = 1`;

  if (
    user_id > 0 &&
    branch_id > 0 &&
    attendance_date != "" &&
    attendance_date != null
  ) {
    let where = ` AND user_id = ${user_id} AND branch_id = ${branch_id} AND DATE_FORMAT(attendance_date, '%Y') = '${att_date[0]}' AND  DATE_FORMAT(attendance_date, '%m') = '${att_date[1]}'`;

    qry += where;

    let presnet_qry = `select Count(*) as present_count from ${table_name} where status = 1 ${where} AND checkin = 1 AND checkout = 1`;

    userModel.getAll(presnet_qry, (error, present) => {
      req.present_count = present.data[0].present_count;
    });

    let half_qry = `select Count(*) as half_count from ${table_name} where status = 1 ${where} AND checkin = 1 AND checkout = 0`;

    userModel.getAll(half_qry, (error, present) => {
      req.half_count = present.data[0].half_count;
    });

    userModel.getAll(qry, (err, result) => {
      if (err) {
        res.status(err.statucode).send({
          message: err.message,
          status: err.status,
          data: err.data,
        });
      } else {
        res.status(result.statucode).send({
          message: "Details Fetched Sucessfully",
          status: result.status,
          present_count: req.present_count,
          half_count: req.half_count,
          data: result.data,
        });
      }
    });
  } else {
    res.status(403).send({
      message: "Please Provide Company Id,  User Id & Attendance Date",
      status: false,
      data: [],
    });
  }
};

exports.breakIn = async (req, res, next) => {
  let data = req.body;
  // console.log("data: ", data);

  if (
    data.user_id != "" &&
    data.user_id != null &&
    data.branch_id != "" &&
    data.branch_id != null &&
    data.attendance_date != "" &&
    data.attendance_date != null
  ) {
    let qry = `insert into ${table_name1} (branch_id, user_id, break_startTime, attendance_date, remark) values('${data.branch_id}', '${data.user_id}','${data.break_startTime}', '${data.attendance_date}', '${data.remark}')`;

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
      message:
        "Please Provide User id, Company id, Break In Time & Attendance Date",
      status: false,
      data: [],
    });
  }
};

exports.breakOut = async (req, res, next) => {
  let data = req.body;
  console.log("data: ", data);

  if (
    data.user_id != "" &&
    data.user_id != null &&
    data.branch_id != "" &&
    data.branch_id != null &&
    data.break_endTime != "" &&
    data.break_endTime != null &&
    data.attendance_date != "" &&
    data.attendance_date != null
  ) {
    // let qry = `
    //   UPDATE ${table_name1}
    //   SET break_endTime = '${data.break_endTime}'
    //   WHERE id = (
    //       SELECT id
    //       FROM ${table_name1}
    //       WHERE branch_id = ${data.branch_id}
    //       AND user_id = ${data.user_id}
    //       AND attendance_date = '${data.attendance_date}'
    //       ORDER BY created_at DESC
    //       LIMIT 1
    //   );
    //   `;
    let qry = `UPDATE ${table_name1}
    SET break_endTime = '${data.break_endTime}'
    WHERE branch_id = ${data.branch_id}
      AND user_id = ${data.user_id}
      AND attendance_date = '${data.attendance_date}'
    ORDER BY created_at DESC
    LIMIT 1
    `;

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

exports.getBreakIn = async (req, res, next) => {
  let branch_id = req.body.branch_id;
  let user_id = req.body.user_id;
  let attendance_date = req.body.attendance_date;
  let id = req.body.id;

  let qry = `select * from ${table_name1} where id = ${id}`;

  if (user_id > 0 && branch_id > 0) {
    qry += ` AND user_id = ${user_id} AND branch_id = ${branch_id} AND attendance_date = '${attendance_date}'`;

    userModel.getAll(qry, (err, result) => {
      if (err) {
        res.status(err.statucode).send({
          message: err.message,
          status: err.status,
          data: err.data,
        });
      } else {
        // console.log(result)
        res.status(result.statucode).send({
          message: "Details Fetched Sucessfully",
          status: result.status,
          data: result.data[0],
        });
      }
    });
  }
};

exports.BreakUpdate = async (req, res, next) => {
  let data = req.body;
  let branch_id = req.body.branch_id;
  let user_id = req.body.user_id;
  let attendance_date = req.body.attendance_date;
  let breakId = req.body.breakId;
  let id = req.body.id;

  if (
    user_id > 0 &&
    branch_id > 0 &&
    attendance_date != "" &&
    attendance_date != null
  ) {
    let updateQry = `UPDATE ${table_name} SET break_check = ${breakId} WHERE status = 1 AND id = ${id} AND user_id = ${user_id} AND branch_id = ${branch_id} AND attendance_date = '${attendance_date}'`;
    userModel.getAll(updateQry, (err, result) => {
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
      message:
        "Please Provide User id, Company id, Break In Time & Attendance Date",
      status: false,
      data: [],
    });
  }
};

exports.BreakTime = async (req, res, next) => {
  let data = req.body;
  let branch_id = req.body.branch_id;
  let user_id = req.body.user_id;
  let attendance_date = req.body.attendance_date;
  console.log("attendance_date: ", attendance_date);

  let qry = `SELECT * FROM ${table_name1} WHERE branch_id = ${branch_id} AND user_id = ${user_id} AND attendance_date = '${attendance_date}'`;
  console.log("qry: ", qry);
  let checkBreakTime = 0;
  userModel.getAll(qry, (err, result) => {
    if (err) {
      res.status(err.statucode).send({
        message: err.message,
        status: err.status,
        data: err.data,
      });
    } else {
      const data = [];
      data.push({ totalBreakTimeData: result.data });
      result.data.map((res, index) => {
        if (res.break_startTime === null) {
          // res.break_startTime
          let datePart = new Date().toISOString().substring(0, 10);
          const timePart = "00:00:00";
          res.break_startTime = `${datePart} ${timePart}`;
        }

        if (res.break_endTime === null) {
          // let datePart = new Date().toISOString().substring(0, 10);
          // const timePart = "00:00:00";
          // res.break_endTime = `${datePart} ${timePart}`;

          res.break_endTime = res.break_startTime;
        }
        if (res.break_startTime !== null && res.break_endTime !== null) {
          const date1 = new Date(res.break_startTime);
          const date2 = new Date(res.break_endTime);
          checkBreakTime += (date2 - date1) / 1000;
        }
        // const date1 = new Date(res.break_startTime);
        // const date2 = new Date(res.break_endTime);
        // checkBreakTime += (date2 - date1) / 1000;
      });
      data.push({ breakTime: (checkBreakTime / 60).toFixed(2) });

      res.status(result.statucode).send({
        message: result.message,
        status: result.status,
        data: data,
      });
    }
  });
};

exports.TotalBreakTime = async (req, res, next) => {
  // let qry = `SELECT * FROM ${table_name1} `;

  let qry = `SELECT ua.*,ub.break_starttime
  FROM user_attendance AS ua
  LEFT JOIN user_break AS ub ON ua.user_id = ub.user_id
                               AND ua.company_id = ub.company_id
                               AND ua.attendance_date = ub.attendance_date
  where ua.user_id = 15
  GROUP BY ua.user_id,ua.created_at
    `;

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
