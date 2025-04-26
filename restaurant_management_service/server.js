const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/dbConfig');
const restaurantRoutes = require('./routes/restaurantRoutes'); 
const menuItemRoutes = require('./routes/menuItemRoutes'); 
const { PORT } = require('./config/envConfig');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Parse JSON payloads
app.use(express.urlencoded({ limit: '10mb', extended: true })); // Parse URL-encoded payloads
app.use(cookieParser());
// Routes
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu-items', menuItemRoutes);

// Connect to the database and start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to start the server:', err.message);
});
