


const Order = require("../../Model/OrderDetails/orderDetailsModel");
const FoodAndMedicine = require("../../Model/Food&Medicine/Food&MedicineModel");
const fish=require("../../Model/fish/fish");
const accessory=require("../../Model/Tank/Accessories/AccessoriesModel");
const { sendOrderConfirmation, sendStatusUpdateEmail, sendDeliveryNotification } = require("../../services/orderEmailService");



// ========================
// CREATE ORDER
// ========================
exports.createOrder = async (req, res) => {
  try {
    console.log("📥 RAW BODY:", req.body);
    console.log("📂 FILE:", req.file);
    console.log("📦 Creating order with items:", typeof req.body.items === 'string' ? req.body.items : 'Not available as string');

    // Parse safely
    const safeParse = (val, fallback) => {
      try {
        return typeof val === "string" ? JSON.parse(val) : (val || fallback);
      } catch (err) {
        console.error("❌ JSON parse failed for:", val, err.message);
        return fallback;
      }
    };

    const items = safeParse(req.body.items, []);
    const contact = safeParse(req.body.contact, {});
    const delivery = safeParse(req.body.delivery, {});
    const payment = safeParse(req.body.payment, {});

    console.log("Processed payment data:", payment);
    
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Order items are required" });
    }

    let totalAmount = 0;

    for (const item of items) {
      // Check in all product collections: Food&Medicine, Fish, and Accessories
      console.log(`Looking for product ID: ${item.product} in all collections`);
      
      let product = null;
      let productType = null;
      
      // Use the product type sent from frontend if available
      if (item.productType) {
        console.log(`Product type specified by frontend: ${item.productType} for product: ${item.product}`);
        
        // Look in the appropriate collection based on product type
        if (item.productType === "Food&MedicineModel") {
          product = await FoodAndMedicine.findById(item.product);
          if (product) {
            productType = "Food&MedicineModel";
            console.log(`Found product in Food&Medicine collection: ${product.productName || product.name}`);
          }
        } 
        else if (item.productType === "Fish") {
          product = await fish.findById(item.product);
          if (product) {
            productType = "Fish";
            console.log(`Found product in Fish collection: ${product.name || product.fishType}`);
          }
        }
        else if (item.productType === "Accessory") {
          product = await accessory.findById(item.product);
          if (product) {
            productType = "Accessory";
            console.log(`Found product in Accessories collection: ${product.name}`);
          }
        }
      } 
      // If no product type specified or product not found in specified collection, try all collections
      if (!product) {
        console.log(`Trying all collections for product: ${item.product}`);
        
        // Try Food&Medicine collection first
        product = await FoodAndMedicine.findById(item.product);
        if (product) {
          productType = "Food&MedicineModel";
          console.log(`Found product in Food&Medicine collection: ${product.productName || product.name}`);
        }
        
        // If not found, check Fish collection
        if (!product) {
          product = await fish.findById(item.product);
          if (product) {
            productType = "Fish";
            console.log(`Found product in Fish collection: ${product.name || product.fishType}`);
          }
        }
        
        // If still not found, check Accessories collection
        if (!product) {
          product = await accessory.findById(item.product);
          if (product) {
            productType = "Accessory";
            console.log(`Found product in Accessories collection: ${product.name}`);
          }
        }
      }
      
      // If product not found in any collection
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      }
      
      // Store the product type with the item
      item.productType = productType;
      
      // Check stock based on product type
      if (productType === "Fish") {
        // Fish uses Quantity field
        if (product.Quantity !== undefined && product.Quantity < item.quantity) {
          const productName = product.subSpecies || product.Species || "Fish";
          return res.status(400).json({ success: false, message: `Not enough stock for ${productName}` });
        }
      } else {
        // Other products use stock field
        if (product.stock !== undefined && product.stock < item.quantity) {
          const productName = product.productName || product.name || "Product";
          return res.status(400).json({ success: false, message: `Not enough stock for ${productName}` });
        }
      }

      // Calculate total amount based on the correct price field for each product type
      let productPrice = 0;
      
      if (productType === "Fish") {
        // Fish uses PricePerCouple field
        productPrice = product.PricePerCouple || 0;
        console.log(`Fish price from PricePerCouple: ${productPrice}`);
      } else {
        // Food&Medicine and Accessory use price field
        productPrice = product.price || 0;
        console.log(`Product price from price field: ${productPrice}`);
      }
      
      // Ensure we have a valid number before adding
      if (isNaN(productPrice)) {
        console.log(`WARNING: Invalid price for product ${product._id}, using 0`);
        productPrice = 0;
      }
      
      // ✅ IMPORTANT: Store the price in the item for order history
      item.price = productPrice;
      console.log(`✅ Stored price ${productPrice} in item for product ${item.product}`);
      
      const itemTotal = productPrice * item.quantity;
      console.log(`Item total: ${productPrice} × ${item.quantity} = ${itemTotal}`);
      totalAmount += itemTotal;
      
      // ✅ Update stock based on product type
      if (productType === "Fish") {
        // Reduce fish Quantity and increase SoldCount
        product.Quantity -= item.quantity;
        product.SoldCount = (product.SoldCount || 0) + item.quantity;
        await product.save();
        console.log(`✅ Reduced Fish Quantity by ${item.quantity}. New Quantity: ${product.Quantity}, SoldCount: ${product.SoldCount}`);
      } else if (product.stock !== undefined) {
        // Reduce stock for other products
        product.stock -= item.quantity;
        await product.save();
        console.log(`✅ Reduced product stock by ${item.quantity}. New stock: ${product.stock}`);
      }
    }

    // Handle file upload properly
    let bankSlipImage = null;
    if (req.file) {
      console.log("Bank slip uploaded:", req.file);
      bankSlipImage = req.file.filename;
    } else if (payment.method === "BANK_SLIP") {
      console.log("Bank slip required but not provided");
      // Make this optional to prevent order failure
      // return res.status(400).json({ success: false, message: "Bank slip image is required for bank transfer payment" });
    }

    // Create the order with proper payment details
    const paymentDetails = { ...payment };
    if (bankSlipImage) {
      paymentDetails.bankSlipImage = bankSlipImage;
    }

    // Ensure totalAmount is a valid number
    if (isNaN(totalAmount)) {
      console.error("❌ totalAmount is NaN! Setting to 0 to prevent validation failure");
      totalAmount = 0;
    }
    
    console.log(`Final order total: ${totalAmount}`);
    
    const newOrder = new Order({
      items,
      contact,
      delivery,
      payment: paymentDetails,
      totalAmount,
    });

    await newOrder.save();
    console.log("✅ Order created:", newOrder._id);

    // Send order confirmation email asynchronously (don't wait for it)
    sendOrderConfirmation(newOrder).catch(err => {
      console.error("⚠️ Failed to send order confirmation email:", err.message);
    });

    res.status(201).json({ success: true, order: newOrder });
  } catch (error) {
    console.error("❌ Create order error:", error.message);
    console.error(error.stack);
    // Send a more user-friendly error message
    res.status(500).json({ 
      success: false, 
      message: "Error creating order: " + error.message
    });
  }
};

