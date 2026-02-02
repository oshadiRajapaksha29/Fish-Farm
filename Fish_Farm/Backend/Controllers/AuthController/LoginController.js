// controllers/Login.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../../Model/Admin/User.js");
const LoginHistory = require("../../Model/Admin/LoginModel.js");
const getIpLocation = require("../AuthController/IpLocation.js");

const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket?.remoteAddress ||
      req.ip;

    const location = await getIpLocation(ip);

    if (!user) {
      await LoginHistory.create({
        email,
        ipAddress: ip,
        location,
        userAgent: req.headers["user-agent"],
        status: "Failed",
      });
      return res.status(400).json({ message: "Email not found" });
    }

    if (user.status === false) {
      return res
        .status(403)
        .json({ message: "Your account is deactivated. Please contact support." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await LoginHistory.create({
        user: user._id,
        email: user.email,
        ipAddress: ip,
        location,
        userAgent: req.headers["user-agent"],
        status: "Failed",
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        displayPicture: user.displayPicture,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const secure = process.env.NODE_ENV === "production";
    const sameSite = process.env.SAMESITE || "Lax";

    res.cookie("token", token, {
      httpOnly: false,
      secure,
      sameSite,
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // ✅ Record successful login
    await LoginHistory.create({
      user: user._id,
      email: user.email,
      ipAddress: ip,
      location,
      userAgent: req.headers["user-agent"],
      status: "Success",
    });

    return res.status(200).json({ message: "Login successful", role: user.role });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

module.exports = Login;
