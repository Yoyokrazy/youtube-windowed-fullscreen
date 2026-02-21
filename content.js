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

  function isMega() {
    return document.documentElement.classList.contains(MEGA_CLASS);
  }

  function createExitElements() {
    if (document.getElementById("ywf-exit-zone")) return;
    const zone = document.createElement("div");
    zone.id = "ywf-exit-zone";
    document.body.appendChild(zone);

    const btn = document.createElement("button");
    btn.id = "ywf-exit";
    btn.textContent = "Exit Window Fullscreen";
    btn.addEventListener("click", () => {
      applyState(false);
      chrome.storage.local.set({ [STORAGE_KEY]: false });
    });
    document.body.appendChild(btn);
  }

  function createMegaExitElements() {
    if (document.getElementById("ywf-mega-exit-zone")) return;
    const zone = document.createElement("div");
    zone.id = "ywf-mega-exit-zone";
    document.body.appendChild(zone);

    const btn = document.createElement("button");
    btn.id = "ywf-mega-exit";
    btn.textContent = "Exit App Fullscreen";
    btn.addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "closeMega" });
    });
    document.body.appendChild(btn);
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

  // Mega fullscreen: opens a chromeless popup window at the same size/position
  function enterMega() {
    if (!isWatchPage()) return;
    const video = document.querySelector("video");
    const time = video ? Math.floor(video.currentTime) : 0;
    // Pause the original video before opening app fullscreen
    if (video && !video.paused) video.pause();
    const url = new URL(window.location.href);
    url.searchParams.set("t", time + "s");
    url.hash = "ywf-mega";
    chrome.runtime.sendMessage({ action: "openMega", url: url.toString() });
  }

  function exitMega() {
    // Capture current timestamp before closing so origin tab can resume
    const video = document.querySelector("video");
    const time = video ? Math.floor(video.currentTime) : 0;
    chrome.runtime.sendMessage({ action: "closeMega", time: time });
  }

  function toggleMega() {
    if (isMega()) {
      exitMega();
    } else {
      enterMega();
    }
  }

  // Detect if this page was opened as a mega fullscreen popup
  function initMegaMode() {
    if (window.location.hash === "#ywf-mega") {
      history.replaceState(null, "", window.location.href.split("#")[0]);
      document.documentElement.classList.add(MEGA_CLASS);
      applyState(true);
      createMegaExitElements();
    }
  }

  // Listen for messages from popup or background
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === "toggle") {
      const state = toggle();
      sendResponse({ active: state });
    } else if (message.action === "toggleMega") {
      toggleMega();
      sendResponse({ mega: isMega() });
    } else if (message.action === "getState") {
      sendResponse({ active: isActive(), mega: isMega() });
    } else if (message.action === "resumeAt") {
      const video = document.querySelector("video");
      if (video) {
        video.currentTime = message.time;
        video.play().catch(() => {});
      }
      sendResponse({ ok: true });
    }
    return true;
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Escape exits mega popup
    if (e.key === "Escape" && isMega()) {
      e.preventDefault();
      exitMega();
      return;
    }
    // Ctrl+Alt+Shift+F for mega (check first since it's a superset)
    if (shouldMegaToggleOnKeydown(e)) {
      e.preventDefault();
      toggleMega();
      return;
    }
    // Alt+Shift+F for windowed fullscreen (disabled in mega popup)
    if (shouldToggleOnKeydown(e) && !isMega()) {
      e.preventDefault();
      toggle();
    }
  });

  // Handle YouTube SPA navigation
  function onNavigate() {
    if (isMega()) return; // Don't override mega state
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

  // Initial load
  initMegaMode();
  onNavigate();

  // Export for testing
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { CLASS_NAME, MEGA_CLASS, STORAGE_KEY, isWatchPage, isActive, isMega, applyState, toggle, toggleMega, shouldToggleOnKeydown, shouldMegaToggleOnKeydown };
  }
})();
