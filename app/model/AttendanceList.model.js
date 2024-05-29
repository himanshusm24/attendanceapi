const express = require("express");

const routes = express.Router();

const db = require("./db");

const table_name = "user_attendance";

const join_table = "users";

routes.attendanceList = (req, res) => {
  let per_page = req.per_page || 20;
  let skip_count = req.skip_count || 0;
  let filterDate = req.filterDate || "";
  let userDetails = req.userDetails || "";
  let company_id = req.company_id || "";

  if (per_page > 0) {
    let where = `${table_name}.status = '1'`;

    if (filterDate !== "") {
      where += ` AND ${table_name}.attendance_date = '${filterDate}'`;
    }

    if (userDetails !== "" && userDetails !== null) {
      where += ` AND (${join_table}.name LIKE '%${userDetails}%' OR ${join_table}.email LIKE '%${userDetails}%' OR ${join_table}.contact LIKE '%${userDetails}%')`;
    }

    if (company_id !== "" && company_id !== null) {
      where += ` AND ${table_name}.branch_id = ${company_id}`;
    }

    let sql = `
    SELECT ${table_name}.*, 
           ${join_table}.name AS user_name, 
           ${join_table}.email AS user_email, 
           ${join_table}.contact AS user_contact,
           branch.name AS branch_name,
           JSON_ARRAY(GROUP_CONCAT(ub.break_startTime)) AS break_startTime_array,
           JSON_ARRAY(GROUP_CONCAT(ub.break_endTime)) AS break_endTime_array
    FROM ${table_name} 
    JOIN ${join_table} ON ${table_name}.user_id = ${join_table}.id
    JOIN branch ON ${table_name}.branch_id = branch.id
    LEFT JOIN (
        SELECT ua.user_id,
               ua.branch_id,
               ua.attendance_date,
               GROUP_CONCAT(ub.break_startTime) AS break_startTime,
               GROUP_CONCAT(ub.break_endTime) AS break_endTime
        FROM user_attendance AS ua
        LEFT JOIN user_break AS ub ON ua.user_id = ub.user_id
                                     AND ua.branch_id = ub.branch_id
                                     AND ua.attendance_date = ub.attendance_date
        GROUP BY ua.user_id, ua.created_at
    ) AS ub ON ${table_name}.user_id = ub.user_id
             AND ${table_name}.branch_id = ub.branch_id
             AND ${table_name}.attendance_date = ub.attendance_date
    WHERE ${where} 
    GROUP BY ${table_name}.id
    ORDER BY ${table_name}.id DESC 
    LIMIT ${per_page} 
    OFFSET ${skip_count}`;

    db.query(sql, (err, result) => {
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
          message: "List fetched successfully",
          statusCode: 200,
          status: true,
          data: result,
        });
      }
    });
  } else {
    res(
      {
        message: "Please provide per page count",
        statusCode: 400,
        status: false,
        data: [],
      },
      null
    );
  }
};

routes.attendanceCount = (req, res) => {
  let filterDate = req.filterDate || "";
  console.log("filterDate: ", filterDate);

  let where = `status = '1' `;

  if (filterDate != "") {
    where += ` AND attendance_date = '${filterDate}' `;
  }

  let sql = `select count(id) as total_attendance from ${table_name} where ${where} `;

  db.query(sql, (err, result) => {
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
        message: "List fetached successfully",
        statusCode: 200,
        status: true,
        data: result[0],
      });
    }
  });
};

module.exports = routes;
