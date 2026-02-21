// YouTube Windowed Fullscreen - Content Script

(function () {
  "use strict";

  const CLASS_NAME = "ywf-active";
  const STORAGE_KEY = "ywf-enabled";

  // Returns false when the extension has been reloaded and this
  // orphaned content script should stop touching chrome.* APIs.
  function isContextValid() {
    return !!(chrome.runtime && chrome.runtime.id);
  }

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

    const ICON_ENTER = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M1.75 10a.75.75 0 0 1 .75.75v2.5c0 .138.112.25.25.25h2.5a.75.75 0 0 1 0 1.5h-2.5A1.75 1.75 0 0 1 1 13.25v-2.5a.75.75 0 0 1 .75-.75Zm12.5 0a.75.75 0 0 1 .75.75v2.5A1.75 1.75 0 0 1 13.25 15h-2.5a.75.75 0 0 1 0-1.5h2.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 .75-.75ZM2.75 2.5a.25.25 0 0 0-.25.25v2.5a.75.75 0 0 1-1.5 0v-2.5C1 1.784 1.784 1 2.75 1h2.5a.75.75 0 0 1 0 1.5ZM10 1.75a.75.75 0 0 1 .75-.75h2.5c.966 0 1.75.784 1.75 1.75v2.5a.75.75 0 0 1-1.5 0v-2.5a.25.25 0 0 0-.25-.25h-2.5a.75.75 0 0 1-.75-.75Z"/></svg>';
    const ICON_EXIT = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M10.75 1a.75.75 0 0 1 .75.75v2.5c0 .138.112.25.25.25h2.5a.75.75 0 0 1 0 1.5h-2.5A1.75 1.75 0 0 1 10 4.25v-2.5a.75.75 0 0 1 .75-.75Zm-5.5 0a.75.75 0 0 1 .75.75v2.5A1.75 1.75 0 0 1 4.25 6h-2.5a.75.75 0 0 1 0-1.5h2.5a.25.25 0 0 0 .25-.25v-2.5A.75.75 0 0 1 5.25 1ZM1 10.75a.75.75 0 0 1 .75-.75h2.5c.966 0 1.75.784 1.75 1.75v2.5a.75.75 0 0 1-1.5 0v-2.5a.25.25 0 0 0-.25-.25h-2.5a.75.75 0 0 1-.75-.75Zm9 1c0-.966.784-1.75 1.75-1.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.25.25 0 0 0-.25.25v2.5a.75.75 0 0 1-1.5 0Z"/></svg>';

    const enterBtn = document.createElement("button");
    enterBtn.id = "ywf-enter";
    enterBtn.innerHTML = ICON_ENTER;
    enterBtn.title = "Enter Windowed Fullscreen";
    enterBtn.addEventListener("click", () => {
      applyState(true);
      if (isContextValid()) chrome.storage.local.set({ [STORAGE_KEY]: true });
    });
    player.appendChild(enterBtn);

    const exitBtn = document.createElement("button");
    exitBtn.id = "ywf-exit";
    exitBtn.innerHTML = ICON_EXIT;
    exitBtn.title = "Exit Windowed Fullscreen";
    exitBtn.addEventListener("click", () => {
      applyState(false);
      if (isContextValid()) chrome.storage.local.set({ [STORAGE_KEY]: false });
    });
    player.appendChild(exitBtn);
  }

  function applyState(enabled) {
    if (isWatchPage()) createToggleElements();
    if (enabled && isWatchPage()) {
      document.documentElement.classList.add(CLASS_NAME);
    } else {
      document.documentElement.classList.remove(CLASS_NAME);
      // Trigger YouTube to recalculate player dimensions
      window.dispatchEvent(new Event("resize"));
    }
  }

  function toggle() {
    const newState = !isActive();
    applyState(newState);
    if (isContextValid()) chrome.storage.local.set({ [STORAGE_KEY]: newState });
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
    if (!isContextValid()) return;
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