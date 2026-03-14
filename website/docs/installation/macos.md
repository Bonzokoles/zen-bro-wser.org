---
sidebar_position: 2
title: macOS Installation
description: Install ZENO Browser on macOS
---

# 🍎 Installing ZENO Browser on macOS

## Requirements

- macOS 11 Big Sur or later
- Apple Silicon (M1/M2/M3) or Intel processor
- 4 GB RAM minimum (8 GB recommended)
- 500 MB free disk space

---

## DMG Installer (Recommended)

### 1. Download

Go to the [Download page](/download) and choose the right version:

| Version | File | When to use |
|---------|------|-------------|
| Apple Silicon | `ZENO-Browser-arm64.dmg` | M1, M2, M3 Macs |
| Intel | `ZENO-Browser-x64.dmg` | Intel-based Macs |

:::tip Not sure which chip you have?
Click the Apple menu → **About This Mac**. Look for "Apple M1/M2/M3" (Apple Silicon) or "Intel Core" (Intel).
:::

### 2. Install via Drag & Drop

1. Open the downloaded `.dmg` file
2. Drag **ZENO Browser** to the **Applications** folder
3. Eject the DMG by pressing ⌘+E or right-clicking → **Eject**

### 3. First Launch (Gatekeeper)

Since ZENO Browser is not yet notarized with an Apple Developer account:

1. Locate ZENO Browser in your **Applications** folder
2. Right-click (or Control+click) → **Open**
3. Click **Open** in the dialog that appears

After the first launch, you can open it normally.

Alternatively, to allow it system-wide:
```bash
# Allow the app to run
xattr -cr /Applications/ZENO\ Browser.app
```

---

## Homebrew (Community Cask)

```bash
# Install via Homebrew Cask (when available)
brew install --cask zeno-browser
```

---

## Build from Source

```bash
# 1. Install prerequisites
# - Node.js 20+ (via https://nodejs.org or brew install node)
# - Git (via Xcode: xcode-select --install or brew install git)

# 2. Clone repository
git clone https://github.com/Bonzokoles/zen-bro-wser.org.git
cd zen-bro-wser.org/ZENO_WEB_CORE_APP

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev
# Opens at http://localhost:4378

# 5. Build DMG (optional)
cd ..
npm install --save-dev electron-builder
node scripts/build-dmg.js --arch=arm64  # or x64 for Intel
```

---

## Uninstallation

### Standard uninstall
1. Open **Finder** → **Applications**
2. Drag **ZENO Browser** to the **Trash**
3. Empty the Trash

### Clean uninstall (remove all data)
```bash
# Remove app
sudo rm -rf /Applications/ZENO\ Browser.app

# Remove user data
rm -rf ~/Library/Application\ Support/ZENO\ Browser
rm -rf ~/Library/Caches/org.zenbrowsers.browser
rm -rf ~/Library/Preferences/org.zenbrowsers.browser.plist
rm -rf ~/Library/Logs/ZENO\ Browser
```

---

## Auto-Update

ZENO Browser checks for updates automatically. When available:

1. A notification appears in the dock / menu bar
2. Go to **Settings** → **About** → **Update Available**
3. Click **Download & Install**
4. The app will restart with the new version

---

## macOS Permissions

ZENO Browser may request:
- **Network access** — for browsing and AI API calls
- **Downloads folder** — for saving downloaded files
- **Notifications** — for update notifications

You can review and modify permissions in **System Settings** → **Privacy & Security**.

---

## Troubleshooting

### "ZENO Browser is damaged and can't be opened"
```bash
xattr -cr /Applications/ZENO\ Browser.app
```

### App crashes on startup
```bash
# Check crash logs
open ~/Library/Logs/DiagnosticReports/
```

### See also
- [Troubleshooting guide](/docs/troubleshooting)
- [GitHub Issues](https://github.com/Bonzokoles/zen-bro-wser.org/issues)
