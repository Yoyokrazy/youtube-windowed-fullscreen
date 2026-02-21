// YouTube Windowed Fullscreen - Background Service Worker

function createMegaWindow(url, originWindowId, originTabId, sendResponse) {
  chrome.windows.get(originWindowId, (win) => {
    chrome.windows.create({
      url: url,
      type: "popup",
      left: win.left,
      top: win.top,
      width: win.width,
      height: win.height,
    }, (newWin) => {
      // Fullscreen the popup to remove the title bar
      chrome.windows.update(newWin.id, { state: "fullscreen" });
      chrome.storage.local.set({
        "ywf-mega-origin": win.id,
        "ywf-mega-origin-tab": originTabId,
        "ywf-mega-window": newWin.id,
      });
      sendResponse({ success: true });
    });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openMega") {
    const originWindowId = sender.tab ? sender.tab.windowId : null;
    const originTabId = sender.tab ? sender.tab.id : null;
    if (!originWindowId) { sendResponse({ success: false }); return true; }

    // Prevent duplicate mega windows
    chrome.storage.local.get("ywf-mega-window", (result) => {
      if (result["ywf-mega-window"]) {
        chrome.windows.update(result["ywf-mega-window"], { focused: true }, () => {
          if (chrome.runtime.lastError) {
            createMegaWindow(message.url, originWindowId, originTabId, sendResponse);
          } else {
            sendResponse({ success: true });
          }
        });
      } else {
        createMegaWindow(message.url, originWindowId, originTabId, sendResponse);
      }
    });
    return true;
  }

  if (message.action === "closeMega") {
    // Send resume timestamp to origin tab before closing
    chrome.storage.local.get("ywf-mega-origin-tab", (result) => {
      const originTabId = result["ywf-mega-origin-tab"];
      if (originTabId && message.time !== undefined) {
        chrome.tabs.sendMessage(originTabId, {
          action: "resumeAt",
          time: message.time,
        }).catch(() => {});
      }
    });
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
      chrome.storage.local.remove(["ywf-mega-origin", "ywf-mega-origin-tab", "ywf-mega-window"]);
      if (result["ywf-mega-origin"]) {
        chrome.windows.update(result["ywf-mega-origin"], { focused: true }, () => {
          chrome.runtime.lastError; // suppress if original was also closed
        });
      }
    }
  });
});
