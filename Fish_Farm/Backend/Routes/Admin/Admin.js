// Backend/Routes/Admin/Admin.js
const express = require("express");
const { getAllEmployees } = require("../../Controllers/Admin/UserData.js");
const { deactivateAccounts, reactivateAccounts } = require("../../Controllers/Admin/Activation.js");
const { generateUserReport } = require("../../Controllers/Admin/reports/UserRegistrationReport.js");
const { generateAquacultureReport } = require("../../Controllers/Admin/reports/StockAndHealthReport.js");
const { generateInventoryOrdersReport } = require("../../Controllers/Admin/reports/OrderReport.js");
const { generateLoginReport } = require("../../Controllers/Admin/reports/LoginReport.js");
const { getLoginHistory } = require("../../Controllers/Admin/ActivityMonitoring.js");
const { updateUser } = require("../../Controllers/Admin/UpdateUser.js");
const { changePassword } = require("../../Controllers/Admin/UpdatePassword.js");

const router = express.Router();

// Only this route is needed for your dropdown
router.get("/employees", getAllEmployees);
router.post("/deactivate", deactivateAccounts);
router.post("/reactivate", reactivateAccounts);

router.get("/report/user-report", generateUserReport);
router.get("/report/aquaculture-report", generateAquacultureReport);
router.get("/report/inventory-orders-report", generateInventoryOrdersReport);
router.get("/report/login-report", generateLoginReport);

router.get("/login-history", getLoginHistory);
router.put("/update/:userId", updateUser);
router.post("/change-password", changePassword);

module.exports = router;
