---
sidebar_position: 11
title: Troubleshooting
description: Common issues and how to resolve them
---

# 🛠️ Troubleshooting

## Installation Issues

### Windows: "Windows protected your PC" (SmartScreen)

**Cause:** App not yet signed with an Authenticode certificate.

**Solution:**
1. Click **More info**
2. Click **Run anyway**

### macOS: "App is damaged and can't be opened"

**Cause:** Gatekeeper quarantine attribute.

**Solution:**
```bash
xattr -cr /Applications/ZENO\ Browser.app
```
Then right-click → Open.

### Linux: "FUSE: user namespace is restricted"

**Cause:** AppImage requires FUSE on modern kernels.

**Solution:**
```bash
# Ubuntu 22.04+
sudo apt install libfuse2

# Or extract and run directly
./ZENO-Browser-x86_64.AppImage --appimage-extract
./squashfs-root/AppRun
```

---

## Startup Issues

### App shows blank/white screen

1. Clear app cache:
   - Windows: Delete `%APPDATA%\ZENO Browser\Cache`
   - macOS: Delete `~/Library/Caches/org.zenbrowsers.browser`
   - Linux: Delete `~/.cache/ZENO Browser`

2. Reset app data (last resort):
   - Windows: Delete `%APPDATA%\ZENO Browser`
   - macOS: Delete `~/Library/Application Support/ZENO Browser`
   - Linux: Delete `~/.config/ZENO Browser`

### App crashes immediately

**Enable crash logging:**
```bash
# Linux/macOS
ELECTRON_ENABLE_LOGGING=1 ./ZENO-Browser --verbose

# Windows (PowerShell)
$env:ELECTRON_ENABLE_LOGGING="1"
& "ZENO Browser.exe" --verbose
```

Check the log output for error messages.

---

## AI Features

### "Invalid API Key" error

1. Verify the key is correct (no extra spaces)
2. Check the key is active in the provider's dashboard
3. Ensure the key has the required permissions

### AI responses are very slow

1. Switch to a faster model (e.g., Gemini Flash)
2. Check your internet connection speed
3. For local models, check your GPU/CPU utilization

### "Rate limit exceeded" error

1. Wait a few minutes and retry
2. Upgrade your API plan
3. Use a different AI provider as fallback
4. Enable the AI Gateway load balancer (Settings → Advanced)

### AI can't see page content

Some pages use dynamic rendering (JavaScript-heavy SPAs). Try:
1. Wait for the page to fully load before asking AI
2. Use the **page_summarizer** tool explicitly
3. Select text on the page before asking AI

---

## Network Issues

### Pages won't load

1. Check your internet connection
2. Verify DNS is working: `ping google.com`
3. Disable any VPN/proxy temporarily
4. Clear the browser cache

### CORS errors in developer console

For local development, add the `--disable-web-security` flag (development only):
```bash
# Development only - never use in production
ZENO-Browser --disable-web-security --user-data-dir=/tmp/zeno-test
```

---

## Update Issues

### Auto-update not working

1. Check **Settings** → **About** → verify auto-updates are enabled
2. Ensure the app has internet access
3. Try manual update: **Settings** → **About** → **Check for Updates**
4. Download the latest installer manually from [GitHub Releases](https://github.com/Bonzokoles/zen-bro-wser.org/releases)

---

## Getting More Help

If none of the above solutions work:

1. **Check existing issues**: [GitHub Issues](https://github.com/Bonzokoles/zen-bro-wser.org/issues)
2. **Open a new issue**: Include your OS version, ZENO Browser version, and steps to reproduce
3. **Community help**: [GitHub Discussions](https://github.com/Bonzokoles/zen-bro-wser.org/discussions)

When reporting a bug, please include:
- ZENO Browser version (Settings → About)
- Operating system and version
- Steps to reproduce the issue
- Expected vs actual behavior
- Any error messages from the developer console (F12)
