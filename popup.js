const toggle = document.getElementById("toggle");
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
  let localFileVersion = null;
  let remoteVersion = null;

  // Check 1: local files on disk vs loaded extension
  try {
    const localUrl = chrome.runtime.getURL("manifest.json");
    const localRes = await fetch(localUrl, { cache: "no-store" });
    if (localRes.ok) {
      const localText = (await localRes.text()).replace(/^\uFEFF/, "");
      const localManifest = JSON.parse(localText);
      localFileVersion = localManifest.version;
    }
  } catch {}

  // Check 2: latest GitHub release tag
  try {
    const res = await fetch(
      "https://api.github.com/repos/Yoyokrazy/youtube-windowed-fullscreen/releases/latest",
      { cache: "no-store" }
    );
    if (res.ok) {
      const release = JSON.parse(await res.text());
      remoteVersion = release.tag_name.replace(/^v/, "");
    }
  } catch {}

  const localNewer = localFileVersion && isNewer(localFileVersion, localVersion);
  const remoteNewer = remoteVersion && isNewer(remoteVersion, localVersion);

  if (localNewer) {
    // Local files updated, ready to reload — green box
    showReadyBanner(localFileVersion);
  } else if (remoteNewer && !localNewer) {
    // Remote is ahead but local files haven't been pulled yet — blue box
    updateBanner.className = "";
    updateBanner.innerHTML =
      `v${remoteVersion} available — pull latest in your extension directory, then reload`;
    updateBanner.style.display = "block";
    // Poll local manifest every 2s to detect when they pull
    const pollInterval = setInterval(async () => {
      try {
        const localUrl = chrome.runtime.getURL("manifest.json");
        const res = await fetch(localUrl, { cache: "no-store" });
        if (!res.ok) return;
        const text = (await res.text()).replace(/^\uFEFF/, "");
        const polledVersion = JSON.parse(text).version;
        if (isNewer(polledVersion, localVersion)) {
          clearInterval(pollInterval);
          showReadyBanner(polledVersion);
        }
      } catch {}
    }, 2000);
  }
}

function showReadyBanner(version) {
  updateBanner.className = "ready";
  updateBanner.innerHTML =
    `v${version} detected<br><button id="reload-btn">Reload</button>`;
  updateBanner.style.display = "block";
  document.getElementById("reload-btn").addEventListener("click", () => {
    chrome.runtime.reload();
  });
}

checkForUpdate();

function updateUI(enabled) {
  toggle.checked = enabled;
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

    const body = `**Description:**\n\n**Steps to reproduce:**\n1. \n2. \n3. \n\n---\n\n**Extension Version:** v${localVersion}\n**Platform:** ${browser} on ${os}\n\n<details>\n<summary>User agent</summary>\n\n\`\`\`\n${ua}\n\`\`\`\n</details>\n`;
    const url = `https://github.com/Yoyokrazy/youtube-windowed-fullscreen/issues/new?body=${encodeURIComponent(body)}`;
    chrome.tabs.create({ url });
  });
}

// Export for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = { isNewer, updateUI, showError, init };
}
