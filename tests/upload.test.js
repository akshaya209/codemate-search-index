const request = require("supertest");
const fs = require("fs");
const path = require("path");
const app = require("../src/server");

describe("US-003 File Upload & Text Extraction", () => {
  it("should reject when no file uploaded", async () => {
    const res = await request(app).post("/api/upload");
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("No file uploaded!");
  });

  it("should reject invalid file type", async () => {
    const filePath = path.join(__dirname, "test.exe");
    fs.writeFileSync(filePath, "fake");
    const res = await request(app).post("/api/upload").attach("file", filePath);
    expect(res.statusCode).toBe(400);
    fs.unlinkSync(filePath);
  });

  it("should accept valid TXT file", async () => {
    const txtPath = path.join(__dirname, "sample.txt");
    fs.writeFileSync(txtPath, "Hello world text");
    const res = await request(app).post("/api/upload").attach("file", txtPath);
    expect(res.statusCode).toBe(200);
    fs.unlinkSync(txtPath);
  });
});
