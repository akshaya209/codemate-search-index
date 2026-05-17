// src/utils/tfidf.js

/**
 * Tokenizes text into lowercase alphanumeric words.
 */
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Computes term frequency (TF) for a single document.
 */
function computeTF(tokens) {
  const tf = {};
  const total = tokens.length;

  tokens.forEach((term) => {
    tf[term] = (tf[term] || 0) + 1;
  });

  // Normalize frequencies
  Object.keys(tf).forEach((term) => {
    tf[term] /= total;
  });

  return tf;
}

/**
 * Computes inverse document frequency (IDF) for all terms across docs.
 */
function computeIDF(allDocsTokens) {
  const idf = {};
  const totalDocs = allDocsTokens.length;

  allDocsTokens.forEach((tokens) => {
    const unique = new Set(tokens);
    unique.forEach((term) => {
      idf[term] = (idf[term] || 0) + 1;
    });
  });

  Object.keys(idf).forEach((term) => {
    idf[term] = Math.log(totalDocs / (idf[term] || 1));
  });

  return idf;
}

/**
 * Computes normalized TF-IDF weights for all documents.
 */
function computeTFIDF(docs) {
  const allTokens = docs.map(tokenize);
  const idf = computeIDF(allTokens);
  const tfidfData = [];

  allTokens.forEach((tokens, i) => {
    const tf = computeTF(tokens);
    const tfidf = {};
    for (const term in tf) {
      tfidf[term] = tf[term] * (idf[term] || 0);
    }

    // Normalize weights (L2 norm)
    const norm = Math.sqrt(
      Object.values(tfidf).reduce((sum, val) => sum + val * val, 0)
    );
    for (const term in tfidf) {
      tfidf[term] = norm ? tfidf[term] / norm : 0;
    }

    tfidfData.push({ docId: i + 1, tfidf });
  });

  return tfidfData;
}

/**
 * Ranks documents by relevance to a given query string.
 */
function rankDocuments(query, docs) {
  const queryTokens = tokenize(query);
  const tfidfDocs = computeTFIDF(docs);

  const scores = tfidfDocs.map((doc) => {
    let score = 0;
    queryTokens.forEach((term) => {
      score += doc.tfidf[term] || 0;
    });
    return { docId: doc.docId, score };
  });

  // Sort by score descending
  return scores.sort((a, b) => b.score - a.score);
}

module.exports = { computeTFIDF, rankDocuments };
