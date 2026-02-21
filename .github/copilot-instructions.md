# Copilot Instructions

## Project Overview

Chrome Manifest V3 extension that makes the YouTube video player fill the entire browser viewport (windowed fullscreen) — no build step, no bundler, no dependencies. Plain JS/CSS injected directly by Chrome.

## Architecture

**Toggle mechanism:** The CSS class `ywf-active` on `<html>` drives everything. `content.css` contains all visual rules gated behind `html.ywf-active` selectors. `content.js` toggles the class and persists state via `chrome.storage.local` (key: `ywf-enabled`).

**Popup ↔ Content script communication:** The popup sends `{action: "toggle"}` or `{action: "getState"}` via `chrome.tabs.sendMessage`. The content script responds with `{active: boolean}`. Keep this contract consistent across both files.

**YouTube SPA handling:** YouTube doesn't do full page reloads between videos. The content script listens for the `yt-navigate-finish` custom event and has a `MutationObserver` fallback on `<title>` to reapply state. The mode only activates on `/watch` pages. The keyboard shortcut is `Alt+Shift+F` (not `Alt+F`, which opens Chrome's menu).

## Key Conventions

- All CSS overrides use `!important` because YouTube applies inline styles and high-specificity selectors that must be defeated.
- The content script runs as an IIFE to avoid polluting the global scope.
- No build/transpile step — edit files directly and reload the extension in `chrome://extensions`.
- Run `powershell -ExecutionPolicy Bypass -File build.ps1` to bump the patch version before reloading. Pass `minor` or `major` to bump those instead. The version shows in the popup.
- The popup uses inline `<style>` in `popup.html` (no separate CSS file) to keep it self-contained.

## Testing

No automated tests. To test manually:
1. Go to `chrome://extensions`, enable Developer Mode, click "Load unpacked" and select the project root.
2. After code changes, click the refresh icon on the extension card in `chrome://extensions`.
3. Reload the YouTube tab and verify toggle via the popup icon or `Alt+F`.

## YouTube DOM Selectors

YouTube updates its DOM structure periodically. If the extension breaks after a YouTube update, these are the critical selectors to audit in `content.css`:

- Player: `#movie_player`, `ytd-player`
- Player containers: `#player-theater-container`, `#player-container-outer`, `#player-container-inner`
- Hidden elements: `ytd-masthead`, `#secondary`, `#below`, `#masthead-container`
- Controls: `.ytp-chrome-bottom`, `.ytp-gradient-bottom`, `.ytp-popup`, `.ytp-settings-menu`
