const departmentModel = require("../model/model");

const table_name = "department";

exports.addDepartment = (req, res, next) => {
  let payload = req.body;
  if (
    payload.name != "" &&
    payload.name != null &&
    payload.company_id != "" &&
    payload.company_id != null
  ) {
    let qry = `insert into ${table_name} (name, company_id) values('${payload.name}', '${payload.company_id}')`;

    departmentModel.getAll(qry, (err, result) => {
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
      message: "Please Provide department name and company_id",
      status: false,
      data: [],
    });
  }
};

exports.getDepartment = async (req, res, next) => {
  let qry = `SELECT department.*, company.name AS company_name
  FROM department AS department
  JOIN company AS company
  ON department.company_id = company.id
  WHERE department.status = 1 `;

  let id = req.query.id;
  if (id) {
    qry += `AND department.id = ${id} `;
  }

  if(req.query.company_id){
    qry += `AND department.company_id = ${req.query.company_id}`
  }

  departmentModel.getAll(qry, (err, result) => {
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

exports.updateDepartment = async (req, res, next) => {
  let payload = req.body;
  console.log("payload: ", payload);
  const id = req.params.id;
  if (
    payload.name != "" &&
    payload.name != null &&
    payload.company_id != "" &&
    payload.company_id != null &&
    id != "" &&
    id != null
  ) {
    let fields = `name = '${payload.name}', company_id= '${payload.company_id}'`;

    let qry = `UPDATE ${table_name} SET ${fields} WHERE id = '${id}'`;
    // console.log("qry: ", qry);
    departmentModel.getAll(qry, (err, result) => {
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
      message: "Please Provide department name and update id",
      status: false,
      data: [],
    });
  }
};

exports.deleteDepartment = async (req, res, next) => {
  const id = req.params.id;

  if (id != "" && id != null && id > 0) {
    let fields = `status = 0`;

    let qry = `UPDATE ${table_name} SET ${fields} WHERE id = '${id}'`;

    departmentModel.getAll(qry, (err, result) => {
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
      message: "Please Provide id",
      status: false,
      data: [],
    });
  }
};
