//backend/Controllers/Notification/NotificationControllers.js
const NotificationModel = require("../../Model/Notification/NotificationModel");

//get all notifications
const getAllNotifications = async (req, res) => {
    try {
        const notifications = await NotificationModel.find();
        res.status(200).json({ notifications });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }       
};
//get notification by id
const getNotificationById = async (req, res) => {
    try {       
        const notification = await NotificationModel.findById(req.params.id);
        if (!notification) return res.status(404).json({ message: "Not found" });
        res.status(200).json({ notification });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
};

//add notification
const addNotification = async (req, res) => {
    try {   
        const { Title, Message } = req.body;
        const newNotification = new NotificationModel({
            Title,
            Message
        });
        await newNotification.save();
        res.status(201).json({ message: "Notification added", notification: newNotification });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }       
};
//update notification
const updateNotification = async (req, res) => {
    try {
        const { Title, Message, isRead } = req.body;
        const updatedNotification = await NotificationModel.findByIdAndUpdate(
            req.params.id,
            { Title, Message, isRead },
            { new: true }
        );
        if (!updatedNotification) return res.status(404).json({ message: "Not found" });
        res.status(200).json({ message: "Notification updated", notification: updatedNotification });
    }   
    catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
};
//delete notification
const deleteNotification = async (req, res) => {
    try {
        const deletedNotification = await NotificationModel.findByIdAndDelete(req.params.id);
        if (!deletedNotification) return res.status(404).json({ message: "Not found" });
        res.status(200).json({ message: "Notification deleted", notification: deletedNotification });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
};
//put all notifications as read
const markAllAsRead = async (req, res) => {
    try {
        await NotificationModel.updateMany({}, { isRead: true });
        res.status(200).json({ message: "All notifications marked as read" });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
};

module.exports = {
    getAllNotifications,
    getNotificationById,
    addNotification,
    updateNotification,
    deleteNotification,
    markAllAsRead
};