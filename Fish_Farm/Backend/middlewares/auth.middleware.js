// middleware/requireAuth.js
const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      const err = new Error('Missing authentication token');
      err.status = 401;
      return next(err);
    }

    if (!process.env.JWT_SECRET) {
      const err = new Error('JWT secret not configured');
      err.status = 500;
      return next(err);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId, email, name, role, displayPicture } = decoded;
    req.user = { userId, email, name, role, displayPicture }; // attach to request

    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      err.status = 401;
      err.message = 'Token expired';
    } else if (err.name === 'JsonWebTokenError') {
      err.status = 401;
      err.message = 'Invalid token';
    } else {
      err.status = err.status || 500;
    }
    return next(err);
  }
}

module.exports = requireAuth;
