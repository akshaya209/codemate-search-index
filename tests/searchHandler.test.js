const request = require("supertest");
const app = require("../src/server");

describe("GET /api/search", () => {
 test("returns 400 when no query given", async () => {
  const res = await request(app).get("/api/search?q=");
  expect(res.status).toBe(400);
  expect(res.body.message).toMatch(/parameter q required/i);
});


  test("returns ranked results", async () => {
    const res = await request(app).get("/api/search?q=hello");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.results)).toBe(true);
  });
});
