# YouTube Windowed Fullscreen

A Chrome extension that makes the YouTube video player expand to fill your entire browser window without entering OS-level fullscreen mode.

## Why?

When you want to maximize video viewing space while keeping your browser windowed—perfect for snapping your browser to one side of your monitor and using another app on the other side. Larger video, no full-screen escape required.

## Features

- **Toggle via extension icon** — Click the extension icon in your Chrome toolbar to expand/collapse the player
- **Keyboard shortcut** — Press **Alt+Shift+F** to toggle windowed fullscreen anywhere on YouTube
- **Persists across navigation** — Your preference is remembered as you navigate between videos
- **Dark-themed popup** — Clean, minimal UI that matches YouTube's aesthetic

## Build & Install

There is no build step — the extension is plain JS and CSS loaded directly by Chrome.

### 1. Get the source

```bash
git clone https://github.com/Yoyokrazy/youtube-windowed-fullscreen.git
```

Or download and extract the [latest zip from GitHub](https://github.com/Yoyokrazy/youtube-windowed-fullscreen/archive/refs/heads/master.zip).

### 2. Load into Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top right)
3. Click **Load unpacked**
4. Select the `youtube-windowed-fullscreen` folder (the one containing `manifest.json`)
5. The extension icon will appear in your toolbar — you're done

### Updating

After pulling new changes or editing files locally:

1. Go to `chrome://extensions`
2. Click the **refresh icon** (↻) on the extension card
3. Reload any open YouTube tabs

## Usage

**Via Extension Icon:**
- Click the extension icon in your toolbar to toggle windowed fullscreen on/off

**Via Keyboard:**
- Press **Alt+Shift+F** on any YouTube video page to toggle

The video player will expand to fill the entire browser window. Exit by clicking the icon or pressing Alt+Shift+F again.

## How It Works

The extension uses a content script that injects CSS to make the YouTube player fill the viewport. When toggled on, it:
- Hides the page sidebar and header
- Makes the player container fill the entire window
- Maintains video playback controls and functionality

The extension respects your preference across navigation, so you won't need to re-toggle after watching multiple videos.

## Compatibility

- Chrome/Chromium-based browsers
- Works on youtube.com (music.youtube.com not supported)

---

Made for a better windowed viewing experience. 📺
