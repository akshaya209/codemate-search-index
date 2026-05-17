// src/invertedIndex.js
const express = require("express");
const File = require("./models/FileModel");
const logger = require("./utils/logger");

const router = express.Router();

// In-memory index
const invertedIndex = {
  index: {}, // { term: [ { docId, positions } ] }
  builtAt: null,
};

/** Build the full inverted index **/
async function buildIndex() {
  logger.info("🔍 Building inverted index...");
  const start = Date.now();
  invertedIndex.index = {};

  const files = await File.find({ normalizedText: { $exists: true, $ne: "" } });
  for (const file of files) {
    const tokens = file.normalizedText.split(/\s+/);
    tokens.forEach((token, pos) => {
      if (!token) return;
      if (!invertedIndex.index[token]) invertedIndex.index[token] = [];
      const existing = invertedIndex.index[token].find(
        (d) => d.docId === file._id.toString()
      );
      if (existing) existing.positions.push(pos);
      else invertedIndex.index[token].push({
        docId: file._id.toString(),
        positions: [pos],
      });
    });
  }

  const duration = (Date.now() - start) / 1000;
  const termCount = Object.keys(invertedIndex.index).length;
  invertedIndex.builtAt = new Date();

  logger.info(`✅ Index built with ${termCount} terms in ${duration}s`);
  return { termCount, duration };
}

/** Query the index **/
async function query(term) {
  return invertedIndex.index[term] || [];
}

/** Update a document’s index **/
async function updateIndex(ingestionId) {
  const file = await File.findOne({ ingestionId });
  if (!file || !file.normalizedText) throw new Error("Document not found");

  // remove old
  for (const term in invertedIndex.index) {
    invertedIndex.index[term] = invertedIndex.index[term].filter(
      (entry) => entry.docId !== file._id.toString()
    );
    if (invertedIndex.index[term].length === 0) delete invertedIndex.index[term];
  }

  // re-add
  const tokens = file.normalizedText.split(/\s+/);
  tokens.forEach((token, pos) => {
    if (!token) return;
    if (!invertedIndex.index[token]) invertedIndex.index[token] = [];
    invertedIndex.index[token].push({
      docId: file._id.toString(),
      positions: [pos],
    });
  });

  return { message: "Index updated successfully" };
}

/** Remove document from index **/
async function removeIndex(ingestionId) {
  const file = await File.findOne({ ingestionId });
  if (!file) throw new Error("Document not found");

  for (const term in invertedIndex.index) {
    invertedIndex.index[term] = invertedIndex.index[term].filter(
      (entry) => entry.docId !== file._id.toString()
    );
    if (invertedIndex.index[term].length === 0) delete invertedIndex.index[term];
  }

  return { message: "Document removed from index" };
}

/** ---------------- ROUTES ---------------- **/

// ✅ POST /api/index/build
router.post("/index/build", async (req, res) => {
  try {
    const result = await buildIndex();
    res.status(200).json(result);
  } catch (err) {
    logger.error("Build index error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET /api/index/search?term=database
router.get("/index/search", async (req, res) => {
  try {
    const term = (req.query.term || "").trim().toLowerCase();
    if (!term) return res.status(400).json({ error: "Query term missing" });

    const results = await query(term);
    res.status(200).json({ term, documents: results });
  } catch (err) {
    logger.error("Search error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST /api/index/update/:ingestionId
router.post("/index/update/:ingestionId", async (req, res) => {
  try {
    const { ingestionId } = req.params;
    const result = await updateIndex(ingestionId);
    res.status(200).json(result);
  } catch (err) {
    logger.error("Update index error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE /api/index/remove/:ingestionId
router.delete("/index/remove/:ingestionId", async (req, res) => {
  try {
    const { ingestionId } = req.params;
    const result = await removeIndex(ingestionId);
    res.status(200).json(result);
  } catch (err) {
    logger.error("Remove index error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = { router, buildIndex, query, invertedIndex, updateIndex, removeIndex };
