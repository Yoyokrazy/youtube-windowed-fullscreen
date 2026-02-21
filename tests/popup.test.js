require("./chrome-mock");

// Helper to set up popup DOM before requiring popup.js
function setupDOM() {
  document.body.innerHTML = `
    <span id="version"></span>
    <div id="update-banner"></div>
    <div id="status-msg"></div>
    <input type="checkbox" id="toggle">
    <input type="checkbox" id="mega-toggle">
  `;
}

// popup.js self-executes on require, so we need DOM ready first
function loadPopup(opts = {}) {
  jest.resetModules();
  require("./chrome-mock");

  if (opts.tabUrl !== undefined) {
    chrome.tabs.query.mockReturnValue(
      Promise.resolve([opts.tabUrl ? { id: 1, url: opts.tabUrl } : { id: 1 }])
    );
  }
  if (opts.sendMessageResponse !== undefined) {
    chrome.tabs.sendMessage.mockReturnValue(Promise.resolve(opts.sendMessageResponse));
  }
  if (opts.sendMessageError) {
    chrome.tabs.sendMessage.mockReturnValue(Promise.reject(new Error("no content script")));
  }

  setupDOM();
  return require("../popup");
}

// Let async init() settle
const flush = () => new Promise((r) => setTimeout(r, 50));

describe("popup.js", () => {
  describe("isNewer", () => {
    let popup;
    beforeAll(() => { popup = loadPopup(); });

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
    beforeEach(() => { popup = loadPopup(); });

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
    beforeEach(() => { popup = loadPopup(); });

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
      loadPopup({ tabUrl: "https://www.google.com" });
      await flush();
      const msg = document.getElementById("status-msg");
      expect(msg.textContent).toBe("Navigate to a YouTube video first");
      expect(msg.style.display).toBe("block");
    });

    test("shows error when tab has no URL", async () => {
      loadPopup({ tabUrl: null });
      await flush();
      const msg = document.getElementById("status-msg");
      expect(msg.textContent).toBe("Navigate to a YouTube video first");
    });

    test("shows error when content script unreachable", async () => {
      loadPopup({
        tabUrl: "https://www.youtube.com/watch?v=abc",
        sendMessageError: true,
      });
      await flush();
      const msg = document.getElementById("status-msg");
      expect(msg.textContent).toBe("Navigate to a YouTube video first");
    });

    test("updates UI with active state from content script", async () => {
      loadPopup({
        tabUrl: "https://www.youtube.com/watch?v=abc",
        sendMessageResponse: { active: true },
      });
      await flush();
      expect(document.getElementById("toggle").checked).toBe(true);
    });
  });

  describe("version display", () => {
    test("shows version from manifest", () => {
      loadPopup();
      expect(document.getElementById("version").textContent).toBe("v1.0.0");
    });
  });
});
