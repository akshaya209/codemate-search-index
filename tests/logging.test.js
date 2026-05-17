const request = require("supertest");
const fs = require("fs");
const path = require("path");
const app = require("../src/server");

describe("US-005 Logging & Error Handling", () => {
  it("should log warning when uploading invalid file type", async () => {
    const filePath = path.join(__dirname, "test.exe");
    fs.writeFileSync(filePath, "fake content");
    const res = await request(app).post("/api/upload").attach("file", filePath);
    expect(res.statusCode).toBe(400);
    fs.unlinkSync(filePath);
  });

  it("should log info when upload is successful", async () => {
    const txtPath = path.join(__dirname, "log_test.txt");
    fs.writeFileSync(txtPath, "hello logs");
    const res = await request(app).post("/api/upload").attach("file", txtPath);
    expect(res.statusCode).toBe(200);
    fs.unlinkSync(txtPath);
  });
});
