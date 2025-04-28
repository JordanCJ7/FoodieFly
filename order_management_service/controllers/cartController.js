const Cart = require('../models/cart');
const mongoose = require("mongoose");


// Add to Cart
exports.addToCart = async (req, res) => {
  console.log("Request body:", req.body);
  console.log("User from token:", req.user);

  const { itemId, name, price, quantity = 1, img, restaurant_id, restaurant_name } = req.body;
  const userId = req.user?.id || req.user?._id;

  // Validate required fields
  if (!itemId || !name || !price) {
    return res.status(400).json({ 
      error: "Missing required fields",
      required: ["itemId", "name", "price"],
      received: { itemId, name, price }
    });
  }

  // Validate userId
  if (!userId) {
    return res.status(401).json({ error: "User ID not found in token" });
  }

  try {
    // Validate itemId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ 
        error: "Invalid item ID format",
        received: itemId
      });
    }

    let cart = await Cart.findOne({ userId });
    console.log("Found cart:", cart);

    if (!cart) {
      cart = new Cart({ userId, items: [] });
      console.log("Created new cart:", cart);
    }

    // Convert itemId to ObjectId
    const itemObjectId = new mongoose.Types.ObjectId(itemId);
    const restaurantObjectId = restaurant_id && mongoose.Types.ObjectId.isValid(restaurant_id) 
      ? new mongoose.Types.ObjectId(restaurant_id) 
      : null;

    // Find existing item using ObjectId comparison
    const existingItem = cart.items.find(item => 
      item.itemId.equals(itemObjectId)
    );

    if (existingItem) {
      console.log("Updating existing item quantity from", existingItem.quantity, "to", existingItem.quantity + quantity);
      existingItem.quantity += quantity;
    } else {
      console.log("Adding new item to cart:", { 
        itemId: itemObjectId, 
        name, 
        price, 
        quantity,
        restaurant_id: restaurantObjectId,
        restaurant_name 
      });
      cart.items.push({ 
        itemId: itemObjectId,
        name, 
        price, 
        img, 
        quantity,
        restaurant_id: restaurantObjectId,
        restaurant_name
      });
    }

    const savedCart = await cart.save();
    console.log("Saved cart:", savedCart);
    res.status(200).json(savedCart);
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ 
      error: "Failed to add to cart",
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Get Cart
exports.getUserCart = async (req, res) => {
  console.log("Getting cart for user from token:", req.user);
  
  try {
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      console.log("No user ID found in token");
      return res.status(401).json({ error: "User ID not found in token" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("Invalid user ID format:", userId);
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    console.log("Looking for cart with userId:", userId);
    const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    console.log("Found cart:", JSON.stringify(cart, null, 2));

    if (!cart) {
      console.log("No cart found for user");
      return res.json({ items: [] });
    }

    if (!Array.isArray(cart.items)) {
      console.log("Cart items is not an array:", cart.items);
      return res.json({ items: [] });
    }

    // Process items to ensure consistent structure
    const processedItems = cart.items.map(item => {
      console.log("Processing cart item:", item);
      return {
        _id: item._id.toString(),
        itemId: item.itemId.toString(),
        name: item.name || '',
        price: parseFloat(item.price || 0),
        quantity: parseInt(item.quantity || 1),
        img: item.img || '',
        totalPrice: parseFloat(item.price || 0) * parseInt(item.quantity || 1),
        restaurant_id: item.restaurant_id ? item.restaurant_id.toString() : '',
        restaurant_name: item.restaurant_name || 'Unknown Restaurant'
      };
    });

    console.log("Sending processed items:", JSON.stringify(processedItems, null, 2));
    res.json({ items: processedItems });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ 
      error: "Failed to fetch cart",
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Clear Cart
exports.clearCart = async (req, res) => {
  console.log("Clearing cart for user from token:", req.user);
  
  try {
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ error: "User ID not found in token" });
    }

    console.log("Looking for cart with userId:", userId);
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      console.log("No cart found");
      return res.status(200).json({ message: "Cart already empty" });
    }

    // Clear the items array
    cart.items = [];
    await cart.save();
    
    console.log("Cart cleared successfully");
    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ 
      error: "Failed to clear cart",
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
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

// Remove multiple items from cart
exports.removeMultipleItems = async (req, res) => {
  const { itemIds } = req.body;
  const userId = req.user?.id || req.user?._id;

  if (!userId) {
    return res.status(401).json({ error: "User ID not found in token" });
  }

  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    return res.status(400).json({ error: "Invalid or empty itemIds array" });
  }

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Remove all items with matching IDs
    cart.items = cart.items.filter(item => !itemIds.includes(item._id.toString()));
    await cart.save();

    res.status(200).json({ message: "Items removed successfully", cart });
  } catch (err) {
    console.error("Error removing multiple items:", err);
    res.status(500).json({ 
      error: "Failed to remove items",
      details: err.message
    });
  }
};

module.exports = {
  addToCart,
  getUserCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  removeMultipleItems
};


