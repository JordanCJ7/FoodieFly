const express = require('express');
const {registerRestaurant,updateRestaurant,deleteRestaurant,verifyRestaurant,getAllRestaurants,getRestaurantStatus,getRestaurantIdForUser} = require('../controllers/restaurantController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const { validateRestaurantRegistration } = require('../middleware/validationMiddleware');

const router = express.Router();

// Register a new restaurant 
router.post('/register-restaurant',verifyToken,verifyRole(['restaurantAdmin']),validateRestaurantRegistration,registerRestaurant);

// Update restaurant details 
router.put('/update/:id', verifyToken, verifyRole(['restaurantAdmin']), updateRestaurant);

// Delete a restaurant 
router.delete('/delete/:id', verifyToken, verifyRole(['systemAdmin']), deleteRestaurant);

// Verify a restaurant
router.put('/verify-restaurant/:id', verifyToken, verifyRole(['systemAdmin']), verifyRestaurant);

// Fetch all restaurants
router.get('/get', verifyToken, verifyRole(['systemAdmin']), getAllRestaurants);

// Get restaurant verification status
router.get('/status', verifyToken, getRestaurantStatus);

// Fetch the restaurant ID for the logged-in user
router.get('/get-restaurant-id', verifyToken, verifyRole(['restaurantAdmin']), getRestaurantIdForUser);

module.exports = router;