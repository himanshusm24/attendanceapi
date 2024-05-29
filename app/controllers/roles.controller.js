const roleModel = require("../model/model");

const table_name = "roles";

exports.addRoles = (req, res, next) => {
  let payload = req.body;
  if (
    payload.name != "" &&
    payload.name != null &&
    payload.company_id != "" &&
    payload.company_id != null
  ) {
    let qry = `insert into ${table_name} (name,company_id) values('${payload.name}', '${payload.company_id}' )`;

    roleModel.getAll(qry, (err, result) => {
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
      message: "Please Provide role name",
      status: false,
      data: [],
    });
  }
};

exports.getRoles = async (req, res, next) => {
  let qry = `SELECT roles.*, company.name AS company_name
                FROM roles AS roles
                JOIN company AS company
                ON roles.company_id = company.id
                WHERE roles.status = 1 `;

  let id = req.query.id;
  if (id) {
    qry += `AND roles.id = ${id} `;
  }
  if (req.query.company_id) {
    qry += `AND roles.company_id = ${req.query.company_id}`;
  }
  
  console.log('qry: ', qry);
  roleModel.getAll(qry, (err, result) => {
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

exports.updateRoles = async (req, res, next) => {
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
    let fields = `name = '${payload.name}', company_id = '${payload.company_id}'`;

    let qry = `UPDATE ${table_name} SET ${fields} WHERE id = '${id}'`;
    // console.log("qry: ", qry);
    roleModel.getAll(qry, (err, result) => {
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
      message: "Please Provide role name and update id",
      status: false,
      data: [],
    });
  }
};

exports.deleteRoles = async (req, res, next) => {
  const id = req.params.id;

  if (id != "" && id != null && id > 0) {
    let fields = `status = 0`;

    let qry = `UPDATE ${table_name} SET ${fields} WHERE id = '${id}'`;

    roleModel.getAll(qry, (err, result) => {
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
