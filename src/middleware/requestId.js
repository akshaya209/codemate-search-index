// src/middleware/requestId.js
const crypto = require("crypto");

function requestIdMiddleware(req, res, next) {
  // Use Node.js built-in UUID generator
  req.requestId = crypto.randomUUID();
  next();
}

module.exports = requestIdMiddleware;
