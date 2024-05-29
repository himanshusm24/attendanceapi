const userLeaveModel = require("../model/model");

const table_name = "user_leave";

const sendEmail = require("../middelware/sendEmail");

exports.applyLeave = async (req, res, next) => {
  const payload = req.body;
  const defaultmails = `SELECT * FROM defaultmails WHERE status = 1`;
  let emails;
  let defaultMaiLData;
  userLeaveModel.getAll(defaultmails, (err, result) => {
    if (err) {
      res.status(err.statucode).send({
        message: err.message,
        status: err.status,
        data: err.data,
      });
    } else {
      if (payload.to_email.includes(",")) {
        emails = payload.to_email.split(",");
      } else {
        emails = [payload.to_email];
      }
      // emails.push("aniket.namdeo@secondmedic.com");
      // emails.push("hr@secondmedic.com");
      // emails.push("rajneesh.dwivedi@secondmedic.com");
      // emails.push("ravi.namdeo@secondmedic.com");
      defaultMaiLData = result.data.map((res, index) => {
        emails.push(res.email);
        return res;
      });
    }
  });
  if (
    payload.to_email != "" &&
    payload.to_email != null &&
    payload.subject != "" &&
    payload.subject != null &&
    payload.body != "" &&
    payload.body != null
  ) {
    let qry = `insert into ${table_name} (user_id, company_id, to_email, subject, message, from_date, to_date) values('${payload.user_id}', '${payload.companyId}', '${payload.to_email}', '${payload.subject}', '${payload.body}', '${payload.from_date}', '${payload.to_date}')`;
    userLeaveModel.getAll(qry, (err, result) => {
      if (err) {
        res.status(err.statucode).send({
          message: err.message,
          status: err.status,
          data: err.data,
        });
      } else {
        emails.map((res, index) => {
          sendEmail(res, payload.subject, payload.body);
        });

        res.status(result.statucode).send({
          message: result.message,
          status: result.status,
          data: result.data,
        });
      }
    });
  }
};

exports.approveLeave = async (req, res, next) => {
  const payload = req.body;
  const id = req.params.id;
  //   console.log("id: ", id);
  //   console.log("payload: ", payload);
  if (payload.leave_status != "" && payload.leave_status != null) {
    const qry = `UPDATE ${table_name} SET leave_status = '${payload.leave_status}' WHERE id = ${id}`;
    // console.log("qry: ", qry);
    userLeaveModel.getAll(qry, (err, result) => {
      if (err) {
        console.log(err);
        res.status(err.statucode).send({
          message: err.message,
          status: err.status,
          data: err.data,
        });
      } else {
        //   emails.map((res, index) => {
        //     sendEmail(res, payload.subject, payload.body);
        //   });
        let checkUserQry = `SELECT paid_leave, paid_leave_available, paid_leave_taken, unpaid_leave FROM users WHERE id = ${payload.user_id}`;
        console.log("checkUserQry: ", checkUserQry);
        if (result) {
          userLeaveModel.getAll(checkUserQry, (err, result) => {
            if (err) {
              console.log(err);
            } else {
              // if (paid_leave > userleaveTaken){
              //  paidLeaveCount = paid_leaveCount;
              //  set paidLeaveAvailable = paidLeaveCount - userleaveTaken
              //  set paid leave taken =  userLeave Taken
              // }
              // if(paid_leave < userLeaveTaken) {

              let paidLeaveCount = result.data[0].paid_leave_available;
              let paidLeaveTakenCount = result.data[0].paid_leave_taken;
              let updatepaidqry = `UPDATE users SET `;
              if (paidLeaveCount >= payload.leave_count) {
                updatepaidqry += ` paid_leave_available = ${paidLeaveCount} - ${payload.leave_count}, paid_leave_taken = ${paidLeaveTakenCount} + ${payload.leave_count}`;
              } else {
                let paidCount = payload.leave_count - paidLeaveCount;
                let unpaidCount = paidCount + result.data[0].unpaid_leave;
                updatepaidqry += ` paid_leave = 0, unpaid_leave = ${unpaidCount}`;
              }
              updatepaidqry += ` WHERE id = ${payload.user_id}`;
              console.log("updatepaidqry: ", updatepaidqry);
              userLeaveModel.getAll(updatepaidqry, (err, result) => {
                if (err) {
                  console.log("some error in updating leave");
                } else {
                  console.log("updated leave");
                }
              });
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
  }
};

exports.leaveList = async (req, res, next) => {
  let qry = `select * from ${table_name} `;
  const conditions = [];
  if (req.query.id) {
    conditions.push(`id = '${req.query.id}'`);
  }
  if (req.query.user_id) {
    conditions.push(`user_id = '${req.query.user_id}'`);
  }
  if (
    req.query.leave_status === "approved" ||
    req.query.leave_status === "pending" ||
    req.query.leave_status === "rejected"
  ) {
    conditions.push(`leave_status = '${req.query.leave_status}'`);
  }
  if (conditions.length > 0) {
    qry += ` WHERE ${conditions.join(" AND ")}`;
  }

  userLeaveModel.getAll(qry, (err, result) => {
    if (err) {
      console.log(err);
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
