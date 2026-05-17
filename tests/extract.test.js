const extract = require("./helpers/extractMock");

const mockFile = {
  originalname: "test.txt",
  path: "mock/path/test.txt"
};

describe("extract()", () => {
  test("extracts text properly", async () => {
    const text = await extract(mockFile);
    expect(typeof text).toBe("string");
    expect(text).toContain("hello");
  });
});
