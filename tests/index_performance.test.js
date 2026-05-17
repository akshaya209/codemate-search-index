// tests/index_performance.test.js
const request = require("supertest");
const app = require("../src/server");

describe("US-010 Index Performance (smoke)", () => {
  jest.setTimeout(30000);

  test("build index completes and returns duration under threshold", async () => {
    const res = await request(app).post("/api/index/build");
    expect(res.statusCode).toBe(200);
    expect(res.body.duration).toBeDefined();
    // threshold in seconds (adjust as per environment)
    expect(res.body.duration).toBeLessThan(30); // e.g., 30s for many docs
  });

  test("search latency (single request) is small", async () => {
    const t = "database";
    const start = Date.now();
    const res = await request(app).get(`/api/index/search`).query({ term: t });
    const dur = Date.now() - start;
    expect(res.statusCode).toBe(200);
    expect(dur).toBeLessThan(1000); // 1s for single lookup
  });
});
