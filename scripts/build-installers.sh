#!/bin/bash
# ============================================================
# ZENO Browser - Cross-Platform Installer Builder
# ============================================================
# Builds installers for Windows, macOS, and Linux.
#
# Usage:
#   ./scripts/build-installers.sh [windows|macos|linux|all] [options]
#
# Options:
#   --sign          Enable code signing
#   --notarize      Enable macOS notarization (requires --sign)
#   --arch=<arch>   Target architecture (x64, arm64, ia32, both, universal)
#   --clean         Clean dist-electron before building
#
# Examples:
#   ./scripts/build-installers.sh all
#   ./scripts/build-installers.sh windows --arch=x64 --sign
#   ./scripts/build-installers.sh macos --sign --notarize
#   ./scripts/build-installers.sh linux --arch=both
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ── Parse arguments ─────────────────────────────────────────
TARGET="${1:-all}"
shift 2>/dev/null || true

SIGN=false
NOTARIZE=false
ARCH="x64"
CLEAN=false

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --sign)         SIGN=true ;;
    --notarize)     NOTARIZE=true ;;
    --arch=*)       ARCH="${1#*=}" ;;
    --clean)        CLEAN=true ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
  shift
done

# ── Banner ───────────────────────────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║   ZENO Browser - Cross-Platform Builder      ║${NC}"
echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Target:      ${BOLD}${TARGET}${NC}"
echo -e "  Arch:        ${BOLD}${ARCH}${NC}"
echo -e "  Code signing: $([ "$SIGN" = true ] && echo "${GREEN}enabled${NC}" || echo "disabled")"
echo -e "  Notarization: $([ "$NOTARIZE" = true ] && echo "${GREEN}enabled${NC}" || echo "disabled")"
echo ""

# ── Prerequisites check ──────────────────────────────────────
check_node() {
  if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is required but not installed.${NC}"
    exit 1
  fi
  echo -e "${GREEN}  ✅ Node.js $(node --version)${NC}"
}

check_npm() {
  if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is required but not installed.${NC}"
    exit 1
  fi
  echo -e "${GREEN}  ✅ npm $(npm --version)${NC}"
}

echo "🔍 Checking prerequisites..."
check_node
check_npm

# Install electron-builder if not present
if ! npx electron-builder --version &> /dev/null 2>&1; then
  echo -e "${YELLOW}  Installing electron-builder...${NC}"
  npm install --save-dev electron-builder
fi
echo -e "${GREEN}  ✅ electron-builder ready${NC}"
echo ""

# ── Clean dist ───────────────────────────────────────────────
if [ "$CLEAN" = true ]; then
  echo "🧹 Cleaning dist-electron..."
  rm -rf "${ROOT_DIR}/dist-electron"
  echo -e "${GREEN}  ✅ Cleaned${NC}"
  echo ""
fi

# ── Build functions ──────────────────────────────────────────
build_windows() {
  echo -e "${BOLD}🪟 Building Windows installer (NSIS)...${NC}"
  local sign_flag=""
  [ "$SIGN" = true ] && sign_flag="--sign"

  node "${SCRIPT_DIR}/build-nsis.js" --arch="${ARCH}" ${sign_flag}
  echo -e "${GREEN}✅ Windows build complete${NC}"
  echo ""
}

build_macos() {
  if [[ "$(uname -s)" != "Darwin" ]]; then
    echo -e "${YELLOW}⚠️  Skipping macOS build (not running on macOS)${NC}"
    echo ""
    return
  fi

  echo -e "${BOLD}🍎 Building macOS DMG...${NC}"
  local flags=""
  [ "$SIGN" = true ]     && flags="$flags --sign"
  [ "$NOTARIZE" = true ] && flags="$flags --notarize"

  # Map arch: "both" → "universal" for DMG
  local mac_arch="$ARCH"
  [ "$ARCH" = "both" ] && mac_arch="universal"

  node "${SCRIPT_DIR}/build-dmg.js" --arch="${mac_arch}" ${flags}
  echo -e "${GREEN}✅ macOS build complete${NC}"
  echo ""
}

build_linux() {
  echo -e "${BOLD}🐧 Building Linux AppImage + deb + rpm...${NC}"
  node "${SCRIPT_DIR}/build-appimage.js" --arch="${ARCH}" --target=all
  echo -e "${GREEN}✅ Linux build complete${NC}"
  echo ""
}

# ── Run builds ───────────────────────────────────────────────
case "$TARGET" in
  windows) build_windows ;;
  macos)   build_macos ;;
  linux)   build_linux ;;
  all)
    build_windows
    build_macos
    build_linux
    ;;
  *)
    echo -e "${RED}❌ Unknown target: ${TARGET}${NC}"
    echo "   Valid targets: windows, macos, linux, all"
    exit 1
    ;;
esac

# ── Summary ──────────────────────────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║               Build Summary                  ║${NC}"
echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════════╝${NC}"
echo ""

OUTPUT_DIR="${ROOT_DIR}/dist-electron"
if [ -d "$OUTPUT_DIR" ]; then
  echo "📁 Output files in dist-electron/:"
  find "$OUTPUT_DIR" -maxdepth 1 -type f \( \
    -name "*.exe" -o -name "*.dmg" -o -name "*.AppImage" \
    -o -name "*.deb" -o -name "*.rpm" -o -name "*.snap" \
  \) | while read -r file; do
    SIZE=$(du -sh "$file" | cut -f1)
    echo -e "  ${GREEN}📦${NC} $(basename "$file") (${SIZE})"
  done
else
  echo -e "${YELLOW}  No output files found.${NC}"
fi

echo ""
echo -e "${GREEN}${BOLD}✨ All builds completed successfully!${NC}"
