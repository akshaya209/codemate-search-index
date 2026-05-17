// tests/tfidf.test.js
// ------------------------------------------------------------------
// User Story: US-009 Compute TF-IDF Weights
// Goal: Verify that TF × IDF scores are computed, normalized,
// handle zero/empty inputs, and produce ranked results.
// ------------------------------------------------------------------

const { computeTFIDF, rankDocuments } = require("../src/utils/tfidf");

describe("US-009 Compute TF-IDF Weights", () => {
  const docs = [
    "Search engines use TF-IDF weighting to rank pages",
    "TF-IDF helps find relevant information",
    "Ranking search results depends on TF-IDF values"
  ];

  // AC1: Computes correct TF-IDF values for all terms
  it("AC1: computes correct TF-IDF structure", () => {
    const result = computeTFIDF(docs);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(docs.length);

    // Each doc should have a tfidf object with non-zero terms
    result.forEach((doc) => {
      expect(doc).toHaveProperty("tfidf");
      expect(Object.keys(doc.tfidf).length).toBeGreaterThan(0);
    });
  });

  // AC2: Stores normalized scores
  it("AC2: stores normalized TF-IDF scores", () => {
    const result = computeTFIDF(docs);

    result.forEach((doc) => {
      const norm = Math.sqrt(
        Object.values(doc.tfidf).reduce((sum, v) => sum + v * v, 0)
      );
      // Normalized vectors should have magnitude close to 1
      expect(norm).toBeCloseTo(1, 1);
    });
  });

  // AC3: Handles zero or missing values gracefully
  it("AC3: handles empty or missing documents gracefully", () => {
    const result = computeTFIDF(["", "TF-IDF test"]);
    expect(result.length).toBe(2);

    const emptyDoc = result[0];
    expect(Object.values(emptyDoc.tfidf).every((v) => v === 0)).toBe(true);
  });

  // AC4: Produces ranked result list by score
  it("AC4: ranks documents correctly by relevance", () => {
    const ranked = rankDocuments("TF-IDF ranking", docs);
    expect(Array.isArray(ranked)).toBe(true);
    expect(ranked).toHaveLength(docs.length);

    // Top result should have the highest score
    expect(ranked[0].score).toBeGreaterThanOrEqual(ranked[1].score);
  });
});

