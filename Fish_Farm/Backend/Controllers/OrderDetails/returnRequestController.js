const ReturnRequest = require("../../Model/OrderDetails/ReturnRequestModel");
const Order = require("../../Model/OrderDetails/orderDetailsModel");
const { sendReturnStatusUpdateEmail } = require("../../services/orderEmailService");

// ========================
// CREATE RETURN REQUEST
// ========================
// ========================
exports.createReturnRequest = async (req, res) => {
  try {
    console.log("\n========================================");
    console.log("📥 CREATING RETURN REQUEST");
    console.log("========================================");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    console.log("Files:", req.files ? req.files.length : 0);
    console.log("File details:", req.files ? req.files.map(f => ({ name: f.originalname, size: f.size })) : []);
    
    const {
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      reason,
      description,
      returnType,
      items,
    } = req.body;

    console.log("Extracted fields:");
    console.log("- orderId:", orderId);
    console.log("- customerName:", customerName);
    console.log("- customerEmail:", customerEmail);
    console.log("- customerPhone:", customerPhone);
    console.log("- reason:", reason);
    console.log("- returnType:", returnType);
    console.log("- description length:", description?.length);
    console.log("- items (raw):", items);

    // Parse items if it's a JSON string
    let parsedItems = items;
    if (typeof items === 'string') {
      try {
        parsedItems = JSON.parse(items);
        console.log("✅ Items parsed successfully:", parsedItems);
      } catch (parseError) {
        console.error("❌ Error parsing items:", parseError);
        return res.status(400).json({
          success: false,
          message: "Invalid items data format",
          error: parseError.message,
        });
      }
    }

    // Verify order exists and is delivered
    console.log("🔍 Looking for order:", orderId);
    const order = await Order.findById(orderId);
    
    if (!order) {
      console.error("❌ Order not found:", orderId);
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    console.log("✅ Order found. Status:", order.status);

    // Allow returns for delivered or completed orders (made more flexible)
    const allowedStatuses = ["Delivered", "delivered", "Completed", "completed"];
    const orderStatus = order.status || "";
    
    if (!allowedStatuses.includes(orderStatus)) {
      console.error("❌ Order status does not allow returns:", orderStatus);
      console.log("Allowed statuses:", allowedStatuses);
      return res.status(400).json({
        success: false,
        message: `Returns can only be requested for delivered orders. Current status: ${orderStatus}. Please contact support if you believe this is an error.`,
      });
    }

    // Check if return request already exists for this order
    console.log("🔍 Checking for existing return requests...");
    const existingReturn = await ReturnRequest.findOne({
      order: orderId,
      status: { $in: ["Pending", "Approved", "Processing"] },
    });

    if (existingReturn) {
      console.error("❌ Return request already exists:", existingReturn._id);
      return res.status(400).json({
        success: false,
        message: "A return request already exists for this order",
      });
    }

    console.log("✅ No existing return request found");

    // Handle uploaded images
    const images = req.files ? req.files.map(file => file.filename) : [];
    console.log("📷 Images:", images);

    console.log("💾 Creating return request with data:");
    const returnRequestData = {
      order: orderId,
      customerName,
      customerEmail,
      customerPhone,
      reason,
      description,
      returnType: returnType || "Refund",
      items: parsedItems || order.items,
      images,
    };
    console.log(JSON.stringify(returnRequestData, null, 2));

    // Validate items structure
    if (!parsedItems || !Array.isArray(parsedItems) || parsedItems.length === 0) {
      console.error("❌ Invalid items array");
      return res.status(400).json({
        success: false,
        message: "Items array is required and must not be empty",
      });
    }

    // Validate each item has required fields
    for (let i = 0; i < parsedItems.length; i++) {
      const item = parsedItems[i];
      console.log(`Validating item ${i}:`, item);
      
      if (!item.product) {
        console.error(`❌ Item ${i} missing product ID`);
        return res.status(400).json({
          success: false,
          message: `Item at index ${i} is missing product ID`,
        });
      }
      
      if (!item.productType) {
        console.error(`❌ Item ${i} missing productType`);
        return res.status(400).json({
          success: false,
          message: `Item at index ${i} is missing productType`,
        });
      }
      
      if (!item.quantity || item.quantity < 1) {
        console.error(`❌ Item ${i} has invalid quantity`);
        return res.status(400).json({
          success: false,
          message: `Item at index ${i} has invalid quantity`,
        });
      }
    }

    const returnRequest = new ReturnRequest(returnRequestData);

    console.log("💾 Saving return request...");
    await returnRequest.save();

    console.log("✅ Return request created successfully:", returnRequest._id);
    console.log("========================================\n");

    res.status(201).json({
      success: true,
      message: "Return request submitted successfully",
      returnRequest,
    });

  } catch (error) {
    console.error("\n❌❌❌ CREATE RETURN REQUEST ERROR ❌❌❌");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // Check if it's a validation error
    if (error.name === 'ValidationError') {
      console.error("Validation errors:", error.errors);
      const errorMessages = Object.values(error.errors).map(err => err.message);
      console.error("========================================\n");
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errorMessages,
      });
    }
    
    console.error("========================================\n");
    res.status(500).json({
      success: false,
      message: "Failed to create return request",
      error: error.message,
    });
  }
};

