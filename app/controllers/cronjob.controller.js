const userModel = require("../model/model");
const moment = require("moment");

exports.MarkAllUsersAbsent = async (req, res, next) => {
  let qry = `SELECT id, branch_id FROM users`;
  const currentDate = moment().format("YYYY-MM-DD");

  userModel.getAll(qry, (err, result) => {
    if (err) {
      res.status(err.statucode).send({
        message: err.message,
        status: err.status,
        data: err.data,
      });
    } else {
      const userData = result.data;
      for (const user of userData) {
        const checkQry = `SELECT * FROM user_attendance WHERE user_id = ${user.id} AND attendance_date = '${currentDate}'`;

        userModel.getAll(checkQry, (err, response) => {
          if (err) {
            console.log(err);
          } else {
            console.log("response: ", response.data);
            if (response.data.length === 0) {
              const insertQry = `INSERT INTO user_attendance (user_id, branch_id, attendance_date, absent_status) VALUES (${user.id}, ${user.branch_id}, '${currentDate}', 1)`;
              userModel.getAll(insertQry, (insertErr, insertResult) => {
                if (insertErr) {
                  console.error(
                    "Error marking attendance for user: ",
                    user.user_id
                  );
                } else {
                  console.log("insertResult: ", insertResult);
                  console.log("Attendance marked for user: ", user.user_id);
                }
              });
            }
          }
        });
      }
      res.status(result.statucode).send({
        message: result.message,
        status: result.status,
        data: result.data,
      });
    }
  });
};

exports.ClockOutAllUsers = async (req, res, next) => {
  const currentDate = moment().format("YYYY-MM-DD");
  const updateQry = `
    UPDATE user_attendance AS ua
    INNER JOIN branch AS ct ON ua.branch_id = ct.id
    LEFT JOIN user_leave AS ul ON ua.user_id = ul.user_id
    SET ua.checkout_time = ct.checkout_time, absent_status = 0
    WHERE ua.attendance_date = '${currentDate}'
    AND ua.checkout_time IS NULL
    AND ua.checkin_time IS NOT NULL
    AND ul.user_id IS NULL`;

  userModel.getAll(updateQry, async (updateErr, updateResult) => {
    if (updateErr) {
      console.error("Error updating checkout time: ", updateErr);
      res.status(500).send({
        message: "Error updating checkout time",
        status: 500,
        data: updateErr,
      });
    } else {
      console.log("Checkout time updated for absent users.");
      res.status(200).send({
        message: "Checkout time updated for absent users.",
        status: 200,
        data: updateResult,
      });
    }
  });
};
