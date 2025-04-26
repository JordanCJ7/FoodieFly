const jwt = require('jsonwebtoken');
require('dotenv').config();



// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token is missing.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data to the request object
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

// Middleware to check user role
const verifyRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

// Middleware to check if the user is a restaurant owner
const isRestaurantOwner = (req, res, next) => {
  try {
      // Ensure Authorization header exists
      const token = req.header("Authorization")?.split(" ")[1];
      if (!token) {
          return res.status(401).json({ error: "Access Denied - No Token Provided" });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attach user to request

      // Ensure user has restaurantId
      if (!req.user.restaurantId) {
          return res.status(403).json({ error: "Unauthorized - You must be a restaurant owner" });
      }

      next(); // Proceed to the controller
  } catch (error) {
      return res.status(401).json({ error: "Invalid or Expired Token" });
  }
};


module.exports = {
  verifyToken,
  verifyRole,
  isRestaurantOwner
};