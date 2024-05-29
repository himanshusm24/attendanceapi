const ForgotPassword = require("./../model/ForgotPassword.model");

exports.forgotPassword = async (req, res, next) => {
  let data = req.body;

  if (data.userData != "" && data.userData != null) {
    ForgotPassword.forgotPassword(data, (err, result) => {
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
      message: "Please Provide Email Or Contact Number",
      status: false,
      data: [],
    });
  }
};

exports.verifyOtp = async (req, res, next) => {
  let data = req.body;

  if (
    data.userData != "" &&
    data.userData != null &&
    data.userOtp != "" &&
    data.userOtp != null &&
    data.otpFor != "" &&
    data.otpFor != null
  ) {
    ForgotPassword.verifyOtp(data, (err, result) => {
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
      message: "Please Provide User Details & Otp",
      status: false,
      data: [],
    });
  }
};

exports.changePassword = async (req, res, next) => {
  let data = req.body;

  if (
    data.userId != "" &&
    data.userId > 0 &&
    data.userData != "" &&
    data.userData != null &&
    data.userPassword != "" &&
    data.userPassword != null &&
    data.userConfirmPassword != "" &&
    data.userConfirmPassword != null
  ) {
    if (data.userPassword == data.userConfirmPassword) {
      ForgotPassword.changePassword(data, (err, result) => {
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
        message: "Please enter same password",
        status: false,
        data: [],
      });
    }
  } else {
    res.status(400).send({
      message: "Please Provide User Details, Password & Confirm Password",
      status: false,
      data: [],
    });
  }
};
