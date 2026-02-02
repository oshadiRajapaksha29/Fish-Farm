//backend/Routes/Notification/NotificationRoutes.js
const express = require("express");
const router = express.Router();
const NotificationControllers = require("../../Controllers/Notification/NotificationControllers");
//get all notifications
router.get("/", NotificationControllers.getAllNotifications);
//get notification by id
router.get("/:id", NotificationControllers.getNotificationById);
//add notification
router.post("/", NotificationControllers.addNotification);
//update notification
router.put("/:id", NotificationControllers.updateNotification);
//delete notification
router.delete("/:id", NotificationControllers.deleteNotification);
//mark all as read
router.put("/mark-all-read/bulk", NotificationControllers.markAllAsRead);
module.exports = router;
