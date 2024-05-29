const AttendanceModel = require("../model/AttendanceList.model");
const db = require("../model/db");

exports.GetAttendanceList = async (req, res, next) => {
  const per_page = req.body.per_page;
  const skip_count = req.body.skip_count;
  const filterDate = req.body.filterDate;
  const userDetails = req.body.userDetails;
  const company_id = req.body.company_id;

  try {
    const req_data = {
      per_page: per_page,
      skip_count: skip_count,
      filterDate: filterDate,
      userDetails: userDetails,
      company_id: company_id,
    };

    if (per_page > 0) {
      AttendanceModel.attendanceList(req_data, (err, result) => {
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
      res.status(400).send({
        message: "Please provide per page count",
        status: false,
        data: [],
      });
    }
  } catch (err) {
    console.log(error);
    return res
      .status(500)
      .send({ message: "Some internal problem", error: err });
  }
};

exports.GetAttendanceListDashboard = async (req, res, next) => {
  const filterDate = req.body.filterDate;

  try {
    let qry = "SELECT * FROM user_attendance ";

    if (filterDate) {
      qry += `WHERE attendance_date = '${filterDate}'`;
    }

    if (filterDate) {
      db.query(qry, {}, (error, results, fields) => {
        if (error) {
          console.error(error);
        } else {
          const presentEmployee = results
            .map((res, index) => {
              if (res.checkin === 1) {
                return res;
              }
              return null;
            })
            .filter(Boolean);

          console.log("presentEmployee: ", presentEmployee.length);

          const sendData = {
            presentEmployee: presentEmployee.length,
            absentEmployee: results.length - presentEmployee.length,
            totalAttendance: results.length,
          };

          res.status(200).send({
            message: "Fetched Data",
            status: false,
            data: sendData,
          });
        }
      });
    } else {
      res.status(400).send({
        message: "Please provide filter date",
        status: false,
        data: results,
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ message: "Some internal Problem", error: err });
  }
};

exports.GetAttendanceCount = async (req, res, next) => {
  let filterDate = req.query.filterDate || "";
  console.log("filterDate: ", filterDate);

  try {
    let where = `status = '1' `;

    if (filterDate != "") {
      where += ` AND attendance_date = '${filterDate}' `;
    }

    let sql = `select count(id) as total_attendance from user_attendance where ${where} `;

    db.query(sql, (err, result) => {
      if (err) {
        res.status(500).send({
          message: "Something went wrong",
          data: err,
        });
      } else {
        res.status(200).send({
          message: "List fetached successfully",
          data: result,
        });
      }
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ message: "Some internal problem", error: err });
  }
};
