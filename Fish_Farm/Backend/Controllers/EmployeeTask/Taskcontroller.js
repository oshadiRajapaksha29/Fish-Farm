// Backend/Controllers/EmployeeTask/Taskcontroller.js
const Task = require("../../Model/EmployeeTask/Taskmodel");
const mongoose = require("mongoose");
const User = require("../../Model/Admin/User.js");
const Inventory = require("../../Model/Inventory/Inventorymodel");

const getAllTask = async (req, res, next) => {
    let Tasks;

    try {
        Tasks = await Task.find()
            .populate("employeeId", "name userId")
            .populate("inventoryItems.inventoryId", "inventoryName category unit quantity");
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }

    if (!Tasks) {
        return res.status(404).json({ message: "Task not found" });
    }

    return res.status(200).json({ Tasks });
};

const addTasks = async (req, res, next) => {
    const { taskName, description, status, employeeId, dueDate, inventoryItems } = req.body;

    let tasks;
    const session = await mongoose.startSession();
    
    try {
        session.startTransaction();
        
        // Process inventory items and update stock
        let totalCost = 0;
        const processedInventoryItems = [];
        
        if (inventoryItems && inventoryItems.length > 0) {
            for (const item of inventoryItems) {
                const inventory = await Inventory.findById(item.inventoryId).session(session);
                
                if (!inventory) {
                    throw new Error(`Inventory item ${item.inventoryId} not found`);
                }
                
                if (inventory.quantity < item.quantityUsed) {
                    throw new Error(`Insufficient stock for ${inventory.inventoryName}. Available: ${inventory.quantity}, Requested: ${item.quantityUsed}`);
                }
                
                // Update inventory quantity
                inventory.quantity -= item.quantityUsed;
                await inventory.save({ session });
                
                processedInventoryItems.push({
                    inventoryId: item.inventoryId,
                    quantityUsed: item.quantityUsed,
                    itemName: inventory.inventoryName,
                    unit: inventory.unit
                });
                
                // Calculate cost (you can add price field to inventory if needed)
                totalCost += item.quantityUsed; // This is simplified - add actual pricing logic
            }
        }
        
        // Create task
        tasks = new Task({ 
            taskName, 
            description, 
            status, 
            employeeId, 
            dueDate,
            inventoryItems: processedInventoryItems,
            totalInventoryCost: totalCost
        });
        
        await tasks.save({ session });
        await session.commitTransaction();
        
    } catch (err) {
        await session.abortTransaction();
        console.log(err);
        return res.status(500).json({ 
            message: err.message || "Server error while creating task" 
        });
    } finally {
        session.endSession();
    }

    if (!tasks) {
        return res.status(404).json({ message: "Unable to add task" });
    }
    
    return res.status(200).json({ 
        tasks: await tasks.populate("inventoryItems.inventoryId", "inventoryName category unit quantity")
    });
};

const getById = async (req, res, next) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
    }

    let tasks;
    try {
        tasks = await Task.findById(id)
            .populate("employeeId", "name email userId")
            .populate("inventoryItems.inventoryId", "inventoryName category unit quantity");
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }

    if (!tasks) {
        return res.status(404).json({ message: "Task not available" });
    }
    return res.status(200).json({ tasks });
}

const updateTask = async (req, res, next) => {
    const id = req.params.id;
    const { taskName, description, status, employeeId, dueDate, inventoryItems } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
    }

    let Tasks;
    try {
        Tasks = await Task.findByIdAndUpdate(
            id,
            { taskName, description, status, employeeId, dueDate },
            { new: true }
        ).populate("inventoryItems.inventoryId", "inventoryName category unit quantity");
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }

    if (!Tasks) {
        return res.status(404).json({ message: "Task not found" });
    }
    return res.status(200).json({ Tasks });
}

// Delete Task function
const deleteTask = async (req, res, next) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
    }

    try {
        const task = await Task.findByIdAndDelete(id);
        
        if (!task) {
            return res.status(404).json({ message: "Task not found or already deleted" });
        }
        
        return res.status(200).json({ message: "Task deleted successfully", task });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
}

