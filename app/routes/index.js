const express = require("express");

const routes = express.Router();

const company_pages = require("./company.routes");
const users_page = require("./user.routes");
const users_leave_page = require("./userLeave.routes");
// const admin_page = require("./admin.routes");
const attendance_page = require("./user-attendance.routes");
const holiday_page = require("./holiday.routes");
const roles_page = require("./roles.routes");
const department_page = require("./department.routes");
const attendanceList = require("./attendance-list.routes");
const withoutLogin = require("./without-jwt-api");
const companyForgotPassword = require("./company-forgot-password.routes");
const forgotPassword = require("./forgot-password.routes");
const cron = require("./cronjob.routes");
const bulkUploadUser = require("./userBulkUpload");
const defaultMail = require("./defaultMails");
const reportRoutes = require("./reports");
const taskRoutes = require("./tasks");
const projectRoutes = require("./projects");
const taskLogs = require("./taskLogs");
const projectStatus = require("./projectStatus");
const userdailylocation = require("./userDailyLocation");
const userType = require("./userType");
const permission = require("./permission");
const userTypePermissionRelation = require("./userPermissionRelation");

const baseUrl = "/api";

routes.use(baseUrl, companyForgotPassword);
routes.use(baseUrl, cron);
routes.use(baseUrl, bulkUploadUser);
routes.use(baseUrl, reportRoutes);
routes.use(baseUrl, taskRoutes);
routes.use(baseUrl, projectRoutes);
routes.use(baseUrl, defaultMail);
routes.use(baseUrl, forgotPassword);
// routes.use(baseUrl, admin_page);
routes.use(baseUrl, company_pages);
routes.use(baseUrl, withoutLogin);
routes.use(baseUrl, users_page);
routes.use(baseUrl, users_leave_page);
routes.use(baseUrl, attendanceList);
routes.use(baseUrl, attendance_page);
routes.use(baseUrl, holiday_page);
routes.use(baseUrl, roles_page);
routes.use(baseUrl, department_page);
routes.use(baseUrl, taskLogs);
routes.use(baseUrl, projectStatus);
routes.use(baseUrl, userdailylocation);
routes.use(baseUrl, permission);
routes.use(baseUrl, userType);
routes.use(baseUrl, userTypePermissionRelation);

module.exports = routes;
