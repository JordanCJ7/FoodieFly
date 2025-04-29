const mongoose = require("mongoose");
const Order = require('../models/Order');
const Restaurant = require('../../restaurant_management_service/models/Restaurant');
const MenuItem = require('../../restaurant_management_service/models/MenuItem');

//place a order
exports.placeOrder = async (req, res) => {
    try {
        console.log("Received order data:", req.body); // Debugging

        const { items, totalAmount, deliveryFee, restaurantName, restaurantId, paypalOrderId, payerName, paymentStatus } = req.body;
        
        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ 
                error: "Invalid order data. Required fields: items (array)" 
            });
        }

        // Validate restaurant ID
        if (!restaurantId && (!items[0]?.restaurant_id && !items[0]?.restaurantId)) {
            return res.status(400).json({ 
                error: "Restaurant ID is required" 
            });
        }

        const customerId = req.user?.id;
        if (!customerId) {
            return res.status(401).json({ error: "Unauthorized - No customer ID" });
        }

        // Create new order with multiple items
        const order = new Order({
            customerId,
            restaurantId: restaurantId || items[0]?.restaurant_id || items[0]?.restaurantId,
            restaurantName: restaurantName || items[0]?.restaurant_name || items[0]?.restaurantName || 'Unknown Restaurant',
            items: items.map(item => ({
                itemId: item.itemId,
                quantity: item.quantity,
                price: item.price,
                name: item.name,
                restaurant_id: item.restaurant_id || item.restaurantId
            })),
            totalAmount: totalAmount || items.reduce((total, item) => total + (item.price * item.quantity), 0),
            deliveryFee: deliveryFee || 200,
            status: "Pending",
            paypalOrderId,
            payerName,
            paymentStatus
        });

        console.log("Creating order with restaurant info:", JSON.stringify(order, null, 2)); // Debug log
        await order.save();
        console.log("Order saved successfully:", JSON.stringify(order, null, 2)); // Debug log

        res.status(201).json(order);
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ error: "Error placing order: " + error.message });
    }
};
/*example
{
  "restaurantId": "67e254ef9cfaba042d0d4e20",
  "itemId": "2444444444444444444444443",
  "quantity":2
  "totalPrice": 200
}
*/

// Get details of a specific order by its ID
exports.getOrder = async (req, res) => {
  try {
    // Find the order by its ID
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching order' });
  }
};

//get details of specific customer
exports.getOrdersForCustomer = async (req, res) => {
  try {
    const customerId = req.user?.id; // Ensure req.user exists
    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized - No customer ID" });
    }

    // Fetch orders associated with this customer, sorted by creation date (newest first)
    const orders = await Order.find({ customerId })
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .lean(); // Convert to plain JavaScript objects for better performance

    // If no orders found, return an empty array
    res.json(orders);
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    res.status(500).json({ error: "Error fetching customer orders" });
  }
};