// ========================
// GET ALL RETURN REQUESTS (Admin)
// ========================
exports.getAllReturnRequests = async (req, res) => {
  try {
    const { status } = req.query;
    
    const filter = status ? { status } : {};
    
    const returnRequests = await ReturnRequest.find(filter)
      .populate("order")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: returnRequests.length,
      returnRequests,
    });

  } catch (error) {
    console.error("❌ Get return requests error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// GET RETURN REQUESTS BY CUSTOMER EMAIL
// ========================
exports.getCustomerReturnRequests = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const returnRequests = await ReturnRequest.find({ customerEmail: email })
      .populate("order")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: returnRequests.length,
      returnRequests,
    });

  } catch (error) {
    console.error("❌ Get customer return requests error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// GET RETURN REQUEST BY ID
// ========================
exports.getReturnRequestById = async (req, res) => {
  try {
    const returnRequest = await ReturnRequest.findById(req.params.id)
      .populate("order");

    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: "Return request not found",
      });
    }

    res.json({
      success: true,
      returnRequest,
    });

  } catch (error) {
    console.error("❌ Get return request error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// UPDATE RETURN REQUEST STATUS (Admin)
// ========================
exports.updateReturnRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse, refundAmount, refundMethod } = req.body;

    const returnRequest = await ReturnRequest.findById(id).populate("order");

    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: "Return request not found",
      });
    }

    // Store old status for comparison
    const oldStatus = returnRequest.status;

    returnRequest.status = status;

    if (adminResponse) {
      returnRequest.adminResponse = {
        message: adminResponse,
        respondedBy: req.body.respondedBy || "Admin",
        respondedAt: new Date(),
      };
    }

    if (status === "Completed" && refundAmount) {
      returnRequest.refundAmount = refundAmount;
      returnRequest.refundMethod = refundMethod || "Bank Transfer";
      returnRequest.refundedAt = new Date();
    }

    await returnRequest.save();

    console.log(`✅ Return request ${id} updated from ${oldStatus} to ${status}`);

    // Send email notification to customer
    try {
      console.log(`📧 Attempting to send email notification to ${returnRequest.customerEmail}...`);
      const emailResult = await sendReturnStatusUpdateEmail(returnRequest);
      
      if (emailResult.success) {
        console.log(`✅ Email sent successfully. Message ID: ${emailResult.messageId}`);
      } else {
        console.error(`⚠️ Email sending failed: ${emailResult.error}`);
      }
    } catch (emailError) {
      // Log email error but don't fail the request
      console.error(`❌ Email notification error (non-critical):`, emailError.message);
    }

    res.json({
      success: true,
      message: "Return request updated successfully",
      returnRequest,
    });

  } catch (error) {
    console.error("❌ Update return request error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// DELETE RETURN REQUEST
// ========================
exports.deleteReturnRequest = async (req, res) => {
  try {
    const returnRequest = await ReturnRequest.findByIdAndDelete(req.params.id);

    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: "Return request not found",
      });
    }

    res.json({
      success: true,
      message: "Return request deleted successfully",
    });

  } catch (error) {
    console.error("❌ Delete return request error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
