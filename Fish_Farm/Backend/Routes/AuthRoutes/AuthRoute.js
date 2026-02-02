const express = require('express');
const multer = require('multer');
const { registerUser, uploadMiddleware } = require('../../Controllers/AuthController/RegisterController.js');
const  Login  = require('../../Controllers/AuthController/LoginController.js');
const { FindUserById, filterUsers } = require('../../Controllers/Admin/UserData.js');

const router = express.Router();

const upload = multer({ dest: "/uploads" });
const uploadUpdate = multer({ dest: "/uploads" })

router.post('/register',uploadMiddleware, registerUser);
router.post('/login', Login);
router.get("/find/:id", FindUserById);
router.get("/user/q", filterUsers);

router.post('/logout', (req, res) => {
  const secure = process.env.NODE_ENV === 'production';
  const cookieDomain = process.env.COOKIE_DOMAIN || undefined; // e.g. '.example.com'
  const cookiePath = process.env.COOKIE_PATH || '/';

  // Collect all cookie names (plain + signed) and ensure 'token' is included
  const names = [
    ...new Set([
      ...(req.cookies ? Object.keys(req.cookies) : []),
      ...(req.signedCookies ? Object.keys(req.signedCookies) : []),
      'token',
    ]),
  ];

  // Clear each cookie. We try with domain (if configured) and without domain.
  for (const name of names) {
    // Primary attempt (matches most setups)
    res.clearCookie(name, {
      path: cookiePath,
      sameSite: 'lax',
      secure,
      ...(cookieDomain ? { domain: cookieDomain } : {}),
    });

    // Fallback (in case the cookie was set without a domain attribute)
    if (cookieDomain) {
      res.clearCookie(name, {
        path: cookiePath,
        sameSite: 'lax',
        secure,
      });
    }
  }

  return res.status(200).json({ success: true, message: 'Logged out' });
});


module.exports = router;