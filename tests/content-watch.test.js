/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://www.youtube.com/watch?v=test123"}
 */

require("./chrome-mock");

describe("content.js on /watch page", () => {
  let content;

  beforeEach(() => {
    document.documentElement.className = "";
    jest.resetModules();
    require("./chrome-mock");
    content = require("../content");
  });

  test("isWatchPage returns true", () => {
    expect(content.isWatchPage()).toBe(true);
  });

  test("applyState adds class when enabled", () => {
    content.applyState(true);
    expect(document.documentElement.classList.contains("ywf-active")).toBe(true);
  });

  test("applyState removes class when disabled", () => {
    document.documentElement.classList.add("ywf-active");
    content.applyState(false);
    expect(document.documentElement.classList.contains("ywf-active")).toBe(false);
  });

  test("toggle activates when inactive", () => {
    document.documentElement.classList.remove("ywf-active");
    const result = content.toggle();
    expect(result).toBe(true);
    expect(document.documentElement.classList.contains("ywf-active")).toBe(true);
    expect(chrome.storage.local.set).toHaveBeenCalledWith({ "ywf-enabled": true });
  });

  test("toggle deactivates when active", () => {
    document.documentElement.classList.add("ywf-active");
    const result = content.toggle();
    expect(result).toBe(false);
    expect(document.documentElement.classList.contains("ywf-active")).toBe(false);
    expect(chrome.storage.local.set).toHaveBeenCalledWith({ "ywf-enabled": false });
  });
});
