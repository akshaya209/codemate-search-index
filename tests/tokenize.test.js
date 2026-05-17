const request = require("supertest");
const fs = require("fs");
const path = require("path");
const app = require("../src/server");

describe("US-006 Tokenize Text", () => {
  it("should upload -> extract -> normalize -> tokenize successfully", async () => {
    const txtPath = path.join(__dirname, "token_sample.txt");
    fs.writeFileSync(txtPath, "This is a simple simple sample TEXT for TOKENIZATION test.");

    const up = await request(app).post("/api/upload").attach("file", txtPath);
    expect(up.statusCode).toBe(200);
    const ingestionId = up.body.file.ingestionId;

    const ex = await request(app).post(`/api/extract/${ingestionId}`);
    expect(ex.statusCode).toBe(200);

    const no = await request(app).post(`/api/normalize/${ingestionId}`);
    expect(no.statusCode).toBe(200);

    const tk = await request(app).post(`/api/tokenize/${ingestionId}`);
    expect(tk.statusCode).toBe(200);
    expect(tk.body.totalTokens).toBeGreaterThan(0);
    expect(Array.isArray(tk.body.sampleTokens)).toBe(true);

    fs.unlinkSync(txtPath);
  });

  it("should return 404 for invalid ingestionId", async () => {
    const res = await request(app).post("/api/tokenize/invalid-id");
    expect(res.statusCode).toBe(404);
  });
});
