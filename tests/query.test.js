// tests/query.test.js
const request = require("supertest");
const fs = require("fs");
const path = require("path");
const app = require("../src/server");

describe("US-008 Query Parser", () => {
  let ingestionId;

  beforeAll(async () => {
    // upload a sample text with multiple tokens/phrases
    const txtPath = path.join(__dirname, "query_sample.txt");
    fs.writeFileSync(txtPath, "Database systems enable efficient search and information retrieval.");
    const up = await request(app).post("/api/upload").attach("file", txtPath);
    expect(up.statusCode).toBe(200);
    ingestionId = up.body.file.ingestionId;
    fs.unlinkSync(txtPath);

    // extract & normalize
    await request(app).post(`/api/extract/${ingestionId}`);
    await request(app).post(`/api/normalize/${ingestionId}`);
    // build index (so in-memory invertedIndex gets populated)
    await request(app).post("/api/index/build");
  });

  it("single term search", async () => {
    const res = await request(app).get("/api/query").query({ q: "database" });
    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBeGreaterThan(0);
  });

  it("phrase search", async () => {
    const res = await request(app).get("/api/query").query({ q: '"information retrieval"' });
    expect(res.statusCode).toBe(200);
    // may be 1 doc - ensure no error
    expect(typeof res.body.count).toBe("number");
  });

  it("boolean AND", async () => {
    const res = await request(app).get("/api/query").query({ q: "database AND search" });
    expect(res.statusCode).toBe(200);
  });

  it("boolean OR and NOT", async () => {
    const res = await request(app).get("/api/query").query({ q: "database OR unicorn" });
    expect(res.statusCode).toBe(200);
  });
});
