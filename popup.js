const toggle = document.getElementById("toggle");
const stateLabel = document.getElementById("state-label");
const statusMsg = document.getElementById("status-msg");
const updateBanner = document.getElementById("update-banner");

const localVersion = chrome.runtime.getManifest().version;
document.getElementById("version").textContent = "v" + localVersion;

async function checkForUpdate() {
  try {
    const res = await fetch(
      "https://raw.githubusercontent.com/Yoyokrazy/youtube-windowed-fullscreen/master/manifest.json",
      { cache: "no-store" }
    );
    if (!res.ok) return;
    const remote = await res.json();
    if (remote.version !== localVersion) {
      updateBanner.textContent = `Update available: v${remote.version}`;
      updateBanner.style.display = "block";
    }
  } catch {}
}

checkForUpdate();

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
