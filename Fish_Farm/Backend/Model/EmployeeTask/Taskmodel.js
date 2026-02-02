const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    taskName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    status: {
        type: String,
        enum: ["Pending", "In Progress", "Completed"],
        default: "Pending",
    },
    approved: {
        type: Boolean,
        default: false
    },
    approvedBy: {
        type: String,
        default: null
    },
    approvedDate: {
        type: Date,
        default: null
    },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    dueDate: {
        type: Date,
    },
    // New fields for inventory integration
    inventoryItems: [{
        inventoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Inventory",
            required: true
        },
        quantityUsed: {
            type: Number,
            required: true,
            min: 0
        },
        itemName: String,
        unit: String
    }],
    totalInventoryCost: {
        type: Number,
        default: 0
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model(
    "Taskmodel",
    taskSchema
);