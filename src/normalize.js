// src/normalize.js
const express = require("express");
const File = require("./models/FileModel");

const router = express.Router();

// small stopword list (you can extend later)
const STOPWORDS = new Set([
  "a","an","and","are","as","at","be","but","by","for","if","in","into","is","it",
  "no","not","of","on","or","such","that","the","their","then","there","these","they",
  "this","to","was","will","with"
]);

function simpleNormalize(text, { removeStopwords = true } = {}) {
  if (!text) return "";
  // Unicode normalization
  let s = text.normalize("NFKC");

  // lowercase
  s = s.toLowerCase();

  // replace punctuation (keep basic alphanum and spaces)
  // we'll replace any character that's not a letter, number or whitespace with space
  s = s.replace(/[^0-9a-z\s]/g, " ");

  // collapse multiple whitespace
  s = s.replace(/\s+/g, " ").trim();

  if (removeStopwords) {
    const tokens = s.split(" ");
    const filtered = tokens.filter((t) => t && !STOPWORDS.has(t));
    s = filtered.join(" ");
  }

  return s;
}

// POST /api/normalize/:ingestionId
router.post("/normalize/:ingestionId", async (req, res) => {
  console.log("🧩 Normalize API called with:", req.params.ingestionId);
  try {
    const { ingestionId } = req.params;
    const { removeStopwords = "true" } = req.query; // optional query param
    const removeSW = removeStopwords === "false" ? false : true;

    const fileDoc = await File.findOne({ ingestionId }).exec();
    if (!fileDoc) return res.status(404).json({ error: "File not found" });

    if (!fileDoc.extractedText) {
      return res
        .status(400)
        .json({ error: "No extracted text found. Run extraction first." });
    }

    const normalized = simpleNormalize(fileDoc.extractedText, {
      removeStopwords: removeSW,
    });

    const meta = {
      removedStopwords: removeSW,
      originalLength: fileDoc.extractedText.length,
      normalizedLength: normalized.length,
      words: normalized ? normalized.split(/\s+/).filter(Boolean).length : 0,
      normalizedAt: new Date(),
    };

    fileDoc.normalizedText = normalized;
    fileDoc.normalizationMeta = meta;
    fileDoc.normalizedAt = new Date();

    await fileDoc.save();

    return res.status(200).json({
      message: "Normalization completed",
      snippet: normalized.slice(0, 400),
      meta,
    });
  } catch (err) {
    console.error("Normalization error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = { router, simpleNormalize };
