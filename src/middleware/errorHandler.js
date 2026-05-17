// src/middleware/errorHandler.js
const logger = require("../utils/logger");

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  const requestId = req.requestId || "unknown";

  // Log detailed error info
  logger.error("Error occurred", {
    url: req.originalUrl,
    method: req.method,
    message,
    stack: err.stack,
    requestId,
  });

  // Standardized JSON error response
  res.status(statusCode).json({
    code: statusCode,
    message:
      statusCode === 500
        ? "Something went wrong! Please try again later."
        : message,
    requestId,
  });
}

module.exports = errorHandler;
