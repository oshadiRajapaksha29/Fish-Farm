const Order = require("../../Model/OrderDetails/orderDetailsModel");
const FoodAndMedicine = require("../../Model/Food&Medicine/Food&MedicineModel");
const Fish = require("../../Model/fish/fish");
const Accessory = require("../../Model/Tank/Accessories/AccessoriesModel");

// ========================
// EXPORT ORDER HISTORY AS CSV
// ========================
exports.exportOrderHistoryCSV = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Get all orders for this customer
    const orders = await Order.find({ "contact.emailOrPhone": email })
      .sort({ createdAt: -1 });

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found for this customer",
      });
    }

    // Populate product details for each order
    const populatedOrders = await Promise.all(
      orders.map(async (order) => {
        const populatedItems = await Promise.all(
          order.items.map(async (item) => {
            let product = null;
            
            if (item.productType === "Food&MedicineModel") {
              product = await FoodAndMedicine.findById(item.product);
            } else if (item.productType === "Fish") {
              product = await Fish.findById(item.product);
            } else if (item.productType === "Accessory") {
              product = await Accessory.findById(item.product);
            }
            
            return {
              ...item.toObject(),
              productName: product ? (product.productName || product.Species || product.product) : "Unknown",
            };
          })
        );
        
        return {
          ...order.toObject(),
          items: populatedItems,
        };
      })
    );

    // Generate CSV content
    let csvContent = "Order ID,Order Date,Status,Items,Total Amount,Payment Method,Delivery Address\n";
    
    populatedOrders.forEach((order) => {
      const orderId = `#${order._id.toString().slice(-8).toUpperCase()}`;
      const orderDate = new Date(order.createdAt).toLocaleDateString();
      const status = order.status;
      const items = order.items.map(item => 
        `${item.productName} (Qty: ${item.quantity})`
      ).join("; ");
      const totalAmount = `Rs. ${order.totalAmount.toFixed(2)}`;
      const paymentMethod = order.payment?.method || "N/A";
      const address = `${order.delivery?.address}, ${order.delivery?.city}`;
      
      csvContent += `"${orderId}","${orderDate}","${status}","${items}","${totalAmount}","${paymentMethod}","${address}"\n`;
    });

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="order-history-${Date.now()}.csv"`);
    
    res.send(csvContent);

    console.log(`✅ Exported order history CSV for ${email}`);

  } catch (error) {
    console.error("❌ Export CSV error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to export order history",
      error: error.message,
    });
  }
};

// ========================
// EXPORT ORDER HISTORY AS JSON
// ========================
exports.exportOrderHistoryJSON = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Get all orders for this customer
    const orders = await Order.find({ "contact.emailOrPhone": email })
      .sort({ createdAt: -1 });

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found for this customer",
      });
    }

    // Populate product details for each order
    const populatedOrders = await Promise.all(
      orders.map(async (order) => {
        const populatedItems = await Promise.all(
          order.items.map(async (item) => {
            let product = null;
            
            if (item.productType === "Food&MedicineModel") {
              product = await FoodAndMedicine.findById(item.product);
            } else if (item.productType === "Fish") {
              product = await Fish.findById(item.product);
            } else if (item.productType === "Accessory") {
              product = await Accessory.findById(item.product);
            }
            
            return {
              productId: item.product,
              productType: item.productType,
              productName: product ? (product.productName || product.Species || product.product) : "Unknown",
              quantity: item.quantity,
              price: item.price,
              subtotal: item.quantity * item.price,
            };
          })
        );
        
        return {
          orderId: order._id,
          orderNumber: `#${order._id.toString().slice(-8).toUpperCase()}`,
          orderDate: order.createdAt,
          status: order.status,
          items: populatedItems,
          totalAmount: order.totalAmount,
          payment: order.payment,
          delivery: order.delivery,
          contact: order.contact,
          invoiceNumber: order.invoiceNumber,
          createdAt: order.createdAt,
        };
      })
    );

    // Generate export data
    const exportData = {
      customerEmail: email,
      exportDate: new Date(),
      totalOrders: orders.length,
      orders: populatedOrders,
      summary: {
        totalSpent: orders.reduce((sum, order) => sum + order.totalAmount, 0),
        pendingOrders: orders.filter(o => o.status === "Pending").length,
        completedOrders: orders.filter(o => o.status === "Delivered").length,
        cancelledOrders: orders.filter(o => o.status === "Cancelled").length,
      },
    };

    // Set headers for JSON download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="order-history-${Date.now()}.json"`);
    
    res.json(exportData);

    console.log(`✅ Exported order history JSON for ${email}`);

  } catch (error) {
    console.error("❌ Export JSON error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to export order history",
      error: error.message,
    });
  }
};

// ========================
// GET ORDER STATISTICS
// ========================
exports.getOrderStatistics = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const orders = await Order.find({ "contact.emailOrPhone": email });

    const statistics = {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      averageOrderValue: orders.length > 0 
        ? (orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length).toFixed(2)
        : 0,
      ordersByStatus: {
        pending: orders.filter(o => o.status === "Pending").length,
        confirmed: orders.filter(o => o.status === "Confirmed").length,
        shipped: orders.filter(o => o.status === "Shipped").length,
        delivered: orders.filter(o => o.status === "Delivered").length,
        cancelled: orders.filter(o => o.status === "Cancelled").length,
      },
      firstOrderDate: orders.length > 0 
        ? orders.sort((a, b) => a.createdAt - b.createdAt)[0].createdAt
        : null,
      lastOrderDate: orders.length > 0 
        ? orders.sort((a, b) => b.createdAt - a.createdAt)[0].createdAt
        : null,
    };

    res.json({
      success: true,
      statistics,
    });

  } catch (error) {
    console.error("❌ Get statistics error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