// Get orders for a specific restaurant
exports.getOrdersForRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    // Validate restaurant ID
    if (!restaurantId) {
      return res.status(400).json({ error: "Restaurant ID is required" });
    }
    
    // Fetch orders associated with this restaurant, excluding Ready and Cancelled orders
    const orders = await Order.find({ 
      restaurantId,
      status: { $nin: ['Ready', 'Cancelled'] } // Exclude Ready and Cancelled orders
    });
    
    // If no orders found, return an empty array
    res.json(orders);
  } catch (error) {
    console.error("Error fetching restaurant orders:", error);
    res.status(500).json({ error: "Error fetching restaurant orders" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    // Validate order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Validate status transition
    const validTransitions = {
      'Delivered': ['Completed', 'Cancelled'],
      'In Delivery': ['Delivered', 'Cancelled'],
      'Ready': ['In Delivery', 'Cancelled'],
      'Preparing': ['Ready', 'Cancelled'],
      'Accepted': ['Preparing', 'Cancelled'],
      'Pending': ['Accepted', 'Cancelled']
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status transition from ${order.status} to ${status}` 
      });
    }

    // Update the order status
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId, 
      { status }, 
      { new: true }
    );

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Error updating order status' });
  }
};

// Cancel an existing order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'Pending') return res.status(400).json({ error: 'Cannot cancel confirmed order' });
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error cancelling order' });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { itemId, quantity, totalPrice } = req.body;
    const { id } = req.params; // Order ID from request params

    // Find the order by ID
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Only allow updates if the order is still pending
    if (order.status !== "Pending") {
      return res.status(400).json({ error: "Cannot update a confirmed or completed order" });
    }

    // Create an object with only the fields that need updating
    const updatedFields = {};
    if (itemId !== undefined) updatedFields.itemId = itemId;
    if (quantity !== undefined) updatedFields.quantity = quantity;
    if (totalPrice !== undefined) updatedFields.totalPrice = totalPrice;

    // If no fields are provided, return an error
    if (Object.keys(updatedFields).length === 0) {
      return res.status(400).json({ error: "No fields provided for update" });
    }

    // Update order with the provided fields
    const updatedOrder = await Order.findByIdAndUpdate(id, updatedFields, { new: true });

    res.json({ message: "Order updated successfully", order: updatedOrder });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Error updating order" });
  }
};

// Get order history for a specific restaurant (Ready and Cancelled orders)
exports.getRestaurantOrderHistory = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    // Validate restaurant ID
    if (!restaurantId) {
      return res.status(400).json({ error: "Restaurant ID is required" });
    }
    
    // Fetch orders that are either Ready or Cancelled
    const orders = await Order.find({ 
      restaurantId,
      status: { $in: ['Ready', 'Cancelled'] }
    }).sort({ updatedAt: -1 }); // Sort by most recent first
    
    // If no orders found, return an empty array
    res.json(orders);
  } catch (error) {
    console.error("Error fetching restaurant order history:", error);
    res.status(500).json({ error: "Error fetching restaurant order history" });
  }
};

// Get all orders in Ready state
exports.getReadyOrders = async (req, res) => {
  try {
    console.log('Fetching ready orders...');
    
    // Fetch orders that are in Ready state
    const orders = await Order.find({ 
      status: 'Ready'
    })
    .lean() // Convert to plain JavaScript objects
    .sort({ updatedAt: -1 }); // Most recent first
    
    console.log(`Found ${orders.length} ready orders`);
    
    // Since we can't directly populate from a different service,
    // we'll return the orders without customer details for now
    const transformedOrders = orders.map(order => ({
      ...order,
      customerId: {
        first_name: 'Customer',
        last_name: `#${order.customerId.toString().slice(-4)}` // Last 4 chars of customer ID
      }
    }));
    
    res.json(transformedOrders);
  } catch (error) {
    console.error("Error in getReadyOrders:", error);
    res.status(500).json({ 
      error: "Error fetching ready orders",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all orders in Accepted state for a delivery person
exports.getAcceptedOrders = async (req, res) => {
  try {
    console.log('Fetching accepted and in-delivery orders...');
    
    // Fetch orders that are in Accepted or In Delivery state
    const orders = await Order.find({ 
      status: { $in: ['Accepted', 'In Delivery'] }
    })
    .lean()
    .sort({ updatedAt: -1 }); // Most recent first
    
    console.log(`Found ${orders.length} orders`);
    
    // Transform the response to include simplified customer details
    const transformedOrders = orders.map(order => ({
      ...order,
      customerId: {
        first_name: 'Customer',
        last_name: `#${order.customerId.toString().slice(-4)}` // Last 4 chars of customer ID
      }
    }));
    
    res.json(transformedOrders);
  } catch (error) {
    console.error("Error in getAcceptedOrders:", error);
    res.status(500).json({ 
      error: "Error fetching accepted orders",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = {
  placeOrder: exports.placeOrder,
  getOrder: exports.getOrder,
  getOrdersForRestaurant: exports.getOrdersForRestaurant,
  updateOrderStatus: exports.updateOrderStatus,
  cancelOrder: exports.cancelOrder,
  getOrdersForCustomer: exports.getOrdersForCustomer,
  updateOrder: exports.updateOrder,
  getRestaurantOrderHistory: exports.getRestaurantOrderHistory,
  getReadyOrders: exports.getReadyOrders,
  getAcceptedOrders: exports.getAcceptedOrders
};

