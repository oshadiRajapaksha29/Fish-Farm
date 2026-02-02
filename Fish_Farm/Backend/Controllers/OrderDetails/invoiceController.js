const Order = require("../../Model/OrderDetails/orderDetailsModel");
const FoodAndMedicine = require("../../Model/Food&Medicine/Food&MedicineModel");
const fish = require("../../Model/fish/fish");
const accessory = require("../../Model/Tank/Accessories/AccessoriesModel");
const { sendInvoiceEmail } = require("../../services/orderEmailService");

// Company Information
const COMPANY_INFO = {
  name: "Aqua Peak Fish Farm",
  address: "123/A, Wijayapura Road, Kekirawa, Anuradapura, Sri Lanka",
  phone: "+94 77 123 4567",
  email: "aquapeak@gmail.com",
  website: "www.aquapeak.lk",
  taxId: "TAX-123456789"
};

// Generate unique invoice number
const generateInvoiceNumber = async () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  
  // Find the latest invoice for this month
  const latestOrder = await Order.findOne({
    invoiceNumber: { $exists: true, $ne: null }
  }).sort({ invoiceDate: -1 });

  let sequenceNumber = 1;
  
  if (latestOrder && latestOrder.invoiceNumber) {
    // Extract sequence number from last invoice
    const parts = latestOrder.invoiceNumber.split('-');
    if (parts.length === 3 && parts[0] === 'INV' && parts[1] === `${year}${month}`) {
      sequenceNumber = parseInt(parts[2]) + 1;
    }
  }

  // Format: INV-YYYYMM-XXXX (e.g., INV-202510-0001)
  return `INV-${year}${month}-${String(sequenceNumber).padStart(4, '0')}`;
};

// Generate invoice data for an order
exports.generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    console.log(`📄 Generating invoice for order: ${orderId}`);
    
    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    // Generate invoice number if not exists
    if (!order.invoiceNumber) {
      order.invoiceNumber = await generateInvoiceNumber();
      order.invoiceDate = new Date();
      await order.save();
      console.log(`✅ Generated invoice number: ${order.invoiceNumber}`);
      
      // Send invoice email asynchronously when first generated
      sendInvoiceEmail(order, order.invoiceNumber).catch(err => {
        console.error("⚠️ Failed to send invoice email:", err.message);
      });
    }

    // Populate product details
    const invoiceItems = [];
    let subtotal = 0;

    for (const item of order.items) {
      let productDetails = {
        name: "Unknown Product",
        description: "",
        price: item.price || 0,
        quantity: item.quantity || 1
      };

      // Try to fetch product details
      try {
        let product = null;
        
        if (item.productType === 'Food&MedicineModel') {
          product = await FoodAndMedicine.findById(item.product);
          if (product) {
            productDetails.name = product.productName || product.name || "Food/Medicine";
            productDetails.description = product.description || `Category: ${product.category || 'N/A'}`;
          }
        } else if (item.productType === 'Fish') {
          product = await fish.findById(item.product);
          if (product) {
            productDetails.name = `${product.Species || 'Fish'} - ${product.subSpecies || ''}`;
            productDetails.description = `Type: ${product.Type || 'N/A'}`;
          }
        } else if (item.productType === 'Accessory') {
          product = await accessory.findById(item.product);
          if (product) {
            productDetails.name = product.product || product.name || "Accessory";
            productDetails.description = product.description || "";
          }
        }
      } catch (err) {
        console.error(`Error fetching product details: ${err.message}`);
      }

      const itemTotal = productDetails.price * productDetails.quantity;
      subtotal += itemTotal;

      invoiceItems.push({
        id: item._id,
        name: productDetails.name,
        description: productDetails.description,
        unitPrice: productDetails.price,
        quantity: productDetails.quantity,
        total: itemTotal
      });
    }

    // Calculate totals (you can add tax calculation here)
    const tax = 0; // Add tax calculation if needed (e.g., subtotal * 0.15 for 15%)
    const total = subtotal + tax;

    // Build invoice data
    const invoiceData = {
      invoiceNumber: order.invoiceNumber,
      invoiceDate: order.invoiceDate || order.createdAt,
      orderDate: order.createdAt,
      orderId: order._id,
      
      // Company info
      company: COMPANY_INFO,
      
      // Customer info
      customer: {
        name: `${order.delivery?.firstName || ''} ${order.delivery?.lastName || ''}`.trim() || 'N/A',
        email: order.contact?.emailOrPhone || 'N/A',
        phone: order.delivery?.phone || order.contact?.emailOrPhone || 'N/A',
        address: {
          street: order.delivery?.address || '',
          apartment: order.delivery?.apartment || '',
          city: order.delivery?.city || '',
          state: order.delivery?.state || '',
          pinCode: order.delivery?.pinCode || ''
        }
      },
      
      // Items
      items: invoiceItems,
      
      // Totals
      subtotal: subtotal,
      tax: tax,
      taxRate: 0, // Set tax rate if applicable (e.g., 0.15 for 15%)
      total: total,
      
      // Payment info
      paymentMethod: order.payment?.method || 'N/A',
      paymentStatus: order.status === 'Delivered' ? 'Paid' : 'Pending',
      
      // Order status
      orderStatus: order.status
    };

    console.log(`✅ Invoice generated successfully: ${order.invoiceNumber}`);
    
    res.json({
      success: true,
      invoice: invoiceData
    });

  } catch (error) {
    console.error("❌ Error generating invoice:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate invoice",
      error: error.message
    });
  }
};

// Get invoice by order ID
exports.getInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    if (!order.invoiceNumber) {
      return res.status(404).json({ 
        success: false, 
        message: "Invoice not generated for this order yet" 
      });
    }

    res.json({
      success: true,
      invoiceNumber: order.invoiceNumber,
      invoiceDate: order.invoiceDate
    });

  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoice",
      error: error.message
    });
  }
};
