// src/utils/logger.js
const mongoose = require("mongoose");
const Log = require("../models/LogModel");

async function logToDB(level, message, meta = {}) {
  try {
    // 🧠 Skip DB writes during tests or if DB is not connected
    if (process.env.NODE_ENV === "test") return;
    if (mongoose.connection.readyState !== 1) {
      console.warn(`[Logger] Skipping DB log (not connected): ${message}`);
      return;
    }

    const entry = new Log({
      level,
      message,
      meta,
      timestamp: new Date(),
    });

    await entry.save();
  } catch (err) {
    const ignored = [
      "connection from closed connection pool",
      "Client must be connected",
      "Cannot use a session that has ended",
    ];
    if (ignored.some((txt) => err.message.includes(txt))) return;
    console.error("[Logger] Failed to save log to DB:", err.message);
  }
}

const logger = {
  info: (msg, meta = {}) => {
    if (process.env.NODE_ENV !== "test") {
      console.log(`[${new Date().toISOString()}] [INFO] ${msg}`);
    }
    logToDB("info", msg, meta);
  },

  warn: (msg, meta = {}) => {
    if (process.env.NODE_ENV !== "test") {
      console.warn(`[${new Date().toISOString()}] [WARN] ${msg}`);
    }
    logToDB("warn", msg, meta);
  },

  error: (msg, meta = {}) => {
    // ✅ Only one clean console log per call
    if (process.env.NODE_ENV !== "test") {
      console.error(`[${new Date().toISOString()}] [ERROR] ${msg}`);
    }
    logToDB("error", msg, meta);
  },
};

module.exports = logger;
