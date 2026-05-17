// src/models/InvertedIndexModel.js
const mongoose = require("mongoose");

const invertedIndexSchema = new mongoose.Schema({
  term: {
    type: String,
    required: true,
    index: true, // speeds up lookups by term
  },
  documents: [
    {
      ingestionId: String,   // links to FileModel
      positions: [Number],   // positions in document
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Optional — update timestamp automatically
invertedIndexSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("InvertedIndex", invertedIndexSchema);
