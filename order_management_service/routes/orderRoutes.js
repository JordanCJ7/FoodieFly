const express = require('express');
const { placeOrder, getOrder, getOrdersForRestaurant, updateOrderStatus, cancelOrder, getOrdersForCustomer, updateOrder, getRestaurantOrderHistory, getReadyOrders } = require('../controllers/orderController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const router = express.Router();

// Delivery Personnel Routes
router.get('/ready', verifyToken, verifyRole(['deliveryPersonnel']), getReadyOrders);

// Customer Order Routes
router.post('/add',verifyToken,verifyRole(['customer']), placeOrder);//checked
router.get('/:id', verifyToken, verifyRole(['customer', 'restaurantAdmin', 'deliveryPersonnel']), getOrder);//checked
router.delete('/:id', verifyToken, verifyRole(['customer']), cancelOrder);//checked
router.get('/customer/orders', verifyToken, verifyRole(['customer']), getOrdersForCustomer); // Get all orders for a customer
router.put("/:id/update", verifyToken,verifyRole(['customer']), updateOrder);

// Restaurant Admin Routes
router.get('/restaurant/:restaurantId', verifyToken , verifyRole(['restaurantAdmin']), getOrdersForRestaurant);
router.get('/restaurant/:restaurantId/history', verifyToken, verifyRole(['restaurantAdmin']), getRestaurantOrderHistory);
router.put('/:id/status', verifyToken, verifyRole(['restaurantAdmin', 'deliveryPersonnel']), updateOrderStatus);//checked

module.exports = router;
