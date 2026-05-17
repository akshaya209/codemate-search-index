const express = require("express");
const File = require("./models/FileModel");

const router = express.Router();

const STOPWORDS = new Set([
  "a","an","and","are","as","at","be","but","by",
  "for","if","in","into","is","it","no","not","of",
  "on","or","such","that","the","their","then","there",
  "these","they","this","to","was","will","with"
]);

function tokenizeText(text, { removeStopwords = true } = {}) {
  if (!text) return [];
  let s = text.toLowerCase();
  s = s.replace(/[^a-z0-9\s]/g, " ");
  s = s.replace(/\s+/g, " ").trim();
  let tokens = s.split(" ").filter(Boolean);
  if (removeStopwords) tokens = tokens.filter(t => !STOPWORDS.has(t));
  return tokens;
}

router.post("/tokenize/:ingestionId", async (req, res) => {
  console.log("🧩 Tokenize API called with:", req.params.ingestionId);
  try {
    const { ingestionId } = req.params;
    const { removeStopwords = "true" } = req.query;
    const removeSW = removeStopwords === "false" ? false : true;

    const fileDoc = await File.findOne({ ingestionId }).exec();
    if (!fileDoc) return res.status(404).json({ error: "File not found" });

    const text = fileDoc.normalizedText || fileDoc.extractedText;
    if (!text) return res.status(400).json({ error: "No text found. Run extraction/normalization first." });

    const tokens = tokenizeText(text, { removeStopwords: removeSW });
    const frequency = {};
    tokens.forEach(t => (frequency[t] = (frequency[t] || 0) + 1));

    fileDoc.tokenizationMeta = {
      removeStopwords: removeSW,
      tokenCount: tokens.length,
      uniqueTokens: Object.keys(frequency).length,
      tokenizedAt: new Date(),
    };
    fileDoc.tokenizedAt = new Date();
    await fileDoc.save();

    res.status(200).json({
      message: "Tokenization completed successfully",
      sampleTokens: tokens.slice(0, 20),
      totalTokens: tokens.length,
      uniqueTokens: Object.keys(frequency).length,
      meta: fileDoc.tokenizationMeta,
    });
  } catch (err) {
    console.error("Tokenization error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = { router, tokenizeText };
