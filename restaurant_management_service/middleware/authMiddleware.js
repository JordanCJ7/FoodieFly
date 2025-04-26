const jwt = require('jsonwebtoken');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

require('dotenv').config();

// Middleware to verify JWT token
exports.verifyToken = (req, res, next) => {
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
exports.verifyRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

// Middleware to check if the restaurant is verified
exports.verifyRestaurantStatus = async (req, res, next) => {
  try {
    let restaurantId;

    // If restaurantId is provided in the request body
    if (req.body.restaurantId) {
      restaurantId = req.body.restaurantId;
    } else if (req.params.id) {
      // Extract restaurantId from the MenuItem document (only for update/delete routes)
      const menuItem = await MenuItem.findById(req.params.id);
      if (!menuItem) {
        return res.status(404).json({ error: 'Menu item not found' });
      }
      restaurantId = menuItem.restaurantId;
    } else {
      return res.status(400).json({ error: 'restaurantId is required in the request body' });
    }

    // Find the restaurant and check if it is verified
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    if (!restaurant.isVerified) {
      return res.status(403).json({ error: 'Restaurant is not verified. Please contact the System Admin.' });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};