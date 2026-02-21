const { loadContentScript, makeKeyboardEvent } = require("./helpers/test-utils");

describe("content.js", () => {
  let content;

  beforeEach(() => {
    content = loadContentScript();
  });

  describe("shouldToggleOnKeydown", () => {
    test("returns true for Alt+Shift+F on body", () => {
      expect(content.shouldToggleOnKeydown(makeKeyboardEvent())).toBe(true);
    });

    test("returns false without Alt", () => {
      expect(content.shouldToggleOnKeydown(makeKeyboardEvent({ altKey: false }))).toBe(false);
    });

    test("returns false without Shift", () => {
      expect(content.shouldToggleOnKeydown(makeKeyboardEvent({ shiftKey: false }))).toBe(false);
    });

    test("returns false with Ctrl", () => {
      expect(content.shouldToggleOnKeydown(makeKeyboardEvent({ ctrlKey: true }))).toBe(false);
    });

    test("returns false with Meta", () => {
      expect(content.shouldToggleOnKeydown(makeKeyboardEvent({ metaKey: true }))).toBe(false);
    });

    test("returns false for wrong key", () => {
      expect(content.shouldToggleOnKeydown(makeKeyboardEvent({ key: "G" }))).toBe(false);
    });

    test("returns false when target is INPUT", () => {
      expect(content.shouldToggleOnKeydown(makeKeyboardEvent({
        target: { tagName: "INPUT", isContentEditable: false },
      }))).toBe(false);
    });

    test("returns false when target is TEXTAREA", () => {
      expect(content.shouldToggleOnKeydown(makeKeyboardEvent({
        target: { tagName: "TEXTAREA", isContentEditable: false },
      }))).toBe(false);
    });

    test("returns false when target is contentEditable", () => {
      expect(content.shouldToggleOnKeydown(makeKeyboardEvent({
        target: { tagName: "DIV", isContentEditable: true },
      }))).toBe(false);
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
    // jsdom URL is about:blank so isWatchPage() returns false
    test("removes class when disabled", () => {
      document.documentElement.classList.add("ywf-active");
      content.applyState(false);
      expect(document.documentElement.classList.contains("ywf-active")).toBe(false);
    });

    test("does not add class on non-watch page even when enabled", () => {
      content.applyState(true);
      expect(document.documentElement.classList.contains("ywf-active")).toBe(false);
    });
  });

  describe("toggle", () => {
    test("persists state to storage", () => {
      content.toggle();
      expect(chrome.storage.local.set).toHaveBeenCalled();
    });

    test("returns opposite of current active state", () => {
      document.documentElement.classList.remove("ywf-active");
      const result = content.toggle();
      expect(result).toBe(true);
    });

    test("double toggle preserves storage calls", () => {
      content.toggle();
      content.toggle();
      expect(chrome.storage.local.set).toHaveBeenCalledTimes(2);
    });
  });

  describe("isWatchPage", () => {
    // jsdom URL is about:blank, so isWatchPage always returns false here.
    // We verify the function exists and returns false for non-watch paths.
    test("returns false for non-watch pages", () => {
      expect(content.isWatchPage()).toBe(false);
    });
  });

  describe("constants", () => {
    test("CLASS_NAME is ywf-active", () => {
      expect(content.CLASS_NAME).toBe("ywf-active");
    });

    test("STORAGE_KEY is ywf-enabled", () => {
      expect(content.STORAGE_KEY).toBe("ywf-enabled");
    });
  });
});
