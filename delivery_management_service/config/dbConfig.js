const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Set options for better connection handling
    const options = {
      dbName: "foodOrderDeliverydb",      
      serverSelectionTimeoutMS: 30000,    
      socketTimeoutMS: 45000,            
      bufferCommands: false,            
    };

    // Attempt to connect to MongoDB with the specified options
    await mongoose.connect(process.env.MONGO_URL, options);

    console.log("Connected to database successfully");

  } catch (error) {
    console.error("Database connection failed:", error.message);
    
    // Exit the process with a failure code
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
