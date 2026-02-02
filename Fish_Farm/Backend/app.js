// app.js (Final Merged & Optimized - Combined Group + Teammate)

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const passport = require("passport");
const session = require("express-session");

// Load environment variables
dotenv.config();

const app = express();

// ------------------- Middleware -------------------
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

// Session & Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || "yourSecretKey",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Serve static files (uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ------------------- Route Imports -------------------

// Tank & Accessories
const TankRoutesNew = require("./Routes/Tank/NewTank/TankRoutes");
const accessoriesRoutes = require("./Routes/Tank/Accessories/AccessoriesRoutes");

// Food & Medicine
const foodAndMedicineRoutes = require("./Routes/Food&Medicine/Food&MedicineRoutes");
const medicineRoutes = require("./Routes/medicine/medicineRoutes.js");
const mortalityRoutes = require("./Routes/mortality/mortalityRoutes.js");

// Orders & E-commerce
const orderDetailsRoutes = require("./Routes/OrderDetails/orderDetailsRoute");
const invoiceRoutes = require("./Routes/OrderDetails/invoiceRoutes");
const emailRoutes = require("./Routes/OrderDetails/emailRoutes");
const returnRequestRoutes = require("./Routes/OrderDetails/returnRequestRoutes");
const reviewRoutes = require("./Routes/OrderDetails/reviewRoutes");
const wishlistRoutes = require("./Routes/OrderDetails/wishlistRoutes");
const orderExportRoutes = require("./Routes/OrderDetails/orderExportRoutes");

// Fish
const fishRoutes = require("./Routes/fish/fish");

// Auth & Admin
const authRoutes = require("./Routes/AuthRoutes/AuthRoute.js");
const AdminRoutes = require("./Routes/Admin/Admin.js");
const GoogleRoutes = require("./Routes/Admin/GoogleCallBack.js");

// Employee & Inventory
const EmployeeTaskRoutes = require("./Routes/EmployeeTask/Taskroutes");
const Inventoryroutes = require("./Routes/Inventory/Inventoryroutes.js");
const employeeExtraRoutes = require("./Routes/EmployeeTask/EmployeeExtraRoutes"); // ✅ From group version

// Health Modules
const diseaseReportRoutes = require("./Routes/diseaseReport/diseaseReportRoutes");
const diseaseEmailRoute = require("./Routes/diseaseReport/diseaseEmailRoute.js"); // ✅ Email alerts
const vetReplyRoutes = require("./Routes/diseaseReport/vetReplies.js"); // ✅ Vet Replies

// Breeding Module (✅ from group version)
const breedingRoutes = require("./Routes/Breeding/BreedingRoutes");
const babyRoutes = require("./Routes/Breeding/BabyRoutes");

// AI Chatbot
const aiRoutes = require("./Routes/ai/ai.js"); // ✅ from group version
const chatbotRoutes = require("./Routes/AI/chatbotRoutes.js");

// Notifications
const notificationRoutes = require("./Routes/Notification/NotificationRoutes");

// Middleware
const requireAuth = require("./middlewares/auth.middleware.js");

// Email Utility (optional testing)
const sendEmail = require("./utils/sendEmail");

// ------------------- API Routes -------------------

// Tank & Accessories
app.use("/tanksNew", TankRoutesNew);
app.use("/accessories", accessoriesRoutes);

// Food & Medicine
app.use("/foodAndMedicine", foodAndMedicineRoutes);
app.use("/medicine", medicineRoutes);
app.use("/mortality", mortalityRoutes);

// Orders & E-commerce
app.use("/orderDetails", orderDetailsRoutes);
app.use("/invoice", invoiceRoutes);
app.use("/email", emailRoutes);
app.use("/returns", returnRequestRoutes);
app.use("/reviews", reviewRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/order-export", orderExportRoutes);

// Fish
app.use("/fish", fishRoutes);

// Auth & Admin
app.use("/api/auth", authRoutes);
app.use("/auth/google", GoogleRoutes);
app.use("/admin", AdminRoutes);

// Employee & Inventory
app.use("/Tasks", EmployeeTaskRoutes);
app.use("/Inventory", Inventoryroutes);
app.use("/employee-extra", employeeExtraRoutes); // ✅ from group version

// Health Modules
app.use("/diseaseReports", diseaseReportRoutes);
app.use("/api/email", diseaseEmailRoute);   // ✅ disease email alerts
app.use("/api/vetReplies", vetReplyRoutes); // ✅ vet replies

// Breeding Module
app.use("/breeding", breedingRoutes);
app.use("/babies", babyRoutes);

// AI Chatbot
app.use("/api/ai", aiRoutes);
app.use("/api/chatbot", chatbotRoutes);

// Notifications
app.use("/api/notifications", notificationRoutes);

// ------------------- Auth Helpers -------------------

// Check authentication
app.use("/api/check-auth", requireAuth, (req, res) =>
  res.status(200).json({
    success: true,
    message: "Authenticated",
    user: req.user,
  })
);

// Logout
app.use("/api/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// ------------------- MongoDB connection -------------------
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://Aqua-peak-Project:Aqua-peak-Member5@aqua-peak.oo1kfwc.mongodb.net/fishfarm";

const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });

module.exports = app;
