const express = require('express');
const { placeOrder, getOrder, getOrdersForRestaurant, updateOrderStatus, cancelOrder,getOrdersForCustomer,updateOrder } = require('../controllers/orderController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const router = express.Router();

// Customer Order Routes
router.post('/add',verifyToken,verifyRole(['customer']), placeOrder);//checked
router.get('/:id', verifyToken, verifyRole(['customer', 'restaurantAdmin']), getOrder);//checked
router.delete('/:id', verifyToken, verifyRole(['customer']), cancelOrder);//checked
router.get('/customer/orders', verifyToken, verifyRole(['customer']), getOrdersForCustomer); // Get all orders for a customer
router.put("/:id/update", verifyToken,verifyRole(['customer']), updateOrder);

// Restaurant Admin Routes
router.get('/restaurant/:restaurantId', verifyToken , verifyRole(['restaurantAdmin']), getOrdersForRestaurant);
router.put('/:id/status', verifyToken, verifyRole(['restaurantAdmin']), updateOrderStatus);//checked

 


module.exports = router;
