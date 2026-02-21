# YouTube Windowed Fullscreen

A Chrome extension that makes the YouTube video player expand to fill your entire browser window without entering OS-level fullscreen mode.

## Why?

When you want to maximize video viewing space while keeping your browser windowed—perfect for snapping your browser to one side of your monitor and using another app on the other side. Larger video, no full-screen escape required.

## Features

- **Toggle via extension icon** — Click the extension icon in your Chrome toolbar to expand/collapse the player
- **Keyboard shortcut** — Press **Alt+F** to toggle windowed fullscreen anywhere on YouTube
- **Persists across navigation** — Your preference is remembered as you navigate between videos
- **Dark-themed popup** — Clean, minimal UI that matches YouTube's aesthetic

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (toggle in the top right)
4. Click **Load unpacked**
5. Select the extension folder
6. The extension is now installed and ready to use

## Usage

**Via Extension Icon:**
- Click the extension icon in your toolbar to toggle windowed fullscreen on/off

**Via Keyboard:**
- Press **Alt+F** on any YouTube video page to toggle

The video player will expand to fill the entire browser window. Exit by clicking the icon or pressing Alt+F again.

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
