const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../../Model/Admin/User.js");
const requireAuth = require("../../middlewares/auth.middleware.js");
const router = express.Router();

// Passport strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            user = await User.findOne({ email: profile.emails[0].value });
            if (user) {
                user.googleId = profile.id;
                await user.save();
            }else{
                return done(null, false, { message: "No account found with this Google email." });
            }
        }

        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});


// Routes
router.get("/", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/login", // redirect if login fails
    failureMessage: true
  }),
  async (req, res) => {
    // Successful login, issue your JWT token (similar to email login)
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({
      userId: req.user._id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      displayPicture: req.user.displayPicture,
    }, process.env.JWT_SECRET, { expiresIn: "24h" });

    // Optionally, store in cookie
    res.cookie("token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    switch (req.user.role) {
      case "admin":
        res.redirect(`http://localhost:3000/admin`);
        break;
        case "employee":
            res.redirect(`http://localhost:3000/EmployeeLoginPortal`);
            break;
        case "customer":
            res.redirect(`http://localhost:3000/`);
            break;
      default:
        res.redirect(`http://localhost:3000/login`);
    }
  }
);

router.get("/check-google/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.googleId) {
      return res.status(200).json({ success: true, linked: true, message: "Google account is linked" });
    } else {
      return res.status(200).json({ success: true, linked: false, message: "No Google account linked" });
    }
  } catch (err) {
    console.error("Error checking Google account:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/unlink-google/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.googleId) {
      return res.status(400).json({ success: false, message: "No Google account linked" });
    }

    // Remove googleId
    user.googleId = undefined; // or null
    await user.save();

    return res.redirect(`http://localhost:3000/profile/${userId}`); 
  } catch (err) {
    console.error("Error unlinking Google account:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;


