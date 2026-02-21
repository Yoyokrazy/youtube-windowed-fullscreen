/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  setupFiles: ["./tests/chrome-mock.js"],
  testMatch: ["**/tests/**/*.test.js"],
};
