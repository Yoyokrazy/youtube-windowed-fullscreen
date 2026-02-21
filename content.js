// YouTube Windowed Fullscreen - Content Script

(function () {
  "use strict";

  const CLASS_NAME = "ywf-active";
  const MEGA_CLASS = "ywf-mega";
  const STORAGE_KEY = "ywf-enabled";

  function isWatchPage() {
    return window.location.pathname === "/watch";
  }

  function isActive() {
    return document.documentElement.classList.contains(CLASS_NAME);
  }

  function applyState(enabled) {
    if (enabled && isWatchPage()) {
      document.documentElement.classList.add(CLASS_NAME);
      createExitElements();
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

  function shouldMegaToggleOnKeydown(e) {
    if (!(e.ctrlKey && e.altKey && e.shiftKey && e.key === "F" && !e.metaKey)) return false;
    const tag = e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) return false;
    return true;
  }

  // Mega fullscreen: uses the browser Fullscreen API
  function isMega() {
    return document.documentElement.classList.contains(MEGA_CLASS);
  }

  function createExitElements() {
    if (!document.getElementById("ywf-exit-zone")) {
      const zone = document.createElement("div");
      zone.id = "ywf-exit-zone";
      document.body.appendChild(zone);

      const btn = document.createElement("button");
      btn.id = "ywf-exit";
      btn.textContent = "Exit Windowed Fullscreen";
      btn.addEventListener("click", () => {
        applyState(false);
        chrome.storage.local.set({ [STORAGE_KEY]: false });
      });
      document.body.appendChild(btn);
    }
  }

  function createMegaExitElements() {
    if (document.getElementById("ywf-mega-exit-zone")) return;
    const zone = document.createElement("div");
    zone.id = "ywf-mega-exit-zone";
    document.body.appendChild(zone);

    const btn = document.createElement("button");
    btn.id = "ywf-mega-exit";
    btn.textContent = "Exit Fullscreen";
    btn.addEventListener("click", () => exitMega());
    document.body.appendChild(btn);
  }

  async function enterMega() {
    if (!isWatchPage()) return;
    // Ensure windowed fullscreen is active first
    if (!isActive()) {
      applyState(true);
      chrome.storage.local.set({ [STORAGE_KEY]: true });
    }
    createExitElements();
    createMegaExitElements();
    document.documentElement.classList.add(MEGA_CLASS);
    try {
      await document.documentElement.requestFullscreen();
    } catch {}
  }

  function exitMega() {
    document.documentElement.classList.remove(MEGA_CLASS);
    // Also exit windowed fullscreen — return to base YouTube
    applyState(false);
    chrome.storage.local.set({ [STORAGE_KEY]: false });
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }

  function toggleMega() {
    if (isMega()) {
      exitMega();
    } else {
      enterMega();
    }
  }

  // Exit mega mode when browser exits fullscreen (e.g. Escape key)
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement && isMega()) {
      document.documentElement.classList.remove(MEGA_CLASS);
      // Return to base YouTube state
      applyState(false);
      chrome.storage.local.set({ [STORAGE_KEY]: false });
    }
  });

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === "toggle") {
      const state = toggle();
      sendResponse({ active: state });
    } else if (message.action === "toggleMega") {
      toggleMega();
      sendResponse({ mega: isMega() });
    } else if (message.action === "getState") {
      sendResponse({ active: isActive(), mega: isMega() });
    }
    return true;
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Ctrl+Alt+Shift+F for mega (check first since it's a superset)
    if (shouldMegaToggleOnKeydown(e)) {
      e.preventDefault();
      toggleMega();
      return;
    }
    // Alt+Shift+F for windowed fullscreen
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

  // YouTube fires this custom event on SPA navigation
  window.addEventListener("yt-navigate-finish", onNavigate);

  // Fallback: MutationObserver on <title> to catch navigation
  const titleObserver = new MutationObserver(() => {
    onNavigate();
  });

  const titleEl = document.querySelector("title");
  if (titleEl) {
    titleObserver.observe(titleEl, { childList: true });
  }

  // Initial load: restore saved state
  onNavigate();

  // Export for testing
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { CLASS_NAME, MEGA_CLASS, STORAGE_KEY, isWatchPage, isActive, isMega, applyState, toggle, toggleMega, shouldToggleOnKeydown, shouldMegaToggleOnKeydown };
  }
})();
