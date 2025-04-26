const mongoose = require("mongoose");
const Order = require('../models/Order');
const Restaurant = require('../../restaurant_management_service/models/Restaurant');
const MenuItem = require('../../restaurant_management_service/models/MenuItem');

 
//place a order
exports.placeOrder = async (req, res) => {
  try {
      console.log("Received order data:", req.body); // Debugging

      const {  itemId,quantity, totalPrice } = req.body;
      if ( !itemId || !quantity || !totalPrice) {
          return res.status(400).json({ error: "Invalid order data" });
      }

      const customerId = req.user?.id; // Ensure req.user exists
      if (!customerId) {
          return res.status(401).json({ error: "Unauthorized - No customer ID" });
      }

      const order = new Order({
          customerId,
          itemId,
          quantity,
          totalPrice,
          status: "Pending",
      });

      await order.save();
      res.status(201).json(order);
  } catch (error) {
      console.error("Error placing order:", error); // Log full error
      res.status(500).json({ error: "Error placing order" });
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

    // Fetch orders associated with this customer
    const orders = await Order.find({ customerId });

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
    
    // Fetch orders associated with this restaurant
    const orders = await Order.find({ restaurantId });
    
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
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
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