// ========================
// GET ALL ORDERS
// ========================
exports.getOrders = async (req, res) => {
  try {
    // Extract query parameters
    const { contact, status } = req.query;
    
    console.log("Get Orders Request - Query params:", req.query);

    // Build query filters
    let filter = {};
    
    // Filter by contact email or phone
    if (contact) {
      filter["contact.emailOrPhone"] = contact;
      console.log("Filtering orders by contact:", contact);
    }
    
    // Filter by order status
    if (status) {
      filter.status = status;
      console.log("Filtering orders by status:", status);
    }

    // Execute query with optional filters
    const orders = await Order.find(filter).sort({ createdAt: -1 }); // Most recent orders first
    
    // Manually populate products from different collections based on productType
    for (const order of orders) {
      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          try {
            console.log(`Processing item with product ID: ${item.product}, productType: ${item.productType}`);
            
            // If productType is missing, try to determine it by searching all collections
            if (!item.productType) {
              console.log(`ProductType missing for product ${item.product}, searching all collections...`);
              
              // Try Food&Medicine first
              let product = await FoodAndMedicine.findById(item.product);
              if (product) {
                item.productType = 'Food&MedicineModel';
                item.product = product;
                console.log(`Found product in Food&Medicine collection: ${product.productName || product.name}`);
              } else {
                // Try Fish collection
                product = await fish.findById(item.product);
                if (product) {
                  item.productType = 'Fish';
                  item.product = product;
                  console.log(`Found product in Fish collection: ${product.Species} - ${product.subSpecies}`);
                } else {
                  // Try Accessories collection
                  product = await accessory.findById(item.product);
                  if (product) {
                    item.productType = 'Accessory';
                    item.product = product;
                    console.log(`Found product in Accessories collection: ${product.product}`);
                  } else {
                    console.log(`Product ${item.product} not found in any collection`);
                    // Create fallback product object
                    item.product = {
                      _id: item.product,
                      productName: `Product ${item.product}`,
                      name: `Product ${item.product}`,
                      product: `Product ${item.product}`,
                      Species: `Unknown Species`,
                      subSpecies: `Unknown Subspecies`,
                      price: item.price || 0,
                      PricePerCouple: item.price || 0
                    };
                  }
                }
              }
            } else {
              // Use existing productType
              console.log(`Using existing productType: ${item.productType} for product: ${item.product}`);
              if (item.productType === 'Food&MedicineModel') {
                const product = await FoodAndMedicine.findById(item.product);
                if (product) {
                  item.product = product;
                  console.log(`Populated Food&Medicine product: ${product.productName || product.name}`);
                } else {
                  console.log(`Food&Medicine product ${item.product} not found`);
                  // Create fallback product object
                  item.product = {
                    _id: item.product,
                    productName: `Product ${item.product}`,
                    name: `Product ${item.product}`,
                    product: `Product ${item.product}`,
                    Species: `Unknown Species`,
                    subSpecies: `Unknown Subspecies`,
                    price: item.price || 0,
                    PricePerCouple: item.price || 0
                  };
                }
              } else if (item.productType === 'Fish') {
                const product = await fish.findById(item.product);
                if (product) {
                  item.product = product;
                  console.log(`Populated Fish product: ${product.Species} - ${product.subSpecies}`);
                } else {
                  console.log(`Fish product ${item.product} not found`);
                  // Create fallback product object
                  item.product = {
                    _id: item.product,
                    productName: `Product ${item.product}`,
                    name: `Product ${item.product}`,
                    product: `Product ${item.product}`,
                    Species: `Unknown Species`,
                    subSpecies: `Unknown Subspecies`,
                    price: item.price || 0,
                    PricePerCouple: item.price || 0
                  };
                }
              } else if (item.productType === 'Accessory') {
                const product = await accessory.findById(item.product);
                if (product) {
                  item.product = product;
                  console.log(`Populated Accessory product: ${product.product}`);
                } else {
                  console.log(`Accessory product ${item.product} not found`);
                  // Create fallback product object
                  item.product = {
                    _id: item.product,
                    productName: `Product ${item.product}`,
                    name: `Product ${item.product}`,
                    product: `Product ${item.product}`,
                    Species: `Unknown Species`,
                    subSpecies: `Unknown Subspecies`,
                    price: item.price || 0,
                    PricePerCouple: item.price || 0
                  };
                }
              }
            }
            
            // Log the final item state for debugging
            console.log(`Final item state:`, {
              productId: item.product?._id || item.product,
              productName: item.product?.productName || item.product?.product || (item.product?.Species && item.product?.subSpecies ? `${item.product.Species} - ${item.product.subSpecies}` : null),
              productType: item.productType,
              hasProduct: !!item.product
            });
            
          } catch (error) {
            console.error(`Error populating product ${item.product}: ${error.message}`);
            // Create a fallback product object
            item.product = {
              _id: item.product,
              productName: `Error Loading Product`,
              name: `Error Loading Product`,
              product: `Error Loading Product`,
              Species: `Error`,
              subSpecies: `Error`,
              price: item.price || 0,
              PricePerCouple: item.price || 0
            };
          }
        }
      }
    }
    
    console.log(`Found ${orders.length} orders matching filter:`, filter);
    
    // For debugging, log the first few orders
    if (orders.length > 0) {
      console.log("Sample order contact:", orders[0].contact);
    }
    
    res.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// ========================
