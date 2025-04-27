const express = require('express');
const { register, login, getAllUsers, deleteUser, logout, getProfile, updateProfile } = require('../controllers/authController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', verifyToken, getProfile); // Get user profile
router.put('/profile', verifyToken, updateProfile);
router.get('/all', verifyToken, verifyRole(['systemAdmin']), getAllUsers); // Get all users (only system admin)
router.delete('/:id', verifyToken, verifyRole(['systemAdmin']), deleteUser); // Delete user (only system admin)

// Logout route
router.post('/logout', logout);

module.exports = router;

