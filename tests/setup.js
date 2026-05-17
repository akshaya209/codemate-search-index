const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../src/db");

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Mock pdf-parse for consistent test behavior
jest.mock("pdf-parse", () =>
  jest.fn(() => Promise.resolve({ text: "Mock PDF text" }))
);

// Increase default timeout for all tests (some DB ops can take long)
jest.setTimeout(60000);

beforeAll(async () => {
  // Connect to MongoDB before tests start
  await connectDB();
});

afterAll(async () => {
  // Ensure DB connections close properly
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed after tests");
  }

  // Give Jest a moment to clean up handles
  await new Promise((resolve) => setTimeout(resolve, 500));
});
