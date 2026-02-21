const { loadPopupScript, flushPromises } = require("./helpers/test-utils");

describe("popup.js", () => {
  describe("isNewer", () => {
    let popup;
    beforeAll(() => { popup = loadPopupScript(); });

    test("returns true when remote major is higher", () => {
      expect(popup.isNewer("2.0.0", "1.0.0")).toBe(true);
    });

    test("returns true when remote minor is higher", () => {
      expect(popup.isNewer("1.1.0", "1.0.0")).toBe(true);
    });

    test("returns true when remote patch is higher", () => {
      expect(popup.isNewer("1.0.1", "1.0.0")).toBe(true);
    });

    test("returns false when versions are equal", () => {
      expect(popup.isNewer("1.0.0", "1.0.0")).toBe(false);
    });

    test("returns false when remote is older (major)", () => {
      expect(popup.isNewer("1.0.0", "2.0.0")).toBe(false);
    });

    test("returns false when remote is older (minor)", () => {
      expect(popup.isNewer("1.0.0", "1.1.0")).toBe(false);
    });

    test("returns false when remote is older (patch)", () => {
      expect(popup.isNewer("1.0.0", "1.0.1")).toBe(false);
    });

    test("handles multi-digit versions", () => {
      expect(popup.isNewer("1.0.10", "1.0.9")).toBe(true);
      expect(popup.isNewer("1.0.9", "1.0.10")).toBe(false);
    });

    test("higher minor beats higher patch", () => {
      expect(popup.isNewer("1.1.0", "1.0.9")).toBe(true);
    });

    test("higher major beats everything", () => {
      expect(popup.isNewer("2.0.0", "1.9.9")).toBe(true);
    });
  });

  describe("updateUI", () => {
    let popup;
    beforeEach(() => { popup = loadPopupScript(); });

    test("sets toggle checked when enabled", () => {
      popup.updateUI(true);
      expect(document.getElementById("toggle").checked).toBe(true);
    });

    test("sets toggle unchecked when disabled", () => {
      popup.updateUI(false);
      expect(document.getElementById("toggle").checked).toBe(false);
    });
  });

  describe("showError", () => {
    let popup;
    beforeEach(() => { popup = loadPopupScript(); });

    test("displays error message and disables toggle", () => {
      popup.showError("Test error");
      const msg = document.getElementById("status-msg");
      expect(msg.textContent).toBe("Test error");
      expect(msg.style.display).toBe("block");
      expect(document.getElementById("toggle").disabled).toBe(true);
    });
  });

  describe("init", () => {
    test("shows error when not on YouTube", async () => {
      loadPopupScript({ tabUrl: "https://www.google.com" });
      await flushPromises();
      const msg = document.getElementById("status-msg");
      expect(msg.textContent).toBe("Navigate to a YouTube video first");
      expect(msg.style.display).toBe("block");
    });

    test("shows error when tab has no URL", async () => {
      loadPopupScript({ tabUrl: null });
      await flushPromises();
      const msg = document.getElementById("status-msg");
      expect(msg.textContent).toBe("Navigate to a YouTube video first");
    });

    test("shows error when content script unreachable", async () => {
      loadPopupScript({
        tabUrl: "https://www.youtube.com/watch?v=abc",
        sendMessageError: true,
      });
      await flushPromises();
      const msg = document.getElementById("status-msg");
      expect(msg.textContent).toBe("Navigate to a YouTube video first");
    });

    test("updates UI with active state from content script", async () => {
      loadPopupScript({
        tabUrl: "https://www.youtube.com/watch?v=abc",
        sendMessageResponse: { active: true },
      });
      await flushPromises();
      expect(document.getElementById("toggle").checked).toBe(true);
    });
  });

  describe("version display", () => {
    test("shows version from manifest", () => {
      loadPopupScript();
      expect(document.getElementById("version").textContent).toBe("v1.0.0");
    });
  });
});
