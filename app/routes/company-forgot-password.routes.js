const express = require("express");

const routes = express.Router();

const pages = require("../controllers/company-forget-password.controller");

const baseUrl = "/company-forgot-password";

const adminbaseUrl = "/admin-forgot-password";

const baseUrlVerify = "/company-verify-otp";

const baseUrlChangePassword = "/company-change-password";

const baseUrlAdminChangePassword = "/admin-change-password";

routes.post(baseUrl, pages.forgotPassword);

routes.post(adminbaseUrl, pages.adminforgotPassword);

routes.post(baseUrlVerify, pages.verifyOtp);

routes.post(baseUrlChangePassword, pages.changePassword);

routes.post(baseUrlAdminChangePassword, pages.adminchangePassword);

module.exports = routes;
