# YouTube Windowed Fullscreen

A Chrome extension that makes the YouTube video player expand to fill your entire browser window without entering OS-level fullscreen mode.

## Why?

When you want to maximize video viewing space while keeping your browser windowed—perfect for snapping your browser to one side of your monitor and using another app on the other side. Larger video, no full-screen escape required.

## Features

- **Toggle via extension icon** — Click the extension icon in your toolbar to expand/collapse the player
- **In-player toggle buttons** — Hover the upper-left corner of the video to reveal enter/exit icons ([Primer Octicons](https://primer.style/octicons))
- **Keyboard shortcut** — Press **Alt+Shift+F** to toggle windowed fullscreen anywhere on YouTube
- **YouTube Live support** — Works on `/watch` and `/live/` pages
- **Persists across navigation** — Your preference is remembered as you navigate between videos
- **Update detection** — The popup checks for new GitHub releases and notifies you when an update is available
- **Dark-themed popup** — Clean, minimal UI with a three-dot menu for quick access to the repo and bug reporting

## Build & Install

There is no build step — the extension is plain JS and CSS loaded directly by Chrome.

### 1. Get the source

```bash
git clone https://github.com/Yoyokrazy/youtube-windowed-fullscreen.git
```

Or download and extract the [latest release](https://github.com/Yoyokrazy/youtube-windowed-fullscreen/releases/latest).

### 2. Load into your browser

1. Navigate to `chrome://extensions` (or `edge://extensions` for Edge)
2. Enable **Developer mode** (toggle in the top right)
3. Click **Load unpacked**
4. Select the `youtube-windowed-fullscreen` folder (the one containing `manifest.json`)
5. The extension icon will appear in your toolbar — you're done

### Updating

After pulling new changes, bump the patch version and reload:

```powershell
powershell -ExecutionPolicy Bypass -File build.ps1
```

Then in your browser:
1. Go to `chrome://extensions` (or `edge://extensions`)
2. Click the **refresh icon** (↻) on the extension card
3. Reload any open YouTube tabs

> **Note:** Minor and major version bumps are handled exclusively by the GitHub Actions [release workflow](.github/workflows/release.yml). Only use `build.ps1` for local patch bumps.

## Usage

**Via Extension Icon:**
- Click the extension icon in your toolbar to open the popup and toggle windowed fullscreen on/off

**Via In-Player Buttons:**
- Hover the upper-left corner of the video player to reveal the enter/exit button

**Via Keyboard:**
- Press **Alt+Shift+F** on any YouTube video page to toggle

## How It Works

The extension uses a content script that injects CSS to make the YouTube player fill the viewport. When toggled on, it:
- Hides the page sidebar, header, and other non-player UI
- Makes the player container fill the entire window
- Maintains video playback controls and functionality

The extension respects your preference across YouTube's SPA navigation, so you won't need to re-toggle after watching multiple videos.

## Testing

```bash
npm test                   # run all tests
npm run test:unit          # run unit tests only
npx jest --coverage        # run with coverage reporting
```

## Compatibility

- Chrome, Edge, and other Chromium-based browsers
- Works on youtube.com watch and live pages (music.youtube.com not supported)

---

Made for a better windowed viewing experience. 📺
