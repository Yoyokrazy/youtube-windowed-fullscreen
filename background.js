// YouTube Windowed Fullscreen - Background Service Worker

function createMegaWindow(url, originWindowId, sendResponse) {
  chrome.windows.get(originWindowId, (win) => {
    chrome.windows.create({
      url: url,
      type: "popup",
      left: win.left,
      top: win.top,
      width: win.width,
      height: win.height,
    }, (newWin) => {
      chrome.storage.local.set({
        "ywf-mega-origin": win.id,
        "ywf-mega-window": newWin.id,
      });
      sendResponse({ success: true });
    });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openMega") {
    const originWindowId = sender.tab ? sender.tab.windowId : null;
    if (!originWindowId) { sendResponse({ success: false }); return true; }

    // Prevent duplicate mega windows
    chrome.storage.local.get("ywf-mega-window", (result) => {
      if (result["ywf-mega-window"]) {
        chrome.windows.update(result["ywf-mega-window"], { focused: true }, () => {
          if (chrome.runtime.lastError) {
            // Stale entry, create fresh
            createMegaWindow(message.url, originWindowId, sendResponse);
          } else {
            sendResponse({ success: true });
          }
        });
      } else {
        createMegaWindow(message.url, originWindowId, sendResponse);
      }
    });
    return true;
  }

  if (message.action === "closeMega") {
    if (sender.tab) {
      chrome.windows.remove(sender.tab.windowId, () => {
        chrome.runtime.lastError; // suppress
      });
    }
    sendResponse({ success: true });
    return true;
  }
});

// Cleanup when mega window is closed (X button, closeMega, etc.)
chrome.windows.onRemoved.addListener((windowId) => {
  chrome.storage.local.get(["ywf-mega-window", "ywf-mega-origin"], (result) => {
    if (result["ywf-mega-window"] === windowId) {
      chrome.storage.local.remove(["ywf-mega-origin", "ywf-mega-window"]);
      if (result["ywf-mega-origin"]) {
        chrome.windows.update(result["ywf-mega-origin"], { focused: true }, () => {
          chrome.runtime.lastError; // suppress if original was also closed
        });
      }
    }
  });
});
