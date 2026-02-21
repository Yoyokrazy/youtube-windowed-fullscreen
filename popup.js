const toggle = document.getElementById("toggle");
const stateLabel = document.getElementById("state-label");
const statusMsg = document.getElementById("status-msg");
const updateBanner = document.getElementById("update-banner");

const localVersion = chrome.runtime.getManifest().version;
document.getElementById("version").textContent = "v" + localVersion;

function isNewer(remote, local) {
  const r = remote.split(".").map(Number);
  const l = local.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if (r[i] > l[i]) return true;
    if (r[i] < l[i]) return false;
  }
  return false;
}

async function checkForUpdate() {
  try {
    const res = await fetch(
      "https://raw.githubusercontent.com/Yoyokrazy/youtube-windowed-fullscreen/master/manifest.json",
      { cache: "no-store" }
    );
    if (!res.ok) return;
    const text = (await res.text()).replace(/^\uFEFF/, "");
    const remote = JSON.parse(text);
    if (isNewer(remote.version, localVersion)) {
      updateBanner.innerHTML =
        `Update available: v${remote.version}<br><button id="reload-btn">Reload Extension</button>`;
      updateBanner.style.display = "block";
      document.getElementById("reload-btn").addEventListener("click", () => {
        chrome.runtime.reload();
      });
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
