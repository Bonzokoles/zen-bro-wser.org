#!/bin/bash
# ZENO Browser - Cross-Platform Installer Builder
set -e

echo "🚀 ZENO Browser v0.2.0 - Building All Installers"
echo "=================================================="

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Check dependencies
command -v node >/dev/null 2>&1 || { echo "❌ Node.js required"; exit 1; }

echo ""
echo "📦 Building web application..."
cd ZENO_WEB_CORE_APP && npm run build && cd ..

echo ""
echo "🏗️  Building installers..."

PLATFORM="${1:-all}"

case "$PLATFORM" in
  win)
    echo "🪟 Building Windows NSIS installer..."
    node scripts/build-nsis.js
    ;;
  mac)
    echo "🍎 Building macOS DMG..."
    node scripts/build-dmg.js
    ;;
  linux)
    echo "🐧 Building Linux AppImage..."
    node scripts/build-appimage.js
    ;;
  all|*)
    echo "Building all platforms..."
    node scripts/build-nsis.js || echo "⚠️  Windows build failed (requires Windows)"
    node scripts/build-dmg.js || echo "⚠️  macOS build failed (requires macOS)"
    node scripts/build-appimage.js || echo "⚠️  Linux build requires AppImageTool"
    ;;
esac

echo ""
echo "✅ Build complete! Check dist-electron/ for output."
