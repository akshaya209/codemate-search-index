// src/server.js
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const logger = require("./utils/logger");

// Routes
const uploadRoutes = require("./upload");
const extractRoutes = require("./extract");
const normalizeRoutes = require("./normalize");
const tokenizeRoutes = require("./tokenize");
const invertedIndexRoutes = require("./invertedIndex");
const queryRoutes = require("./queryParser");
const searchRoutes = require("./search");

// Middleware
const errorHandler = require("./middleware/errorHandler");
const requestIdMiddleware = require("./middleware/requestId");

const app = express();
app.use(express.json());
app.use(cors());

// Add request ID middleware before all routes
app.use(requestIdMiddleware);

// Mount routes
app.use("/api", uploadRoutes);
app.use("/api", extractRoutes);
app.use("/api", normalizeRoutes.router || normalizeRoutes);
app.use("/api", tokenizeRoutes.router || tokenizeRoutes);
app.use("/api", invertedIndexRoutes.router || invertedIndexRoutes);
app.use("/api", queryRoutes);
app.use("/api", searchRoutes);

// Debug route for testing 500 errors
app.get("/api/debug/error", (req, res, next) => {
  const error = new Error("Intentional test error");
  error.statusCode = 500;
  next(error);
});

// 404 handler
app.use((req, res, next) => {
  const error = new Error("Resource not found");
  error.statusCode = 404;
  next(error);
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  connectDB()
    .then(() => {
      console.log("✅ Connected to MongoDB Atlas");
      app.listen(PORT, () => logger.info(`✅ Server running on port ${PORT}`));
    })
    .catch((err) => logger.error("❌ Failed to connect to DB:", err));
}

module.exports = app;
