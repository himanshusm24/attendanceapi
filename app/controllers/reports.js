const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");
const CsvParser = require("json2csv").Parser;
const csv = require("csv-parser");
const path = require("path");
const db = require("../model/model");

exports.DailyAttendanceReport = async (req, res) => {
  try {
    const filterDate = req.body.filterDate;
    const branchId = req.body.companyID;
    console.log("branchId: ", branchId);
    let dbquery = `SELECT ua.*, ua.attendance_date as att_date, u.name as userName, b.name as companyName, COALESCE(udl.checkin_address, 'N/A') AS visit_checkin_address,
    COALESCE(udl.checkin_time, 'N/A') AS visit_checkin_time,
    COALESCE(udl.reason, 'N/A') AS visit_checkin_Remark,
    COALESCE(udl.checkout_address, 'N/A') AS visit_checkout_address,
    COALESCE(udl.checkout_time, 'N/A') AS visit_checkout_time,
    COALESCE(udl.checkout_feedback, 'N/A') AS visit_checkout_Remark
        FROM user_attendance ua
        LEFT JOIN users u ON ua.user_id = u.id
        LEFT JOIN branch b ON ua.branch_id = b.id
        LEFT JOIN userDailyLocation udl ON ua.user_id = udl.user_id AND ua.attendance_date = udl.attendance_date
        WHERE ua.attendance_date = '${filterDate}' AND (udl.attendance_date = '${filterDate}' OR udl.attendance_date IS NULL)`;

    if (branchId && branchId > 0) {
      dbquery += ` AND ua.branch_id = '${branchId}'`;
    }

    db.getAll(dbquery, (err, results) => {
      // console.log('results: ', results.data);
      if (err) {
        res.status(err.statucode).send({
          message: err.message,
          status: err.status,
          data: err.data,
        });
      } else {
        // console.log("results: ", results);
        const report = results.data.map((row) => {
          // Format the attendance date
          const attendanceDate = new Date(row.attendance_date);
          const formattedAttendanceDate = `${attendanceDate.getDate()}/${
            attendanceDate.getMonth() + 1
          }/${attendanceDate.getFullYear()}`;

          const status = row.checkin === 0 ? "A" : "P";

          const checkInTimeString = row.checkin_time
            ? row.checkin_time.toISOString()
            : "";
          const checkOutTimeString = row.checkout_time
            ? row.checkout_time.toISOString()
            : "";

          // Extract time part after "T"
          const checkInTime = checkInTimeString
            ? checkInTimeString.slice(11, -5)
            : "";
          const checkOutTime = checkOutTimeString
            ? checkOutTimeString.slice(11, -5)
            : "";

          const visitInTime = row.visit_checkin_time.substring(
            row.visit_checkin_time.indexOf(" ") + 1,
            row.visit_checkin_time.length
          );
          const visitOutTime = row.visit_checkout_time.substring(
            row.visit_checkout_time.indexOf(" ") + 1,
            row.visit_checkout_time.length
          );

          return {
            userName: row.userName,
            companyName: row.companyName,
            attendanceDate: formattedAttendanceDate,
            check_in_Time: checkInTime,
            checkout_Time: checkOutTime,
            status: status,
            location: row.checkin_address,
            visit_in_Time: visitInTime,
            visit_in_address: row.visit_checkin_address,
            visit_in_Remark: row.visit_checkin_Remark,
            visit_out_Time: visitOutTime,
            visit_out_address: row.visit_checkout_address,
            visit_out_RemarK: row.visit_checkout_Remark,
          };
        });
        // -------------------------------------------------------------------------------------//

        const csvFields = [
          "username",
          "companyName",
          "attendanceDate",
          "check_in_Time",
          "checkout_Time",
          "Status",
          "Location",
          "visit_in_Time",
          "visit_in_address",
          "visit_in_Remark",
          "visit_out_Time",
          "visit_out_address",
          "visit_out_Remark",
        ];
        const csvParser = new CsvParser({ csvFields });
        const csvData = csvParser.parse(report);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=public/attendanceReport.csv"
        );
        return res.status(200).end(csvData);
      }
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

// for creating all visits in one row

// exports.DailyAttendanceReport = async (req, res) => {
//   try {
//     const filterDate = req.body.filterDate;
//     const companyId = req.body.companyID;
//     console.log("companyId: ", companyId);
//     let dbquery = `SELECT ua.*, ua.attendance_date as att_date, u.name as userName, c.name as companyName, COALESCE(udl.checkin_address, 'N/A') AS visit_checkin_address,
//     COALESCE(udl.checkin_time, 'N/A') AS visit_checkin_time,
//     COALESCE(udl.reason, 'N/A') AS visit_checkin_Remark,
//     COALESCE(udl.checkout_address, 'N/A') AS visit_checkout_address,
//     COALESCE(udl.checkout_time, 'N/A') AS visit_checkout_time,
//     COALESCE(udl.checkout_feedback, 'N/A') AS visit_checkout_Remark
//         FROM user_attendance ua
//         LEFT JOIN users u ON ua.user_id = u.id
//         LEFT JOIN company c ON ua.company_id = c.id
//         LEFT JOIN userDailyLocation udl ON ua.user_id = udl.user_id AND ua.attendance_date = udl.attendance_date
//         WHERE ua.attendance_date = '${filterDate}' AND (udl.attendance_date = '${filterDate}' OR udl.attendance_date IS NULL)`;

//     if (companyId && companyId > 0) {
//       dbquery += ` AND ua.company_id = '${companyId}'`;
//     }

//     db.getAll(dbquery, (err, results) => {
//       if (err) {
//         res.status(err.statucode).send({
//           message: err.message,
//           status: err.status,
//           data: err.data,
//         });
//       } else {
//         console.log('results: ', results.data[39]);
//         const report = results.data.reduce((acc, row) => {
//           const existingUserRow = acc.find(
//             (userRow) => userRow.userName === row.userName
//           );
//           if (existingUserRow) {
//             // User already exists in the report, add visit information
//             existingUserRow.visits.push({
//               check_in_Time: row.visit_checkin_time,
//               check_in_address: row.visit_checkin_address,
//               check_in_Remark: row.visit_checkin_Remark,
//               checkout_Time: row.visit_checkout_time,
//               checkout_address: row.visit_checkout_address,
//               checkout_Remark: row.visit_checkout_Remark,
//             });
//           } else {
//             // Add user to the report with visit information
//             acc.push({
//               userName: row.userName,
//               companyName: row.companyName,
//               attendanceDate: new Date(
//                 row.attendance_date
//               ).toLocaleDateString(),
//               check_in_Time: row.checkin_time
//                 ? row.checkin_time.toISOString().slice(11, -5)
//                 : "",
//               checkout_Time: row.checkout_time
//                 ? row.checkout_time.toISOString().slice(11, -5)
//                 : "",
//               status: row.checkin === 0 ? "A" : "P",
//               location: row.checkin_address,
//               visits: [
//                 {
//                   check_in_Time: row.visit_checkin_time,
//                   check_in_address: row.visit_checkin_address,
//                   check_in_Remark: row.visit_checkin_Remark,
//                   checkout_Time: row.visit_checkout_time,
//                   checkout_address: row.visit_checkout_address,
//                   checkout_Remark: row.visit_checkout_Remark,
//                 },
//               ],
//             });
//           }
//           return acc;
//         }, []);

//         const csvFields = [
//           "userName",
//           "companyName",
//           "attendanceDate",
//           "check_in_Time",
//           "checkout_Time",
//           "status",
//           "location",
//           ...Array.from(
//             { length: Math.max(...report.map((row) => row.visits.length)) },
//             (_, index) => `visit_${index + 1}_in_Time`
//           ),
//           ...Array.from(
//             { length: Math.max(...report.map((row) => row.visits.length)) },
//             (_, index) => `visit_${index + 1}_in_address`
//           ),
//           ...Array.from(
//             { length: Math.max(...report.map((row) => row.visits.length)) },
//             (_, index) => `visit_${index + 1}_in_Remark`
//           ),
//           ...Array.from(
//             { length: Math.max(...report.map((row) => row.visits.length)) },
//             (_, index) => `visit_${index + 1}_out_Time`
//           ),
//           ...Array.from(
//             { length: Math.max(...report.map((row) => row.visits.length)) },
//             (_, index) => `visit_${index + 1}_out_address`
//           ),
//           ...Array.from(
//             { length: Math.max(...report.map((row) => row.visits.length)) },
//             (_, index) => `visit_${index + 1}_out_Remark`
//           ),
//         ];

//         const formattedReport = report.map((userRow) => {
//           const { visits, ...userWithoutVisits } = userRow;

//           const formattedVisits = visits.map((visit, index) => ({
//             [`visit_${index + 1}_in_Time`]: visit.check_in_Time,
//             [`visit_${index + 1}_in_address`]: visit.check_in_address,
//             [`visit_${index + 1}_in_Remark`]: visit.check_in_Remark,
//             [`visit_${index + 1}_out_Time`]: visit.checkout_Time,
//             [`visit_${index + 1}_out_address`]: visit.checkout_address,
//             [`visit_${index + 1}_out_Remark`]: visit.checkout_Remark,
//           }));

//           return {
//             ...userWithoutVisits,
//             ...Object.assign({}, ...formattedVisits),
//           };
//         });

//         const csvParser = new CsvParser({ csvFields });
//         const csvData = csvParser.parse(formattedReport);
//         res.setHeader("Content-Type", "text/csv");
//         res.setHeader(
//           "Content-Disposition",
//           "attachment; filename=public/attendanceReport.csv"
//         );
//         return res.status(200).end(csvData);
//       }
//     });
//   } catch (error) {
//     console.error("Error fetching data:", error);
//   }
// };