const getTasksByEmployee = async (req, res) => {
  const { employeeId } = req.params;

  try {
    console.log("Fetching tasks for employee:", employeeId); // Debug log

    let mongoId = null;

    if (mongoose.Types.ObjectId.isValid(employeeId)) {
      mongoId = employeeId;
    } else if (/^\d+$/.test(employeeId)) {
      const userDoc = await User.findOne({ userId: Number(employeeId) }, "_id");
      if (!userDoc) {
        return res.status(404).json({ message: "Employee not found" });
      }
      mongoId = userDoc._id.toString();
    } else {
      return res.status(400).json({ message: "Invalid employeeId format" });
    }

    console.log("Converted to Mongo ID:", mongoId); // Debug log

    const tasks = await Task
      .find({ employeeId: mongoId })
      .populate("employeeId", "name email userId")
      .populate("inventoryItems.inventoryId", "inventoryName category unit quantity")
      .sort({ dueDate: 1 }); // Sort by due date

    console.log("Found tasks:", tasks.length); // Debug log

    return res.status(200).json({ 
      success: true,
      tasks: tasks || [] 
    });
  } catch (err) {
    console.error("Error fetching tasks by employee:", err);
    return res.status(500).json({ 
      success: false,
      message: "Server error while fetching tasks" 
    });
  }
};

const updateTaskStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ 
            success: false,
            message: "Invalid task ID" 
        });
    }

    // Validate status
    if (!["Pending", "In Progress", "Completed"].includes(status)) {
        return res.status(400).json({ 
            success: false,
            message: "Invalid status value" 
        });
    }

    try {
        const updatedTask = await Task.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        ).populate("employeeId", "name email userId")
         .populate("inventoryItems.inventoryId", "inventoryName category unit quantity");

        if (!updatedTask) {
            return res.status(404).json({ 
                success: false,
                message: "Task not found" 
            });
        }

        return res.status(200).json({ 
            success: true,
            message: "Task status updated successfully",
            task: updatedTask 
        });
    } catch (err) {
        console.error("Error updating task status:", err);
        return res.status(500).json({ 
            success: false,
            message: "Server error while updating task status" 
        });
    }
};

// Approve a completed task
const approveTask = async (req, res) => {
    const { id } = req.params;
    const { approvedBy } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ 
            success: false,
            message: "Invalid task ID" 
        });
    }

    try {
        const task = await Task.findById(id);
        
        if (!task) {
            return res.status(404).json({ 
                success: false,
                message: "Task not found" 
            });
        }

        // Only approve completed tasks
        if (task.status !== 'Completed') {
            return res.status(400).json({ 
                success: false,
                message: "Only completed tasks can be approved" 
            });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            id,
            { 
                approved: true,
                approvedBy: approvedBy || "Admin",
                approvedDate: new Date()
            },
            { new: true, runValidators: true }
        ).populate("employeeId", "name email userId")
         .populate("inventoryItems.inventoryId", "inventoryName category unit quantity");

        return res.status(200).json({ 
            success: true,
            message: "Task approved successfully",
            task: updatedTask 
        });
    } catch (err) {
        console.error("Error approving task:", err);
        return res.status(500).json({ 
            success: false,
            message: "Server error while approving task" 
        });
    }
};

// Reject approval (mark for rework)
const rejectTask = async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ 
            success: false,
            message: "Invalid task ID" 
        });
    }

    try {
        const updatedTask = await Task.findByIdAndUpdate(
            id,
            { 
                approved: false,
                status: "In Progress", // Send back to employee for rework
                rejectionReason: reason
            },
            { new: true, runValidators: true }
        ).populate("employeeId", "name email userId")
         .populate("inventoryItems.inventoryId", "inventoryName category unit quantity");

        if (!updatedTask) {
            return res.status(404).json({ 
                success: false,
                message: "Task not found" 
            });
        }

        return res.status(200).json({ 
            success: true,
            message: "Task rejected and sent back for rework",
            task: updatedTask 
        });
    } catch (err) {
        console.error("Error rejecting task:", err);
        return res.status(500).json({ 
            success: false,
            message: "Server error while rejecting task" 
        });
    }
};

// Add this new function to get inventory by category
const getInventoryByCategory = async (req, res) => {
    const { category } = req.params;

    try {
        const inventory = await Inventory.find({ 
            category: category,
            quantity: { $gt: 0 } // Only show items with stock
        });

        return res.status(200).json({
            success: true,
            inventory: inventory || []
        });
    } catch (err) {
        console.error("Error fetching inventory by category:", err);
        return res.status(500).json({ 
            success: false,
            message: "Server error while fetching inventory" 
        });
    }
};

// Export all functions
module.exports = {
    getAllTask,
    addTasks,
    getById,
    updateTask,
    deleteTask,
    getTasksByEmployee,
    updateTaskStatus,
    approveTask,
    rejectTask,
    getInventoryByCategory
};