// GET ORDER BY ID
// ========================
exports.getOrderById = async (req, res) => {
  try {
    console.log(`🔍 Getting order by ID: ${req.params.id}`);
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    
    console.log(`📦 Raw order from DB:`, JSON.stringify(order, null, 2));
    
    // Manually populate products from different collections based on productType
    if (order.items && Array.isArray(order.items)) {
      for (const item of order.items) {
        try {
          console.log(`Processing item with product ID: ${item.product}, productType: ${item.productType}`);
          
          // Store the original product ID
          const originalProductId = item.product;
          
          // Try to populate the product
          let productFound = false;
          
          // If productType is missing, try to determine it by searching all collections
          if (!item.productType) {
            console.log(`ProductType missing for product ${item.product}, searching all collections...`);
            
            // Try Food&Medicine first
            let product = await FoodAndMedicine.findById(item.product);
            if (product) {
              item.productType = 'Food&MedicineModel';
              item.product = product;
              productFound = true;
              console.log(`Found product in Food&Medicine collection: ${product.productName || product.name}`);
            } else {
              // Try Fish collection
              product = await fish.findById(item.product);
              if (product) {
                item.productType = 'Fish';
                item.product = product;
                productFound = true;
                console.log(`Found product in Fish collection: ${product.Species} - ${product.subSpecies}`);
              } else {
                // Try Accessories collection
                product = await accessory.findById(item.product);
                if (product) {
                  item.productType = 'Accessory';
                  item.product = product;
                  productFound = true;
                  console.log(`Found product in Accessories collection: ${product.product}`);
                } else {
                  console.log(`Product ${item.product} not found in any collection`);
                }
              }
            }
          } else {
            // Use existing productType
            console.log(`Using existing productType: ${item.productType} for product: ${item.product}`);
            if (item.productType === 'Food&MedicineModel') {
              console.log(`🔍 Searching for Food&Medicine product: ${item.product}`);
              const product = await FoodAndMedicine.findById(item.product);
              if (product) {
                item.product = product;
                productFound = true;
                console.log(`✅ Populated Food&Medicine product: ${product.productName || product.name}`);
              } else {
                console.log(`❌ Food&Medicine product ${item.product} not found`);
                // Try to find it in other collections as fallback
                console.log(`🔄 Trying fallback search for product: ${item.product}`);
                const fishProduct = await fish.findById(item.product);
                if (fishProduct) {
                  item.product = fishProduct;
                  item.productType = 'Fish';
                  productFound = true;
                  console.log(`✅ Found in Fish collection: ${fishProduct.Species} - ${fishProduct.subSpecies}`);
                } else {
                  const accessoryProduct = await accessory.findById(item.product);
                  if (accessoryProduct) {
                    item.product = accessoryProduct;
                    item.productType = 'Accessory';
                    productFound = true;
                    console.log(`✅ Found in Accessory collection: ${accessoryProduct.product}`);
                  } else {
                    console.log(`❌ Product ${item.product} not found in any collection`);
                  }
                }
              }
            } else if (item.productType === 'Fish') {
              console.log(`🔍 Searching for Fish product: ${item.product}`);
              const product = await fish.findById(item.product);
              if (product) {
                item.product = product;
                productFound = true;
                console.log(`✅ Populated Fish product: ${product.Species} - ${product.subSpecies}`);
              } else {
                console.log(`❌ Fish product ${item.product} not found`);
                // Try to find it in other collections as fallback
                console.log(`🔄 Trying fallback search for product: ${item.product}`);
                const foodProduct = await FoodAndMedicine.findById(item.product);
                if (foodProduct) {
                  item.product = foodProduct;
                  item.productType = 'Food&MedicineModel';
                  productFound = true;
                  console.log(`✅ Found in Food&Medicine collection: ${foodProduct.productName}`);
                } else {
                  const accessoryProduct = await accessory.findById(item.product);
                  if (accessoryProduct) {
                    item.product = accessoryProduct;
                    item.productType = 'Accessory';
                    productFound = true;
                    console.log(`✅ Found in Accessory collection: ${accessoryProduct.product}`);
                  } else {
                    console.log(`❌ Product ${item.product} not found in any collection`);
                  }
                }
              }
            } else if (item.productType === 'Accessory') {
              console.log(`🔍 Searching for Accessory product: ${item.product}`);
              const product = await accessory.findById(item.product);
              if (product) {
                item.product = product;
                productFound = true;
                console.log(`✅ Populated Accessory product: ${product.product}`);
              } else {
                console.log(`❌ Accessory product ${item.product} not found`);
                // Try to find it in other collections as fallback
                console.log(`🔄 Trying fallback search for product: ${item.product}`);
                const foodProduct = await FoodAndMedicine.findById(item.product);
                if (foodProduct) {
                  item.product = foodProduct;
                  item.productType = 'Food&MedicineModel';
                  productFound = true;
                  console.log(`✅ Found in Food&Medicine collection: ${foodProduct.productName}`);
                } else {
                  const fishProduct = await fish.findById(item.product);
                  if (fishProduct) {
                    item.product = fishProduct;
                    item.productType = 'Fish';
                    productFound = true;
                    console.log(`✅ Found in Fish collection: ${fishProduct.Species} - ${fishProduct.subSpecies}`);
                  } else {
                    console.log(`❌ Product ${item.product} not found in any collection`);
                  }
                }
              }
            }
          }
          
          // If product not found, create a fallback object with the original ID and preserved price
          if (!productFound) {
            console.log(`⚠️ Product ${originalProductId} not found in database. Using stored order data.`);
            console.log(`⚠️ Stored item price: ${item.price}, quantity: ${item.quantity}`);
            
            // Keep the product as an object with stored price information
            item.product = {
              _id: originalProductId,
              productName: `Product Not Found (ID: ${originalProductId.toString().slice(-6)})`,
              name: `Product Not Found (ID: ${originalProductId.toString().slice(-6)})`,
              product: `Product Not Found (ID: ${originalProductId.toString().slice(-6)})`,
              Species: `Unavailable`,
              subSpecies: `Product Removed or Deleted`,
              price: item.price || 0,  // Use the stored price from the order
              PricePerCouple: item.price || 0  // Use the stored price from the order
            };
            
            console.log(`⚠️ Created fallback product with price: ${item.product.price}`);
          }
          
          // Log the final item state for debugging
          console.log(`✅ Final item state:`, {
            productId: item.product?._id || item.product,
            productName: item.product?.productName || item.product?.product || (item.product?.Species && item.product?.subSpecies ? `${item.product.Species} - ${item.product.subSpecies}` : null),
            productType: item.productType,
            price: item.product?.price || item.product?.PricePerCouple || item.price,
            quantity: item.quantity,
            hasProduct: !!item.product
          });
          
        } catch (error) {
          console.error(`Error populating product ${item.product}: ${error.message}`);
          // Create a fallback product object
          item.product = {
            _id: item.product,
            productName: `Error Loading Product`,
            name: `Error Loading Product`,
            product: `Error Loading Product`,
            Species: `Error`,
            subSpecies: `Error`,
            price: item.price || 0,
            PricePerCouple: item.price || 0
          };
        }
      }
    }
    
    console.log(`✅ Final populated order:`, JSON.stringify(order, null, 2));
    res.json({ success: true, order });
  } catch (error) {
    console.error(`❌ Error in getOrderById:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================
// UPDATE ORDER (admin edits contact/delivery/payment)
// ========================
exports.updateOrder = async (req, res) => {
  try {
    let contact = {};
    let delivery = {};
    let payment = {};

    try {
      contact = typeof req.body.contact === "string" ? JSON.parse(req.body.contact) : req.body.contact;
      delivery = typeof req.body.delivery === "string" ? JSON.parse(req.body.delivery) : req.body.delivery;
      payment = typeof req.body.payment === "string" ? JSON.parse(req.body.payment) : req.body.payment;
    } catch (err) {
      return res.status(400).json({ success: false, message: "Invalid request data", error: err.message });
    }

    let updateData = { contact, delivery, payment };

    if (req.file) {
      updateData.payment = {
        ...updateData.payment,
        bankSlipImage: req.file.filename,
      };
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("items.product");

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================
// UPDATE ORDER STATUS (admin action)
// ========================
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Get the old order first to compare status
    const oldOrder = await Order.findById(req.params.id);
    if (!oldOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const oldStatus = oldOrder.status;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("items.product");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Send status update email asynchronously
    sendStatusUpdateEmail(order, oldStatus).catch(err => {
      console.error("⚠️ Failed to send status update email:", err.message);
    });

    // If status changed to Delivered, send delivery notification
    if (status === 'Delivered' && oldStatus !== 'Delivered') {
      sendDeliveryNotification(order).catch(err => {
        console.error("⚠️ Failed to send delivery notification:", err.message);
      });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================
// DELETE ORDER
// ========================
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// ========================
// DEBUG: CHECK SPECIFIC PRODUCTS
// ========================
exports.debugCheckSpecificProducts = async (req, res) => {
  try {
    const productIds = [
      "68b322f7af2cd53e41fcb79d", // Fish from order
      "68b5de7b19b6158a789094b5", // Food&Medicine from order
      "68b67538049c9b7a86296921"  // Accessory from order
    ];
    
    console.log("🔍 Checking specific product IDs:", productIds);
    
    const results = {};
    
    for (const productId of productIds) {
      console.log(`Checking product ID: ${productId}`);
      
      // Check in Food&Medicine
      const foodProduct = await FoodAndMedicine.findById(productId);
      if (foodProduct) {
        results[productId] = { collection: 'Food&Medicine', product: foodProduct };
        console.log(`✅ Found in Food&Medicine: ${foodProduct.productName}`);
        continue;
      }
      
      // Check in Fish
      const fishProduct = await fish.findById(productId);
      if (fishProduct) {
        results[productId] = { collection: 'Fish', product: fishProduct };
        console.log(`✅ Found in Fish: ${fishProduct.Species} - ${fishProduct.subSpecies}`);
        continue;
      }
      
      // Check in Accessories
      const accessoryProduct = await accessory.findById(productId);
      if (accessoryProduct) {
        results[productId] = { collection: 'Accessory', product: accessoryProduct };
        console.log(`✅ Found in Accessory: ${accessoryProduct.product}`);
        continue;
      }
      
      results[productId] = { collection: 'NOT_FOUND', product: null };
      console.log(`❌ Product ${productId} not found in any collection`);
    }
    
    res.json({
      success: true,
      debug: {
        productIds,
        results
      }
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================
// CUSTOMER: CANCEL ORDER
// ========================
exports.cancelOrderByCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    console.log(`🚫 Customer requesting to cancel order: ${id}`);

    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    // Only allow cancellation if order is still Pending
    if (order.status !== "Pending") {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot cancel order. Order is already ${order.status}. Please contact support for assistance.` 
      });
    }

    // Store the old status for email notification
    const oldStatus = order.status;

    // Update order status to Cancelled
    order.status = "Cancelled";
    order.cancellationReason = reason || "Cancelled by customer";
    order.cancelledAt = new Date();
    
    await order.save();

    console.log(`✅ Order ${id} cancelled by customer`);

    // Send status update email
    sendStatusUpdateEmail(order, oldStatus).catch(err => {
      console.error("⚠️ Failed to send cancellation email:", err.message);
    });

    res.json({ 
      success: true, 
      message: "Order cancelled successfully",
      order 
    });

  } catch (error) {
    console.error("❌ Cancel order error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to cancel order",
      error: error.message 
    });
  }
};

