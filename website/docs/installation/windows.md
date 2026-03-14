---
sidebar_position: 1
title: Windows Installation
description: Install ZENO Browser on Windows 10/11
---

# 🪟 Installing ZENO Browser on Windows

## Requirements

- Windows 10 (version 1903) or Windows 11
- 64-bit or 32-bit processor
- 4 GB RAM minimum (8 GB recommended)
- 500 MB free disk space

---

## Installer Method (Recommended)

### 1. Download

Go to the [Download page](/download) and choose:

| Version | File | When to use |
|---------|------|-------------|
| 64-bit  | `ZENO-Browser-Setup-x64.exe` | Most modern Windows PCs |
| 32-bit  | `ZENO-Browser-Setup-ia32.exe` | Older 32-bit systems |
| Portable | `ZENO-Browser-x64.exe` | No installation needed |

### 2. Run the Installer

1. Double-click the downloaded `.exe` file
2. If Windows SmartScreen appears, click **More info** → **Run anyway**  
   *(The app is not yet signed with a paid certificate — this is normal for open-source projects)*
3. Follow the installation wizard:
   - Choose installation directory (default: `C:\Program Files\ZENO Browser`)
   - Choose whether to create a Desktop shortcut
   - Click **Install**
4. Click **Finish** to launch ZENO Browser

### 3. Windows Defender / Antivirus

If your antivirus flags the installer, you can:
1. Verify the SHA-256 checksum from the [GitHub Release](https://github.com/Bonzokoles/zen-bro-wser.org/releases)
2. Add an exception for `ZENO Browser.exe`
3. Build from source (see below)

---

## Portable Version

No installation required. Simply download `ZENO-Browser-x64.exe` and run it directly.

Data is stored in `%APPDATA%\ZENO Browser\` regardless of where the executable is placed.

---

## Build from Source

```powershell
# 1. Install prerequisites
# - Node.js 20+ from https://nodejs.org
# - Git from https://git-scm.com

# 2. Clone repository
git clone https://github.com/Bonzokoles/zen-bro-wser.org.git
cd zen-bro-wser.org\ZENO_WEB_CORE_APP

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev
# Opens at http://localhost:4378

# 5. Build Electron app (optional)
cd ..
npm install --save-dev electron-builder
node scripts/build-nsis.js
```

---

## Uninstallation

### Via Control Panel
1. Open **Settings** → **Apps**
2. Find **ZENO Browser**
3. Click **Uninstall**

### Via Installer
Run the installer again and choose **Uninstall**.

### Clean Uninstall (remove user data)
```powershell
# After uninstalling the app, remove user data:
Remove-Item -Recurse -Force "$env:APPDATA\ZENO Browser"
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\ZENO Browser"
```

---

## Auto-Update

ZENO Browser includes an automatic update mechanism. When a new version is released:

1. You'll see a notification in the app
2. Click **Download Update**
3. Once downloaded, click **Restart to Update**

To check for updates manually: **Settings** → **About** → **Check for Updates**

To disable auto-updates: **Settings** → **Advanced** → **Disable Auto-Updates**

---

## Troubleshooting

### App won't start
- Try running as Administrator
- Check Windows Event Viewer for errors
- Reinstall the Visual C++ Redistributable

### Blank window on launch
```powershell
# Clear app cache
Remove-Item -Recurse -Force "$env:APPDATA\ZENO Browser\Cache"
```

### See also
- [Troubleshooting guide](/docs/troubleshooting)
- [GitHub Issues](https://github.com/Bonzokoles/zen-bro-wser.org/issues)
