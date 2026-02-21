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

// Three-dot menu
const menuBtn = document.getElementById("menu-btn");
const menuDropdown = document.getElementById("menu-dropdown");

if (menuBtn) {
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    menuDropdown.classList.toggle("open");
  });

  document.addEventListener("click", () => {
    menuDropdown.classList.remove("open");
  });
}

// Bug report link with auto-filled version and browser info
const reportBug = document.getElementById("report-bug");
if (reportBug) {
  reportBug.addEventListener("click", (e) => {
    e.preventDefault();
    const ua = navigator.userAgent;
    let browser = "Unknown";
    if (ua.includes("Edg/")) {
      const v = ua.match(/Edg\/([\d.]+)/);
      browser = "Microsoft Edge " + (v ? v[1] : "");
    } else if (ua.includes("Chrome/")) {
      const v = ua.match(/Chrome\/([\d.]+)/);
      browser = "Google Chrome " + (v ? v[1] : "");
    } else if (ua.includes("Firefox/")) {
      const v = ua.match(/Firefox\/([\d.]+)/);
      browser = "Firefox " + (v ? v[1] : "");
    } else if (ua.includes("Safari/")) {
      const v = ua.match(/Version\/([\d.]+)/);
      browser = "Safari " + (v ? v[1] : "");
    }
    let os = "Unknown";
    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac OS X")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("CrOS")) os = "ChromeOS";

    const body = `**Extension Version:** v${localVersion}\n**Platform:** ${browser} on ${os}\n\n<details>\n<summary>Full user agent</summary>\n\n\`\`\`\n${ua}\n\`\`\`\n</details>\n\n**Description:**\n\n**Steps to reproduce:**\n1. \n2. \n3. \n`;
    const url = `https://github.com/Yoyokrazy/youtube-windowed-fullscreen/issues/new?body=${encodeURIComponent(body)}`;
    chrome.tabs.create({ url });
  });
}

// Export for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = { isNewer, updateUI, showError, init };
}
