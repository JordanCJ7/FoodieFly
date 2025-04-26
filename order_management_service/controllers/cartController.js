const Cart = require('../models/cart');
const mongoose = require("mongoose");


// Add to Cart
exports.addToCart = async (req, res) => {
  const { itemId, name, price, img } = req.body;
  const userId = req.user.id;

  // Debugging the received data
  console.log("Received in addToCart:", { itemId, name, price, img });

  if (!itemId) {
    return res.status(400).json({ error: "Item ID is required" });
  }

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find(item => item.itemId.toString() === itemId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({ itemId, name, price, img, quantity: 1 });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ error: "Failed to add to cart" });
  }
};

// Get Cart
// controllers/cartController.js
exports.getUserCart = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT token

    const cart = await Cart.findOne({ userId });

    if (!cart || !cart.items) {
      return res.json({ items: [] });
    }

    res.json({ items: cart.items });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// Update quantity
// Update item quantity in the cart
exports.updateQuantity = async (req, res) => {
  const { itemId, quantity } = req.body; // Receive item ID and the quantity to update
  console.log(req.user);
  const userId = req.user?.id || req.user?._id;
if (!userId) {
  return res.status(401).json({ error: "Unauthorized: User ID missing" });
}


  if (quantity <= 0) {
    return res.status(400).json({ error: "Quantity must be greater than 0" });
  }

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const item = cart.items.find(item => item._id.toString() === itemId);

    if (!item) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    // Update quantity
    item.quantity = quantity;

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error("Error updating quantity:", err);
    res.status(500).json({ error: "Failed to update quantity" });
  }
};



// Delete item
// Remove item from user's cart
exports.removeFromCart = async (req, res) => {
  const { id: itemId } = req.params; // renamed to match router
  const userId = req.user.id;

  try {
    const result = await Cart.updateOne(
      { userId },
      { $pull: { items: { _id: new mongoose.Types.ObjectId(itemId) } } }
    );

    console.log("Remove result:", result);

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    res.status(200).json({ message: "Item removed successfully" });
  } catch (err) {
    console.error("Failed to remove item:", err);
    res.status(500).json({ error: "Failed to remove item" });
  }
};


