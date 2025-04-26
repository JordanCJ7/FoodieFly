const express = require('express');
const {
  createDelivery,
  getLiveTracking,
  markFoodReady,
} = require('../controllers/deliveryController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Route to create a delivery when user fills the delivery form
router.post('/create', verifyToken, createDelivery);

// Route to track the delivery (live tracking)
router.get('/:deliveryId/track', verifyToken, getLiveTracking);

// Route for restaurant admin to mark food as ready for delivery
router.put('/mark-food-ready', verifyToken, verifyRole(['restaurantAdmin']), markFoodReady);

module.exports = router;