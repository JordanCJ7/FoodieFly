const mongoose = require('mongoose');
const User = require('../../user_authentication_service/models/User');
const Restaurant = require('../../restaurant_management_service/models/Restaurant');
const Order = require('../../order_management_service/models/Order');
const Delivery = require('../models/Delivery');


// Create a new delivery entry when the user fills out the delivery form
exports.createDelivery = async (req, res) => {
  const {
    orderId,
    deliveryAddress,
    receiverName,
    // paymentId,
    estimatedDeliveryTime,
    distance
  } = req.body;

  const customerId = req.user.id; // Assumes the user is authenticated

  try {
    // if (!mongoose.Types.ObjectId.isValid(orderId)) {
    //   return res.status(400).json({ error: 'Invalid orderId format' });
    // }
    // // Validate the order
    // const order = await Order.findById(orderId)
    // .select('itemId totalPrice quantity customerId')
    // .populate('customerId', 'name'); 
    // if (!order) return res.status(404).json({ error: 'Order not found' });

    // const itemIds = order.itemId && Array.isArray(order.itemId) ? order.itemId.map(item => item._id) : [];
    // const totalPrice = order.totalPrice;
    // const quantity = order.quantity;
    // const customerName = order.customerId.name;
    // Create new Delivery
    const newDelivery = new Delivery({
      customerId,
      deliveryAddress,
      receiverName: receiverName, // || customerName,
      orderId,
      // itemIds,
      // totalPrice,
      // quantity,
      estimatedDeliveryTime,
      distance,
      deliveryStatus: 'pending', // Initial status
      driverLocation: { lat: null, lng: null } // Initial driver location
    });

    await newDelivery.save();
    res.status(201).json({ message: 'Delivery created successfully', delivery: newDelivery });

  } catch (err) {
    res.status(500).json({ error: 'Error creating delivery', details: err.message });
  }
};

// Get live tracking info for the customer (delivery status & driver location)
exports.getLiveTracking = async (req, res) => {
  const { deliveryId } = req.params;

  try {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) return res.status(404).json({ error: 'Delivery not found' });

    res.json({
      status: delivery.deliveryStatus,
      driverLocation: delivery.driverLocation,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching live tracking', details: err.message });
  }
};

// Mark food as ready for delivery (restaurant admin updates)
exports.markFoodReady = async (req, res) => {
  const { deliveryId } = req.body;

  try {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) return res.status(404).json({ error: 'Delivery not found' });

    delivery.deliveryStatus = 'picked-up'; // Update status
    await delivery.save();

    res.status(200).json({ message: 'Food is ready and picked up for delivery', delivery });
  } catch (err) {
    res.status(500).json({ error: 'Error marking food as ready', details: err.message });
  }
};
