const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register User
exports.register = async (req, res) => {
  const { first_name, last_name, mobile_number, email, city, password, role } = req.body;

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already in use' });
    }

    // Set default role to "customer" if not provided
    const userRole = role || 'customer';

    // Validate role
    const allowedRoles = ['customer', 'restaurantAdmin', 'deliveryPersonnel', 'systemAdmin'];
    if (!allowedRoles.includes(userRole)) {
      return res.status(400).json({ error: 'Invalid role selected' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      first_name,
      last_name,
      mobile_number,
      email,
      city,
      password: hashedPassword,
      role: userRole, 
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login User
exports.login = async (req, res) => {
const { email, password } = req.body;

try {
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: 'No record found' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  // Send token in HTTP-only cookie
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 86400000, // 1 day
    path: '/',
  });

  res.json({ Status: 'Success', role: user.role, token });
} catch (err) {
  res.status(500).json({ error: err.message });
}
};

// Get All Users (Only System Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments();
    const users = await User.find({}, 'first_name last_name mobile_number email city role')
      .skip(skip)
      .limit(limit);

    res.json({
      Status: 'Success',
      data: users,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete User (Only System Admin)
exports.deleteUser = async (req, res) => {
try {
  const userId = req.params.id;

  const deletedUser = await User.findByIdAndDelete(userId);
  if (!deletedUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ Status: 'Success', message: 'User deleted successfully' });
} catch (err) {
  res.status(500).json({ error: err.message });
}
};

// Logout User
exports.logout = async (req, res) => {
  try {
    // Clear the HTTP-only cookie containing the JWT token
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Set to false for development
      sameSite: 'strict',
      path: '/',
    });

    // Respond with success message
    res.status(200).json({ message: 'User logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};