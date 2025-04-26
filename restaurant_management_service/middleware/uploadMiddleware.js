const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConfig');

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'menu-items', // Folder in Cloudinary to store images
    format: async (req, file) => 'jpg', // Convert all images to JPG
    public_id: (req, file) => `${Date.now()}-${file.originalname}`, // Unique filename
  },
});

const upload = multer({ storage });

module.exports = upload;