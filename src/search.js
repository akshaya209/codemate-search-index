// src/search.js
const express = require("express");
const File = require("./models/FileModel");
const { invertedIndex } = require("./invertedIndex");
const logger = require("./utils/logger");

const router = express.Router();

// ✅ Normalize query terms
function normalizeTerm(term) {
  return String(term || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();
}

// ✅ Escape HTML to prevent XSS
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ✅ Build 100-character context snippet & highlight query terms
function makeSnippet(text = "", terms = []) {
  if (!text) return "";
  const lowerText = text.toLowerCase();

  let firstPos = -1;
  for (const term of terms) {
    const pos = lowerText.indexOf(term.toLowerCase());
    if (pos !== -1 && (firstPos === -1 || pos < firstPos)) firstPos = pos;
  }

  if (firstPos === -1) firstPos = 0;

  const start = Math.max(0, firstPos - 40);
  const snippet = text.substring(start, start + 100);

  let safe = escapeHtml(snippet);

  // ✅ FIXED Regex for highlighting
  for (const term of terms) {
    const re = new RegExp(`\\b(${term})\\b`, "gi");
    safe = safe.replace(re, "<mark>$1</mark>");
  }

  const prefix = start > 0 ? "..." : "";
  const suffix = text.length > start + 100 ? "..." : "";

  return prefix + safe + suffix;
}

// ✅ Compute TF-IDF ranking
function computeTfIdf(queryTerms, index, totalDocs) {
  const scores = new Map();

  for (const term of queryTerms) {
    const postings = index[term] || [];
    const df = postings.length;
    const idf = Math.log((totalDocs + 1) / (df + 1)) + 1; // smooth IDF

    for (const post of postings) {
      const tf = post.positions?.length || 1;
      const doc = post.docId;
      scores.set(doc, (scores.get(doc) || 0) + tf * idf);
    }
  }

  return scores;
}

// ✅ GET /api/search
router.get("/search", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q)
      return res.status(400).json({ code: 400, message: "Query parameter q required" });

    const terms = q.split(/\s+/).map(normalizeTerm).filter(Boolean);
    if (!terms.length)
      return res.status(400).json({ code: 400, message: "Invalid query" });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const fileType = req.query.type ? req.query.type.toLowerCase() : "";

    // Compute scores
    const index = invertedIndex.index || {};
    const totalDocs =
      new Set(Object.values(index).flat().map((p) => p.docId)).size || 1;

    const scores = computeTfIdf(terms, index, totalDocs);

    const docIds = Array.from(scores.keys());
    const query = { _id: { $in: docIds } };
    if (fileType) query.format = new RegExp(fileType, "i");

    const allDocs = await File.find(query).lean();

    const results = allDocs.map((doc) => ({
      filename: doc.filename,
      fileType: doc.format || "unknown",
      score: scores.get(doc._id.toString()) || 0,
      snippet: makeSnippet(doc.extractedText || doc.normalizedText || "", terms),
    }));

    // Sort by score
    results.sort((a, b) => b.score - a.score);

    // Pagination
    const startIndex = (page - 1) * limit;
    const paged = results.slice(startIndex, startIndex + limit);

    logger.info("Search executed", {
      query: q,
      totalResults: results.length,
      page,
      limit,
    });

    res.json({
      query: q,
      page,
      limit,
      totalResults: results.length,
      results: paged,
    });
  } catch (err) {
    logger.error("Search failed", { error: err.message });
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
});

module.exports = router;
