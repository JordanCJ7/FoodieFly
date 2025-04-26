const express = require('express');
const {
  getAvailableDeliveries,
  acceptDelivery,
  declineDelivery,
  updateDriverLocation,
} = require('../controllers/driverController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Route to get available deliveries (status: 'pending')
router.get('/available', verifyToken, verifyRole(['deliveryPersonnel']), getAvailableDeliveries);

// Route to accept a delivery
router.put('/accept', verifyToken, verifyRole(['deliveryPersonnel']), acceptDelivery);

// Route to decline a delivery
router.put('/decline', verifyToken, verifyRole(['deliveryPersonnel']), declineDelivery);

// Route to update the driver's location during delivery
router.put('/update-location', verifyToken, verifyRole(['deliveryPersonnel']), updateDriverLocation);

module.exports = router;
