// tests/normalize.test.js
const request = require("supertest");
const fs = require("fs");
const path = require("path");
const app = require("../src/server");

describe("US-004 Text Normalization", () => {
  it("upload -> extract -> normalize works for txt", async () => {
    // create a sample txt file
    const txtPath = path.join(__dirname, "norm_sample.txt");
    fs.writeFileSync(txtPath, "  This is, THE sample TEXT!!! With punctuation... and stopwords. ");

    // Step 1: upload
    const up = await request(app).post("/api/upload").attach("file", txtPath);
    expect(up.statusCode).toBe(200);
    const ingestionId = up.body.file.ingestionId || up.body.file._id || up.body.file.ingestionId;
    // if your File model returns ingestionId, use that. If not, get _id
    // I recommend verifying which property exists in your response.

    // Step 2: extract (for txt this should read the file)
    const ex = await request(app).post(`/api/extract/${ingestionId}`);
    expect(ex.statusCode).toBe(200);

    // Step 3: normalize
    const no = await request(app).post(`/api/normalize/${ingestionId}`);
    expect(no.statusCode).toBe(200);
    expect(no.body.meta).toBeDefined();
    expect(typeof no.body.snippet).toBe("string");

    fs.unlinkSync(txtPath);
  });
});
