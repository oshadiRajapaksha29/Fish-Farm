// Script to fix existing orders that don't have prices stored in items
const mongoose = require("mongoose");
const Order = require("../Model/OrderDetails/orderDetailsModel");
const FoodAndMedicine = require("../Model/Food&Medicine/Food&MedicineModel");
const fish = require("../Model/fish/fish");
const accessory = require("../Model/Tank/Accessories/AccessoriesModel");

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Aqua-peak-Project:Aqua-peak-Member5@aqua-peak.oo1kfwc.mongodb.net/fishfarm";

async function fixOrderPrices() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    console.log("\n📦 Fetching all orders...");
    const orders = await Order.find({});
    console.log(`Found ${orders.length} orders to check`);

    let fixedCount = 0;
    let alreadyOkCount = 0;

    for (const order of orders) {
      let orderModified = false;

      console.log(`\n🔍 Checking Order ID: ${order._id}`);
      
      for (const item of order.items) {
        // Check if price is missing or 0
        if (!item.price || item.price === 0) {
          console.log(`  ⚠️  Item missing price - Product ID: ${item.product}`);
          
          let product = null;
          let productPrice = 0;

          // Try to find the product
          if (item.productType === 'Food&MedicineModel') {
            product = await FoodAndMedicine.findById(item.product);
            if (product) {
              productPrice = product.price || 0;
              console.log(`  ✅ Found Food&Medicine: ${product.productName} - Price: Rs. ${productPrice}`);
            }
          } else if (item.productType === 'Fish') {
            product = await fish.findById(item.product);
            if (product) {
              productPrice = product.PricePerCouple || 0;
              console.log(`  ✅ Found Fish: ${product.Species} - ${product.subSpecies} - Price: Rs. ${productPrice}`);
            }
          } else if (item.productType === 'Accessory') {
            product = await accessory.findById(item.product);
            if (product) {
              productPrice = product.price || 0;
              console.log(`  ✅ Found Accessory: ${product.product} - Price: Rs. ${productPrice}`);
            }
          } else {
            // Try all collections
            product = await FoodAndMedicine.findById(item.product);
            if (product) {
              productPrice = product.price || 0;
              item.productType = 'Food&MedicineModel';
              console.log(`  ✅ Found in Food&Medicine: ${product.productName} - Price: Rs. ${productPrice}`);
            } else {
              product = await fish.findById(item.product);
              if (product) {
                productPrice = product.PricePerCouple || 0;
                item.productType = 'Fish';
                console.log(`  ✅ Found in Fish: ${product.Species} - Price: Rs. ${productPrice}`);
              } else {
                product = await accessory.findById(item.product);
                if (product) {
                  productPrice = product.price || 0;
                  item.productType = 'Accessory';
                  console.log(`  ✅ Found in Accessory: ${product.product} - Price: Rs. ${productPrice}`);
                }
              }
            }
          }

          if (productPrice > 0) {
            item.price = productPrice;
            orderModified = true;
            console.log(`  ✅ Updated item price to Rs. ${productPrice}`);
          } else {
            console.log(`  ❌ Could not find product or price is 0`);
          }
        } else {
          console.log(`  ✅ Item already has price: Rs. ${item.price}`);
        }
      }

      if (orderModified) {
        await order.save();
        fixedCount++;
        console.log(`  ✅ Order ${order._id} updated and saved`);
      } else {
        alreadyOkCount++;
        console.log(`  ℹ️  Order ${order._id} already has prices`);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 SUMMARY:");
    console.log(`  Total Orders: ${orders.length}`);
    console.log(`  Fixed Orders: ${fixedCount}`);
    console.log(`  Already OK: ${alreadyOkCount}`);
    console.log("=".repeat(60));

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
  }
}

// Run the script
fixOrderPrices();
