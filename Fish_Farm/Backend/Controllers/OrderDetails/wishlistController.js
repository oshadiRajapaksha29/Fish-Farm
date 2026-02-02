const Wishlist = require("../../Model/OrderDetails/WishlistModel");
const FoodAndMedicine = require("../../Model/Food&Medicine/Food&MedicineModel");
const Fish = require("../../Model/fish/fish");
const Accessory = require("../../Model/Tank/Accessories/AccessoriesModel");

// ========================
// GET OR CREATE WISHLIST
// ========================
exports.getWishlist = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    let wishlist = await Wishlist.findOne({ customerEmail: email });

    // Create wishlist if doesn't exist
    if (!wishlist) {
      wishlist = new Wishlist({
        customerEmail: email,
        items: [],
      });
      await wishlist.save();
    }

    // Populate product details
    const populatedWishlist = await populateWishlistProducts(wishlist);

    res.json({
      success: true,
      wishlist: populatedWishlist,
    });

  } catch (error) {
    console.error("❌ Get wishlist error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// ADD ITEM TO WISHLIST
// ========================
exports.addToWishlist = async (req, res) => {
  try {
    const { email, productId, productType, desiredQuantity } = req.body;
    
    if (!email || !productId || !productType) {
      return res.status(400).json({
        success: false,
        message: "Email, productId, and productType are required",
      });
    }

    // Verify product exists
    const product = await getProduct(productId, productType);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let wishlist = await Wishlist.findOne({ customerEmail: email });

    // Create wishlist if doesn't exist
    if (!wishlist) {
      wishlist = new Wishlist({
        customerEmail: email,
        items: [],
      });
    }

    // Check if item already in wishlist
    const existingItem = wishlist.items.find(
      item => item.product.toString() === productId && item.productType === productType
    );

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "Item already in wishlist",
      });
    }

    // Add item to wishlist
    wishlist.items.push({
      product: productId,
      productType,
      desiredQuantity: desiredQuantity || 1,
      priceWhenAdded: product.price || product.Price,
      addedAt: new Date(),
    });

    await wishlist.save();

    console.log(`✅ Added ${productType} ${productId} to wishlist for ${email}`);

    // Return populated wishlist
    const populatedWishlist = await populateWishlistProducts(wishlist);

    res.json({
      success: true,
      message: "Item added to wishlist",
      wishlist: populatedWishlist,
    });

  } catch (error) {
    console.error("❌ Add to wishlist error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// REMOVE ITEM FROM WISHLIST
// ========================
exports.removeFromWishlist = async (req, res) => {
  try {
    const { email, productId, productType } = req.body;
    
    if (!email || !productId || !productType) {
      return res.status(400).json({
        success: false,
        message: "Email, productId, and productType are required",
      });
    }

    const wishlist = await Wishlist.findOne({ customerEmail: email });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    // Remove item from wishlist
    wishlist.items = wishlist.items.filter(
      item => !(item.product.toString() === productId && item.productType === productType)
    );

    await wishlist.save();

    console.log(`✅ Removed ${productType} ${productId} from wishlist for ${email}`);

    // Return populated wishlist
    const populatedWishlist = await populateWishlistProducts(wishlist);

    res.json({
      success: true,
      message: "Item removed from wishlist",
      wishlist: populatedWishlist,
    });

  } catch (error) {
    console.error("❌ Remove from wishlist error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// CLEAR WISHLIST
// ========================
exports.clearWishlist = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const wishlist = await Wishlist.findOne({ customerEmail: email });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    wishlist.items = [];
    await wishlist.save();

    console.log(`✅ Cleared wishlist for ${email}`);

    res.json({
      success: true,
      message: "Wishlist cleared",
      wishlist,
    });

  } catch (error) {
    console.error("❌ Clear wishlist error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// UPDATE WISHLIST ITEM QUANTITY
// ========================
exports.updateWishlistItem = async (req, res) => {
  try {
    const { email, productId, productType, desiredQuantity } = req.body;
    
    if (!email || !productId || !productType || !desiredQuantity) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const wishlist = await Wishlist.findOne({ customerEmail: email });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    const item = wishlist.items.find(
      item => item.product.toString() === productId && item.productType === productType
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in wishlist",
      });
    }

    item.desiredQuantity = desiredQuantity;
    await wishlist.save();

    const populatedWishlist = await populateWishlistProducts(wishlist);

    res.json({
      success: true,
      message: "Wishlist item updated",
      wishlist: populatedWishlist,
    });

  } catch (error) {
    console.error("❌ Update wishlist item error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// HELPER FUNCTIONS
// ========================

// Get product from correct collection
async function getProduct(productId, productType) {
  try {
    let product;
    
    switch (productType) {
      case "Food&MedicineModel":
        product = await FoodAndMedicine.findById(productId);
        break;
      case "Fish":
        product = await Fish.findById(productId);
        break;
      case "Accessory":
        product = await Accessory.findById(productId);
        break;
      default:
        throw new Error("Invalid product type");
    }
    
    return product;
  } catch (error) {
    console.error("Error getting product:", error.message);
    return null;
  }
}

// Populate wishlist with product details
async function populateWishlistProducts(wishlist) {
  const populatedItems = await Promise.all(
    wishlist.items.map(async (item) => {
      const product = await getProduct(item.product.toString(), item.productType);
      
      return {
        _id: item._id,
        product: product || null,
        productId: item.product,
        productType: item.productType,
        desiredQuantity: item.desiredQuantity,
        priceWhenAdded: item.priceWhenAdded,
        currentPrice: product ? (product.price || product.Price) : null,
        inStock: product ? product.StockQuantity > 0 : false,
        addedAt: item.addedAt,
      };
    })
  );

  return {
    _id: wishlist._id,
    customerEmail: wishlist.customerEmail,
    items: populatedItems,
    itemCount: populatedItems.length,
    createdAt: wishlist.createdAt,
    updatedAt: wishlist.updatedAt,
  };
}
