const express = require("express");
const router = express.Router();

const Taskcontroller = require("../../Controllers/EmployeeTask/Taskcontroller");

// Add new route for inventory by category
router.get("/inventory/:category", Taskcontroller.getInventoryByCategory);

// Existing routes
router.put("/:id/status", Taskcontroller.updateTaskStatus);
router.get("/employee/:employeeId", Taskcontroller.getTasksByEmployee);
router.get("/:id", Taskcontroller.getById);
router.put("/:id", Taskcontroller.updateTask);
router.delete("/:id", Taskcontroller.deleteTask);
router.get("/", Taskcontroller.getAllTask);
router.post("/", Taskcontroller.addTasks);
router.put("/:id/approve", Taskcontroller.approveTask);
router.put("/:id/reject", Taskcontroller.rejectTask);

module.exports = router;