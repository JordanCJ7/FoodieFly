const express = require('express');
const { addMenuItem, updateMenuItem, deleteMenuItem, getMenuItemsWithRestaurantName, getMenuItemsForUser, getMenuItemById } = require('../controllers/menuItemController');
const { verifyToken, verifyRole, verifyRestaurantStatus } = require('../middleware/authMiddleware');

const router = express.Router();

// Add a new menu item
router.post(
  '/add-menu-item', verifyToken, verifyRole(['restaurantAdmin']), verifyRestaurantStatus, addMenuItem
);

// Update a menu item
router.put(
  '/update/:id', verifyToken, verifyRole(['restaurantAdmin']), verifyRestaurantStatus, updateMenuItem
);

// Delete a menu item
router.delete(
  '/delete/:id', verifyToken, verifyRole(['restaurantAdmin']), verifyRestaurantStatus, deleteMenuItem
);

// Route to fetch menu items with restaurant name for the Home page
router.get('/home-menu-items', getMenuItemsWithRestaurantName);

// Route to fetch menu items for a specific user's restaurant
router.get('/user-menu-items', verifyToken, verifyRole(['restaurantAdmin']), getMenuItemsForUser);

// Route to fetch a single menu item by ID
router.get('/:id', verifyToken, verifyRole(['restaurantAdmin']), getMenuItemById);

module.exports = router;