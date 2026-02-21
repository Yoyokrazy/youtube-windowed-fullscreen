const toggle = document.getElementById("toggle");
const stateLabel = document.getElementById("state-label");
const statusMsg = document.getElementById("status-msg");

function updateUI(enabled) {
  toggle.checked = enabled;
  stateLabel.textContent = enabled ? "ON" : "OFF";
}

function showError(msg) {
  statusMsg.textContent = msg;
  statusMsg.style.display = "block";
  toggle.disabled = true;
}

function getActiveTab() {
  return chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => tabs[0]);
}

async function init() {
  const tab = await getActiveTab();

  if (!tab?.url?.includes("youtube.com/watch")) {
    showError("Navigate to a YouTube video first");
    return;
  }

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: "getState" });
    updateUI(!!response?.active);
  } catch {
    showError("Navigate to a YouTube video first");
  }
}

toggle.addEventListener("change", async () => {
  const tab = await getActiveTab();
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: "toggle" });
    updateUI(!!response?.active);
  } catch {
    showError("Could not reach the page");
    updateUI(false);
  }
});

init();
