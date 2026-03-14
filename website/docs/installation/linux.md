---
sidebar_position: 3
title: Linux Installation
description: Install ZENO Browser on Linux (AppImage, .deb, .rpm)
---

# 🐧 Installing ZENO Browser on Linux

## Requirements

- 64-bit Linux (x86_64)
- GLIBC 2.31+ (Ubuntu 20.04, Debian 11, Fedora 34+)
- 4 GB RAM minimum
- 500 MB free disk space

---

## AppImage (Universal — Recommended)

AppImage works on all major Linux distributions without installation.

### 1. Download

```bash
# Download from GitHub Releases
wget https://github.com/Bonzokoles/zen-bro-wser.org/releases/latest/download/ZENO-Browser-x86_64.AppImage
```

Or go to the [Download page](/download).

### 2. Make executable and run

```bash
# Make executable
chmod +x ZENO-Browser-x86_64.AppImage

# Run
./ZENO-Browser-x86_64.AppImage
```

### 3. Desktop Integration (optional)

```bash
# Install AppImage launcher for system integration
# Ubuntu/Debian:
sudo apt install libfuse2 appimagelauncher

# Then double-click the AppImage and choose "Integrate and run"
```

---

## Debian/Ubuntu (.deb)

```bash
# 1. Download
wget https://github.com/Bonzokoles/zen-bro-wser.org/releases/latest/download/ZENO-Browser_amd64.deb

# 2. Install
sudo dpkg -i ZENO-Browser_amd64.deb

# 3. Fix any dependency issues
sudo apt-get install -f

# 4. Launch
zeno-browser
# or find it in your Applications menu
```

**Supported distributions:** Ubuntu 20.04+, Debian 11+, Linux Mint 20+, Pop!_OS 20.04+, elementary OS 6+

---

## Fedora/RHEL/openSUSE (.rpm)

```bash
# Fedora / RHEL
sudo dnf install ZENO-Browser-x86_64.rpm

# openSUSE
sudo zypper install ZENO-Browser-x86_64.rpm

# Launch
zeno-browser
```

**Supported distributions:** Fedora 34+, RHEL 8+, AlmaLinux 8+, Rocky Linux 8+, openSUSE Leap 15.3+

---

## Snap (coming soon)

```bash
# Install from Snap Store (when available)
sudo snap install zeno-browser
```

---

## Build from Source

```bash
# 1. Install prerequisites
# Node.js 20+ (via https://nodejs.org or your package manager)
# Ubuntu/Debian:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Fedora:
sudo dnf install nodejs npm

# 2. Clone repository
git clone https://github.com/Bonzokoles/zen-bro-wser.org.git
cd zen-bro-wser.org/ZENO_WEB_CORE_APP

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev
# Opens at http://localhost:4378

# 5. Build AppImage (optional)
cd ..
npm install --save-dev electron-builder
sudo apt-get install -y rpm fakeroot  # For .deb and .rpm builds
node scripts/build-appimage.js --target=all
```

---

## Post-Installation

### Setting as default browser

```bash
# Make ZENO Browser the default browser
xdg-settings set default-web-browser zeno-browser.desktop

# Or through your desktop environment's settings
```

### File associations

```bash
# Register MIME types (if not done automatically)
xdg-mime default zeno-browser.desktop x-scheme-handler/http
xdg-mime default zeno-browser.desktop x-scheme-handler/https
```

---

## Uninstallation

```bash
# AppImage - just delete the file
rm ZENO-Browser-x86_64.AppImage

# .deb
sudo dpkg -r zeno-browser
# or
sudo apt remove zeno-browser

# .rpm (Fedora)
sudo dnf remove zeno-browser

# Remove user data
rm -rf ~/.config/ZENO\ Browser
rm -rf ~/.local/share/ZENO\ Browser
rm -rf ~/.cache/ZENO\ Browser
```

---

## Auto-Update

AppImage users can enable AppImageUpdate for delta updates:

```bash
# Install AppImageUpdate
wget https://github.com/AppImage/AppImageUpdate/releases/latest/download/appimageupdatetool-x86_64.AppImage
chmod +x appimageupdatetool-x86_64.AppImage

# Update ZENO Browser
./appimageupdatetool-x86_64.AppImage ZENO-Browser-x86_64.AppImage
```

For .deb and .rpm installs, updates come through your system package manager when the ZENO Browser repository is configured.

---

## Troubleshooting

### "FUSE not available" error (AppImage)
```bash
# Ubuntu 22.04+
sudo apt install libfuse2

# Or run AppImage with extraction:
./ZENO-Browser-x86_64.AppImage --appimage-extract
./squashfs-root/AppRun
```

### Missing libraries
```bash
# Ubuntu/Debian
sudo apt install \
  libnss3 libatk1.0-0 libatk-bridge2.0-0 \
  libx11-xcb1 libxcomposite1 libxdamage1 \
  libxrandr2 libgbm1 libasound2

# Fedora
sudo dnf install nss atk at-spi2-atk libX11 libxcomposite libxdamage libxrandr mesa-libgbm alsa-lib
```

### See also
- [Troubleshooting guide](/docs/troubleshooting)
- [GitHub Issues](https://github.com/Bonzokoles/zen-bro-wser.org/issues)
