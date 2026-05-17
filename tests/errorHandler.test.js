const errorHandler = require("../src/middleware/errorHandler");

describe("errorHandler middleware", () => {
  test("returns proper JSON error response", () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const err = { statusCode: 400, message: "Bad Request" };

    errorHandler(err, req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 400,
        message: "Bad Request"
      })
    );
  });
});
