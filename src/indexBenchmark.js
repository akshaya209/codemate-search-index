// src/indexBenchmark.js
const express = require("express");
const { buildIndex, invertedIndex } = require("./invertedIndex");
const router = express.Router();
const logger = require("./utils/logger");

/**
 * POST /api/index/benchmark
 * body: { queries: [ "term1", "term2" ], iterations: 10 }
 *
 * Returns: { build: { termCount, duration }, queries: { totalRequests, avgMs, p95Ms, errors } }
 */
router.post("/index/benchmark", async (req, res) => {
  try {
    const body = req.body || {};
    const queries =
      Array.isArray(body.queries) && body.queries.length
        ? body.queries
        : Object.keys(invertedIndex.index).slice(0, 50); // default: first 50 terms
    const iterations = Number(body.iterations) || 50;

    // 🟢 Step A: Build index
    const buildInfo = await buildIndex();

    // 🟢 Step B: Run benchmarks
    const totalRequests = iterations * Math.max(1, queries.length);
    const times = [];
    let errors = 0;

    for (let i = 0; i < iterations; i++) {
      for (const q of queries) {
        const start = Date.now();
        try {
          const term = String(q || "").trim().toLowerCase();
          // simulate lookup
          void (invertedIndex.index[term] || []); // intentionally used to mark as accessed
          const duration = Date.now() - start;
          times.push(duration);
        } catch {
          errors++;
          times.push(null);
        }
      }
    }

    // 🟢 Step C: Calculate stats
    const validTimes = times.filter((t) => typeof t === "number");
    const total = validTimes.reduce((a, b) => a + b, 0);
    const avg = validTimes.length ? total / validTimes.length : 0;
    const sorted = validTimes.slice().sort((a, b) => a - b);
    const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;

    const result = {
      build: buildInfo,
      queries: {
        totalRequests,
        measured: validTimes.length,
        avgMs: avg.toFixed(3),
        p95Ms: p95.toFixed(3),
        errors,
      },
    };

    logger.info("✅ Index benchmark completed successfully", { result });
    return res.status(200).json(result);
  } catch (err) {
    logger.error("❌ Index benchmark failed", { error: err.message });
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
