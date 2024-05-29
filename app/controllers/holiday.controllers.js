const holidayModel = require("../model/model");

const table_name = "holiday";

exports.getHoliday = (req, res, next) => {
  let holiday_id = req.query.holiday_id;
  let branch_id = req.query.branch_id;
  let month = req.query.month;
  let holidayTitles = req.query.holidayTitle;
  console.log("holidayTitles: ", holidayTitles);

  let qry = `SELECT holiday.*, branch.name AS branch_name
           FROM holiday AS holiday
           JOIN branch AS branch
           ON holiday.branch_id = branch.id
           WHERE holiday.status = 1`;

  if (holidayTitles != "" && holidayTitles != undefined) {
    qry += ` AND holiday.holiday_title LIKE '%${holidayTitles}%'`;
  }
  if (holiday_id > 0) {
    qry += ` AND holiday.id = ${holiday_id}`;
  }
  if (month) {
    qry += ` AND MONTH(holiday_date) = ${month}`;
  }

  if (branch_id > 0) {
    qry += ` AND holiday.branch_id = ${branch_id}`;
  }

  qry += " Order by id desc";
  console.log("qry: ", qry);

  holidayModel.getAll(qry, (err, result) => {
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

exports.createHoliday = async (req, res, next) => {
  let data = req.body;
  if (
    data.holiday_date != "" &&
    data.holiday_date != null &&
    data.holiday_title != "" &&
    data.holiday_title != null &&
    data.company_id != "" &&
    data.company_id != null
  ) {
    let qry = `insert into ${table_name} (holiday_date, holiday_title, company_id) values('${data.holiday_date}', '${data.holiday_title}', '${data.company_id}')`;
    holidayModel.getAll(qry, (err, result) => {
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
      message: "Please Provide holiday date, holiday title and Company Id",
      status: false,
      data: [],
    });
  }
};

exports.updateHoliday = async (req, res, next) => {
  let data = req.body;
  console.log("data: ", data);
  const id = req.params.id;
  if (
    data.company_id != "" &&
    data.company_id != null &&
    data.holiday_title != "" &&
    data.holiday_title != null &&
    data.holiday_date != "" &&
    data.holiday_date != null
  ) {
    let fields = `company_id = '${data.company_id}', holiday_title = '${data.holiday_title}', holiday_date = '${data.holiday_date}'`;

    let qry = `UPDATE ${table_name} SET ${fields} WHERE id = '${id}'`;
    console.log("qry: ", qry);
    holidayModel.getAll(qry, (err, result) => {
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
      message: "Please Provide All details propely",
      status: false,
      data: [],
    });
  }
};

exports.deleteHoliday = async (req, res, next) => {
  const id = req.params.id;

  if (id != "" && id != null && id > 0) {
    let fields = `status = 0`;

    let qry = `UPDATE ${table_name} SET ${fields} WHERE id = '${id}'`;

    holidayModel.getAll(qry, (err, result) => {
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
      message: "Please Provide Holiday id",
      status: false,
      data: [],
    });
  }
};
