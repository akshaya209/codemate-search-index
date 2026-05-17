const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

mongoose.set("strictQuery", true);

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI?.trim();

  try {
    if (!mongoUri || !mongoUri.startsWith("mongodb")) {
      throw new Error(`❌ Invalid or missing MongoDB URI! Got: ${mongoUri}`);
    }

    await mongoose.connect(mongoUri);
    
    mongoose.connection.once("open", () => {
      console.log("✅ Connected to MongoDB Atlas");
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    if (process.env.NODE_ENV !== "test") process.exit(1);
  }
};

module.exports = connectDB;
