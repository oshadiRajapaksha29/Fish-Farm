//backend/Model/Notification/NotificationModel.js
const { Title } = require("chart.js");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const NotificationSchema = new Schema({
    Title: { type: String, required: true },
    Message: { type: String, required: true },
    Date: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
});
module.exports = mongoose.model("NotificationModel", NotificationSchema);