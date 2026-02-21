/**
 * Shared test utilities extracted from existing test patterns.
 */

/** Let async operations settle. */
const flushPromises = () => new Promise((r) => setTimeout(r, 50));

/** Build a mock keyboard event with sensible defaults for Alt+Shift+F. */
function makeKeyboardEvent(overrides = {}) {
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

/** Create the popup HTML elements in document.body. */
function setupPopupDOM() {
  document.body.innerHTML = `
    <span id="version"></span>
    <div id="update-banner"></div>
    <div id="status-msg"></div>
    <input type="checkbox" id="toggle">
  `;
}

/** Reset modules, load chrome-mock, and require the content script. */
function loadContentScript() {
  document.documentElement.className = "";
  jest.resetModules();
  require("../chrome-mock");
  return require("../../content");
}

/**
 * Reset modules, load chrome-mock with optional tab/message stubs,
 * set up the popup DOM, and require the popup script.
 */
function loadPopupScript(opts = {}) {
  jest.resetModules();
  require("../chrome-mock");

  if (opts.tabUrl !== undefined) {
    chrome.tabs.query.mockReturnValue(
      Promise.resolve([opts.tabUrl ? { id: 1, url: opts.tabUrl } : { id: 1 }])
    );
  }
  if (opts.sendMessageResponse !== undefined) {
    chrome.tabs.sendMessage.mockReturnValue(
      Promise.resolve(opts.sendMessageResponse)
    );
  }
  if (opts.sendMessageError) {
    chrome.tabs.sendMessage.mockReturnValue(
      Promise.reject(new Error("no content script"))
    );
  }

  setupPopupDOM();
  return require("../../popup");
}

module.exports = {
  flushPromises,
  makeKeyboardEvent,
  setupPopupDOM,
  loadContentScript,
  loadPopupScript,
};
