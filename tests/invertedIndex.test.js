// tests/invertedIndex.test.js
const request = require("supertest");
const fs = require("fs");
const path = require("path");
const app = require("../src/server");

describe("US-007 Build Inverted Index", () => {
  let ingestionId = null;

  beforeAll(async () => {
    // Upload a simple text file first
    const txtPath = path.join(__dirname, "inverted_sample.txt");
    fs.writeFileSync(txtPath, "Database systems enable efficient search and retrieval of information.");
    const res = await request(app).post("/api/upload").attach("file", txtPath);
    expect(res.statusCode).toBe(200);
    ingestionId = res.body.file.ingestionId;
    fs.unlinkSync(txtPath);

    // Extract and normalize before indexing
    await request(app).post(`/api/extract/${ingestionId}`);
    await request(app).post(`/api/normalize/${ingestionId}`);
  });

  it("should build inverted index successfully", async () => {
    const res = await request(app).post("/api/index/build");
    expect(res.statusCode).toBe(200);
    expect(res.body.termCount).toBeGreaterThan(0);
  });

  it("should search for a term and get matching document", async () => {
    const res = await request(app).get("/api/index/search?term=database");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.documents)).toBe(true);
  });

  it("should update index for a document", async () => {
    const res = await request(app).post(`/api/index/update/${ingestionId}`);
    expect(res.statusCode).toBe(200);
  });

  it("should remove document from index", async () => {
    const res = await request(app).delete(`/api/index/remove/${ingestionId}`);
    expect(res.statusCode).toBe(200);
  });
});
