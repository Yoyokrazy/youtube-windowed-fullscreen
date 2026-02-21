// YouTube Windowed Fullscreen - Content Script

(function () {
  "use strict";

  const CLASS_NAME = "ywf-active";
  const STORAGE_KEY = "ywf-enabled";

  function isWatchPage() {
    const path = window.location.pathname;
    return path === "/watch" || path.startsWith("/live/");
  }

  function isActive() {
    return document.documentElement.classList.contains(CLASS_NAME);
  }

  function createToggleElements() {
    if (document.getElementById("ywf-toggle-zone")) return;
    const player = document.getElementById("movie_player");
    if (!player) return;

    const zone = document.createElement("div");
    zone.id = "ywf-toggle-zone";
    player.appendChild(zone);

    const enterBtn = document.createElement("button");
    enterBtn.id = "ywf-enter";
    enterBtn.textContent = "Enter Windowed Fullscreen";
    enterBtn.addEventListener("click", () => {
      applyState(true);
      chrome.storage.local.set({ [STORAGE_KEY]: true });
    });
    player.appendChild(enterBtn);

    const exitBtn = document.createElement("button");
    exitBtn.id = "ywf-exit";
    exitBtn.textContent = "Exit Windowed Fullscreen";
    exitBtn.addEventListener("click", () => {
      applyState(false);
      chrome.storage.local.set({ [STORAGE_KEY]: false });
    });
    player.appendChild(exitBtn);
  }

  function applyState(enabled) {
    if (isWatchPage()) createToggleElements();
    if (enabled && isWatchPage()) {
      document.documentElement.classList.add(CLASS_NAME);
    } else {
      document.documentElement.classList.remove(CLASS_NAME);
    }
  }

  function toggle() {
    const newState = !isActive();
    applyState(newState);
    chrome.storage.local.set({ [STORAGE_KEY]: newState });
    return newState;
  }

  function shouldToggleOnKeydown(e) {
    if (!(e.altKey && e.shiftKey && e.key === "F" && !e.ctrlKey && !e.metaKey)) return false;
    const tag = e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) return false;
    return true;
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === "toggle") {
      const state = toggle();
      sendResponse({ active: state });
    } else if (message.action === "getState") {
      sendResponse({ active: isActive() });
    }
    return true;
  });

  // Keyboard shortcut: Alt+Shift+F
  document.addEventListener("keydown", (e) => {
    if (shouldToggleOnKeydown(e)) {
      e.preventDefault();
      toggle();
    }
  });

  // Handle YouTube SPA navigation
  function onNavigate() {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      applyState(!!result[STORAGE_KEY]);
    });
  }

  window.addEventListener("yt-navigate-finish", onNavigate);

  const titleObserver = new MutationObserver(() => {
    onNavigate();
  });

  const titleEl = document.querySelector("title");
  if (titleEl) {
    titleObserver.observe(titleEl, { childList: true });
  }

  onNavigate();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { CLASS_NAME, STORAGE_KEY, isWatchPage, isActive, applyState, toggle, shouldToggleOnKeydown };
  }
})();