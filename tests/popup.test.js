require("./chrome-mock");

describe("popup.js", () => {
  let popup;

  beforeEach(() => {
    // Set up popup DOM
    document.body.innerHTML = `
      <span id="version"></span>
      <div id="update-banner"></div>
      <div id="status-msg"></div>
      <span id="state-label">OFF</span>
      <input type="checkbox" id="toggle">
    `;

    // Reset mocks
    jest.resetModules();
    global.fetch = jest.fn();
    chrome.runtime.getManifest.mockReturnValue({ version: "1.0.0" });
    chrome.tabs.query.mockResolvedValue([{ id: 1, url: "https://www.youtube.com/watch?v=abc" }]);
    chrome.tabs.sendMessage.mockResolvedValue({ active: false });

    require("./chrome-mock");
    popup = require("../popup");
  });

  describe("isNewer", () => {
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
    test("sets toggle checked and label to ON when enabled", () => {
      popup.updateUI(true);
      expect(document.getElementById("toggle").checked).toBe(true);
      expect(document.getElementById("state-label").textContent).toBe("ON");
    });

    test("sets toggle unchecked and label to OFF when disabled", () => {
      popup.updateUI(false);
      expect(document.getElementById("toggle").checked).toBe(false);
      expect(document.getElementById("state-label").textContent).toBe("OFF");
    });
  });

  describe("showError", () => {
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
      chrome.tabs.query.mockResolvedValue([{ id: 1, url: "https://www.google.com" }]);
      jest.resetModules();
      require("./chrome-mock");

      document.body.innerHTML = `
        <span id="version"></span>
        <div id="update-banner"></div>
        <div id="status-msg"></div>
        <span id="state-label">OFF</span>
        <input type="checkbox" id="toggle">
      `;

      require("../popup");
      // Wait for async init
      await new Promise((r) => setTimeout(r, 50));

      const msg = document.getElementById("status-msg");
      expect(msg.textContent).toBe("Navigate to a YouTube video first");
      expect(msg.style.display).toBe("block");
    });

    test("shows error when tab has no URL", async () => {
      chrome.tabs.query.mockResolvedValue([{ id: 1 }]);
      jest.resetModules();
      require("./chrome-mock");

      document.body.innerHTML = `
        <span id="version"></span>
        <div id="update-banner"></div>
        <div id="status-msg"></div>
        <span id="state-label">OFF</span>
        <input type="checkbox" id="toggle">
      `;

      require("../popup");
      await new Promise((r) => setTimeout(r, 50));

      const msg = document.getElementById("status-msg");
      expect(msg.textContent).toBe("Navigate to a YouTube video first");
    });
  });

  describe("version display", () => {
    test("shows version from manifest", () => {
      expect(document.getElementById("version").textContent).toBe("v1.0.0");
    });
  });
});
