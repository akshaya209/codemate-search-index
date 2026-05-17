describe("Server Initialization", () => {
  test("imports server without crashing", () => {
    const app = require("../src/server");
    expect(typeof app).toBe("function");
  });
});
