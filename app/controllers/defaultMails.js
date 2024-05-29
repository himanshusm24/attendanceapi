const db = require("../model/model");

const table_name = "defaultmails";

exports.adddefaultMails = async (req, res) => {
  const payload = req.body;
  if (payload.email != "" && payload.email != null) {
    const qry = `INSERT into ${table_name} (email) values('${payload.email}')`;

    db.getAll(qry, (err, result) => {
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
      message: "Please Provide default mails",
      status: false,
      data: [],
    });
  }
};

exports.deleteDefaultMails = async (req, res, next) => {
  const id = req.params.id;

  if (id != "" && id != null && id > 0) {
    let fields = `status = 0`;

    let qry = `UPDATE ${table_name} SET ${fields} WHERE id = '${id}'`;

    db.getAll(qry, (err, result) => {
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

exports.getDefaultMails = async (req, res, next) => {
  let qry = `SELECT * FROM ${table_name} WHERE status = 1 `;

  let id = req.query.id;
  if (id) {
    qry += `AND defaultmails.id = ${id} `;
  }

  db.getAll(qry, (err, result) => {
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

exports.updateDefaultMail = async (req, res, next) => {
  let payload = req.body;
  console.log("payload: ", payload);

  const id = req.params.id;
  if (payload.email != "" && payload.email != null && id != "" && id != null) {
    let fields = `email = '${payload.email}'`;

    let qry = `UPDATE ${table_name} SET ${fields} WHERE id = '${id}'`;
    db.getAll(qry, (err, result) => {
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
      message: "Please Provide email and update id",
      status: false,
      data: [],
    });
  }
};
