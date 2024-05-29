const express = require('express');

const routes = express.Router();

const pages = require('../controllers/forgot-password.controllers');

const baseUrl = "/forgot-password";

const baseUrlVerify = "/verify-otp";

const baseUrlChangePassword = "/change-password";

routes.post(baseUrl, pages.forgotPassword);

routes.post(baseUrlVerify, pages.verifyOtp);

routes.post(baseUrlChangePassword, pages.changePassword);

module.exports = routes;