// ========================
exports.debugGetRawOrder = async (req, res) => {
  try {
    console.log(`🔍 Debug: Getting raw order data for ID: ${req.params.id}`);
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    
    res.json({
      success: true,
      debug: {
        orderId: order._id,
        items: order.items.map(item => ({
          product: item.product,
          productType: item.productType,
          quantity: item.quantity,
          price: item.price
        }))
      }
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================
exports.debugGetAllProducts = async (req, res) => {
  try {
    console.log("🔍 Debug: Getting all products from all collections");
    
    const [foodProducts, fishProducts, accessoryProducts] = await Promise.all([
      FoodAndMedicine.find({}).limit(5),
      fish.find({}).limit(5),
      accessory.find({}).limit(5)
    ]);
    
    console.log("Food&Medicine products:", foodProducts.length);
    console.log("Fish products:", fishProducts.length);
    console.log("Accessory products:", accessoryProducts.length);
    
    res.json({
      success: true,
      debug: {
        foodProducts: foodProducts.map(p => ({ _id: p._id, productName: p.productName })),
        fishProducts: fishProducts.map(p => ({ _id: p._id, Species: p.Species, subSpecies: p.subSpecies })),
        accessoryProducts: accessoryProducts.map(p => ({ _id: p._id, product: p.product }))
      }
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
