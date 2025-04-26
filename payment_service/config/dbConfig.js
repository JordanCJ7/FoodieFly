const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const options = { dbName: "foodOrderDeliverydb" };
    await mongoose.connect(process.env.MONGO_URL, options);
    console.log("Connected to database");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;