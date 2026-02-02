const Review = require("../../Model/OrderDetails/ReviewModel");
const Order = require("../../Model/OrderDetails/orderDetailsModel");
const FoodAndMedicine = require("../../Model/Food&Medicine/Food&MedicineModel");
const Fish = require("../../Model/fish/fish");
const Accessory = require("../../Model/Tank/Accessories/AccessoriesModel");

// ========================
// CREATE REVIEW
// ========================
exports.createReview = async (req, res) => {
  try {
    console.log("📝 Creating product review");
    
    const {
      orderId,
      productId,
      productType,
      customerName,
      customerEmail,
      rating,
      title,
      comment,
    } = req.body;

    // Verify order exists and is delivered
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Only allow reviews for delivered orders
    if (order.status !== "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Reviews can only be submitted for delivered orders",
      });
    }

    // Verify product is in the order
    const productInOrder = order.items.find(
      item => item.product.toString() === productId && item.productType === productType
    );

    if (!productInOrder) {
      return res.status(400).json({
        success: false,
        message: "Product not found in this order",
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      order: orderId,
      product: productId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    // Handle uploaded images
    const images = req.files ? req.files.map(file => file.filename) : [];

    const review = new Review({
      order: orderId,
      product: productId,
      productType,
      customerName,
      customerEmail,
      rating,
      title,
      comment,
      images,
      verified: true, // Verified purchase
    });

    await review.save();

    // Update product average rating
    await updateProductRating(productId, productType);

    console.log("✅ Review created:", review._id);

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review,
    });

  } catch (error) {
    console.error("❌ Create review error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create review",
      error: error.message,
    });
  }
};

// ========================
// GET REVIEWS FOR PRODUCT
// ========================
exports.getProductReviews = async (req, res) => {
  try {
    const { productId, productType } = req.params;
    const { status = "Approved", sortBy = "createdAt", order = "desc" } = req.query;

    const filter = {
      product: productId,
      productType,
    };

    if (status) {
      filter.status = status;
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === "desc" ? -1 : 1;

    const reviews = await Review.find(filter)
      .sort(sortOptions)
      .populate("order", "createdAt");

    // Calculate rating statistics
    const stats = await Review.aggregate([
      { $match: { product: mongoose.Types.ObjectId(productId), status: "Approved" } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          fiveStars: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
          fourStars: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
          threeStars: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
          twoStars: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
          oneStar: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
        },
      },
    ]);

    res.json({
      success: true,
      count: reviews.length,
      reviews,
      statistics: stats.length > 0 ? stats[0] : {
        averageRating: 0,
        totalReviews: 0,
        fiveStars: 0,
        fourStars: 0,
        threeStars: 0,
        twoStars: 0,
        oneStar: 0,
      },
    });

  } catch (error) {
    console.error("❌ Get product reviews error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// GET CUSTOMER REVIEWS
// ========================
exports.getCustomerReviews = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const reviews = await Review.find({ customerEmail: email })
      .populate("order")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });

  } catch (error) {
    console.error("❌ Get customer reviews error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// GET ALL REVIEWS (Admin)
// ========================
exports.getAllReviews = async (req, res) => {
  try {
    const { status, rating } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (rating) filter.rating = Number(rating);

    const reviews = await Review.find(filter)
      .populate("order")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });

  } catch (error) {
    console.error("❌ Get all reviews error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// UPDATE REVIEW STATUS (Admin)
// ========================
exports.updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    review.status = status;

    if (adminResponse) {
      review.adminResponse = {
        message: adminResponse,
        respondedBy: req.body.respondedBy || "Admin",
        respondedAt: new Date(),
      };
    }

    await review.save();

    console.log(`✅ Review ${id} updated to ${status}`);

    res.json({
      success: true,
      message: "Review updated successfully",
      review,
    });

  } catch (error) {
    console.error("❌ Update review error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// MARK REVIEW AS HELPFUL
// ========================
exports.markReviewHelpful = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndUpdate(
      id,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.json({
      success: true,
      message: "Marked as helpful",
      helpfulCount: review.helpfulCount,
    });

  } catch (error) {
    console.error("❌ Mark helpful error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// DELETE REVIEW
// ========================
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Update product rating after deletion
    await updateProductRating(review.product, review.productType);

    res.json({
      success: true,
      message: "Review deleted successfully",
    });

  } catch (error) {
    console.error("❌ Delete review error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// HELPER: Update Product Average Rating
// ========================
async function updateProductRating(productId, productType) {
  try {
    const reviews = await Review.find({
      product: productId,
      status: "Approved",
    });

    if (reviews.length === 0) {
      // No reviews, reset rating
      const ProductModel = getProductModel(productType);
      await ProductModel.findByIdAndUpdate(productId, {
        averageRating: 0,
        reviewCount: 0,
      });
      return;
    }

    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    
    const ProductModel = getProductModel(productType);
    await ProductModel.findByIdAndUpdate(productId, {
      averageRating: averageRating.toFixed(1),
      reviewCount: reviews.length,
    });

    console.log(`✅ Updated rating for ${productType} ${productId}: ${averageRating.toFixed(1)}`);

  } catch (error) {
    console.error("⚠️ Failed to update product rating:", error.message);
  }
}

// Helper to get correct product model
function getProductModel(productType) {
  switch (productType) {
    case "Food&MedicineModel":
      return FoodAndMedicine;
    case "Fish":
      return Fish;
    case "Accessory":
      return Accessory;
    default:
      throw new Error("Invalid product type");
  }
}
