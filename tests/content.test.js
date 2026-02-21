require("./chrome-mock");

describe("content.js", () => {
  let content;

  beforeEach(() => {
    // Reset DOM
    document.documentElement.className = "";
    // Reset location to a watch page
    delete window.location;
    window.location = { pathname: "/watch" };
    // Clear module cache so IIFE re-runs
    jest.resetModules();
    require("./chrome-mock");
    content = require("../content");
  });

  describe("isWatchPage", () => {
    test("returns true on /watch", () => {
      window.location.pathname = "/watch";
      expect(content.isWatchPage()).toBe(true);
    });

    test("returns false on homepage", () => {
      window.location.pathname = "/";
      expect(content.isWatchPage()).toBe(false);
    });

    test("returns false on /results", () => {
      window.location.pathname = "/results";
      expect(content.isWatchPage()).toBe(false);
    });

    test("returns false on /shorts", () => {
      window.location.pathname = "/shorts/abc123";
      expect(content.isWatchPage()).toBe(false);
    });
  });

  describe("isActive", () => {
    test("returns false when class is not present", () => {
      document.documentElement.classList.remove("ywf-active");
      expect(content.isActive()).toBe(false);
    });

    test("returns true when class is present", () => {
      document.documentElement.classList.add("ywf-active");
      expect(content.isActive()).toBe(true);
    });
  });

  describe("applyState", () => {
    test("adds class when enabled on watch page", () => {
      window.location.pathname = "/watch";
      content.applyState(true);
      expect(document.documentElement.classList.contains("ywf-active")).toBe(true);
    });

    test("does not add class when enabled on non-watch page", () => {
      window.location.pathname = "/";
      content.applyState(true);
      expect(document.documentElement.classList.contains("ywf-active")).toBe(false);
    });

    test("removes class when disabled", () => {
      document.documentElement.classList.add("ywf-active");
      content.applyState(false);
      expect(document.documentElement.classList.contains("ywf-active")).toBe(false);
    });

    test("removes class when disabled even on watch page", () => {
      window.location.pathname = "/watch";
      document.documentElement.classList.add("ywf-active");
      content.applyState(false);
      expect(document.documentElement.classList.contains("ywf-active")).toBe(false);
    });
  });

  describe("toggle", () => {
    test("activates when currently inactive on watch page", () => {
      window.location.pathname = "/watch";
      document.documentElement.classList.remove("ywf-active");
      const result = content.toggle();
      expect(result).toBe(true);
      expect(document.documentElement.classList.contains("ywf-active")).toBe(true);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ "ywf-enabled": true });
    });

    test("deactivates when currently active", () => {
      document.documentElement.classList.add("ywf-active");
      const result = content.toggle();
      expect(result).toBe(false);
      expect(document.documentElement.classList.contains("ywf-active")).toBe(false);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ "ywf-enabled": false });
    });
  });

  describe("shouldToggleOnKeydown", () => {
    function makeEvent(overrides = {}) {
      return {
        altKey: true,
        shiftKey: true,
        key: "F",
        ctrlKey: false,
        metaKey: false,
        target: { tagName: "BODY", isContentEditable: false },
        ...overrides,
      };
    }

    test("returns true for Alt+Shift+F on body", () => {
      expect(content.shouldToggleOnKeydown(makeEvent())).toBe(true);
    });

    test("returns false without Alt", () => {
      expect(content.shouldToggleOnKeydown(makeEvent({ altKey: false }))).toBe(false);
    });

    test("returns false without Shift", () => {
      expect(content.shouldToggleOnKeydown(makeEvent({ shiftKey: false }))).toBe(false);
    });

    test("returns false with Ctrl", () => {
      expect(content.shouldToggleOnKeydown(makeEvent({ ctrlKey: true }))).toBe(false);
    });

    test("returns false with Meta", () => {
      expect(content.shouldToggleOnKeydown(makeEvent({ metaKey: true }))).toBe(false);
    });

    test("returns false for wrong key", () => {
      expect(content.shouldToggleOnKeydown(makeEvent({ key: "G" }))).toBe(false);
    });

    test("returns false when target is INPUT", () => {
      expect(content.shouldToggleOnKeydown(makeEvent({
        target: { tagName: "INPUT", isContentEditable: false },
      }))).toBe(false);
    });

    test("returns false when target is TEXTAREA", () => {
      expect(content.shouldToggleOnKeydown(makeEvent({
        target: { tagName: "TEXTAREA", isContentEditable: false },
      }))).toBe(false);
    });

    test("returns false when target is contentEditable", () => {
      expect(content.shouldToggleOnKeydown(makeEvent({
        target: { tagName: "DIV", isContentEditable: true },
      }))).toBe(false);
    });
  });
});
