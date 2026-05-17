const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  ingestionId: {
    type: String,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  filename: { type: String, required: true },
  filepath: { type: String, required: true },
  size: { type: String },
  format: { type: String },
  uploadDate: { type: Date, default: Date.now },

  // 🟩 User Story 3 — Extracted text fields
  extractedText: { type: String },
  extractionMeta: { type: Object },
  extractedAt: { type: Date },

  // 🟨 User Story 4 — Normalized text fields
  normalizedText: { type: String },
  normalizationMeta: { type: Object },
  normalizedAt: { type: Date },

  // 🟦 User Story 6 — Tokenization fields
  tokenizationMeta: { type: Object },
  tokenizedAt: { type: Date },
});

module.exports = mongoose.model("File", fileSchema);
