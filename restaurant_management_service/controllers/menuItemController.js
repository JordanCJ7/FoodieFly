const MenuItem = require("../models/MenuItem");
const cloudinary = require('../config/cloudinaryConfig');
const Restaurant = require('../models/Restaurant');

// Add a new menu item with an image
exports.addMenuItem = async (req, res) => {
  try {
    // Extract image data from the request body
    const { imageData } = req.body;

    // Validate that image data is provided
    if (!imageData) {
      return res.status(400).json({ error: 'Image data is required in the request body' });
    }

    // Upload the base64-encoded image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(imageData, {
      folder: 'menu-items', // Folder in Cloudinary to store images
      format: 'jpg', // Convert all images to JPG
      public_id: `${Date.now()}`, // Unique filename
    });

    // Create the menu item with the uploaded image URL
    const menuItemData = {
      ...req.body,
      image: uploadResponse.secure_url, // Store the image URL
    };

    // Remove the imageData from the request body before saving
    delete menuItemData.imageData;

    // Create the menu item
    const menuItem = await MenuItem.create(menuItemData);

    res.status(201).json({ message: 'Menu item added successfully', menuItem });
  } catch (err) {
    console.error("Error in addMenuItem:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Update a menu item
exports.updateMenuItem = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if an image is being updated
    const { imageData } = req.body;

    let updatedMenuItemData = { ...req.body };

    // Find the existing menu item
    const existingMenuItem = await MenuItem.findById(id);
    if (!existingMenuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    // If image data is provided, upload the new image to Cloudinary
    if (imageData) {
      // Upload the new image to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(imageData, {
        folder: 'menu-items', // Folder in Cloudinary to store images
        format: 'jpg', // Convert all images to JPG
        public_id: `${Date.now()}`, // Unique filename
      });

      // Store the new image URL
      updatedMenuItemData.image = uploadResponse.secure_url;

      // Remove the imageData from the request body before saving
      delete updatedMenuItemData.imageData;

      // Delete the old image from Cloudinary
      if (existingMenuItem.image) {
        // Extract the public_id from the old image URL
        const oldImagePublicId = existingMenuItem.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(oldImagePublicId);
      }
    }

    // Update the menu item
    const updatedMenuItem = await MenuItem.findByIdAndUpdate(id, updatedMenuItemData, { new: true });

    res.json({ message: 'Menu item updated successfully', updatedMenuItem });
  } catch (err) {
    console.error("Error in updateMenuItem:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Delete a menu item
exports.deleteMenuItem = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the menu item to delete
    const menuItem = await MenuItem.findByIdAndDelete(id);

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    // If the menu item had an image, delete it from Cloudinary
    if (menuItem.image) {
      // Extract the public_id from the image URL
      const imagePublicId = menuItem.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(imagePublicId);
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (err) {
    console.error("Error in deleteMenuItem:", err.message);
    res.status(500).json({ error: err.message });
  }
};


// Fetch menu items with restaurant name for the Home page (with pagination)
exports.getMenuItemsWithRestaurantName = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 6; // Default limit of 6 items per page
    const skip = (page - 1) * limit;

    // Fetch total count of menu items
    const totalItems = await MenuItem.countDocuments();

    // Fetch menu items with pagination
    const menuItems = await MenuItem.find()
      .populate("restaurantId", "restaurantName")
      .skip(skip)
      .limit(limit)
      .exec();

    if (!menuItems || menuItems.length === 0) {
      return res.status(404).json({ message: "No menu items found" });
    }

    // Format the response to include restaurant name
    const formattedMenuItems = menuItems.map((item) => ({
      id: item._id,
      name: item.name,
      restaurant: item.restaurantId ? item.restaurantId.restaurantName : "Unknown Restaurant",
      image: item.image,
      price: item.price,
      description: item.description,
    }));

    res.status(200).json({
      data: formattedMenuItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("Error fetching menu items:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Fetch menu items for a specific restaurant (user-specific)
exports.getMenuItemsForUser = async (req, res) => {
  try {
    const userId = req.user.id; // Extract userId from the decoded token

    // Find the restaurant associated with the logged-in user
    const restaurant = await Restaurant.findOne({ userId });
    if (!restaurant) {
      return res.status(404).json({ error: 'No restaurant found for this user' });
    }

    // Fetch menu items for the restaurant
    const menuItems = await MenuItem.find({ restaurantId: restaurant._id })
      .populate("restaurantId", "restaurantName")
      .exec();

    if (!menuItems || menuItems.length === 0) {
      return res.status(404).json({ message: "No menu items found for this restaurant" });
    }

    // Format the response to include restaurant name
    const formattedMenuItems = menuItems.map((item) => ({
      id: item._id,
      name: item.name,
      restaurant: item.restaurantId ? item.restaurantId.restaurantName : "Unknown Restaurant",
      image: item.image,
      price: item.price,
      description: item.description,
      availability: item.availability,
    }));

    res.status(200).json(formattedMenuItems);
  } catch (err) {
    console.error("Error fetching menu items for user:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Fetch a single menu item by ID
exports.getMenuItemById = async (req, res) => {
  const { id } = req.params;
  try {
    // Find the menu item by ID
    const menuItem = await MenuItem.findById(id)
      .populate("restaurantId", "restaurantName") // Populate the restaurant name
      .exec();
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    // Format the response
    const formattedMenuItem = {
      id: menuItem._id,
      name: menuItem.name,
      description: menuItem.description,
      price: menuItem.price,
      availability: menuItem.availability,
      image: menuItem.image,
      restaurant: menuItem.restaurantId ? menuItem.restaurantId.restaurantName : "Unknown Restaurant",
    };
    res.status(200).json(formattedMenuItem);
  } catch (err) {
    console.error("Error fetching menu item:", err.message);
    res.status(500).json({ error: err.message });
  }
};