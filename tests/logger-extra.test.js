const logger = require("../src/utils/logger");

describe("logger extra", () => {
  test("info handles meta data", () => {
    logger.info("hello-info", { user: 1 });
  });

  test("warn handles meta", () => {
    logger.warn("hello-warn", { k: true });
  });

  test("error handles meta", () => {
    logger.error("hello-error", { crash: true });
  });
});
