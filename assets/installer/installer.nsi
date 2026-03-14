; ZENO Browser - Custom NSIS Installer Script
; This script extends the electron-builder generated installer
; with additional pages and functionality

!include "MUI2.nsh"
!include "installer.nsh"

; ── General ─────────────────────────────────────────────────
Name "ZENO Browser"
BrandingText "ZENO Browser © 2026 - AI-Powered Browsing"

; ── Welcome Page ────────────────────────────────────────────
!define MUI_WELCOMEPAGE_TITLE "Welcome to ZENO Browser Setup"
!define MUI_WELCOMEPAGE_TEXT "This wizard will install ZENO Browser on your computer.$\r$\n$\r$\nZENO Browser is an AI-powered browser with multi-model integration, supporting Gemini, GPT-4, Claude, and local models.$\r$\n$\r$\nClick Next to continue."

; ── Finish Page ─────────────────────────────────────────────
!define MUI_FINISHPAGE_TITLE "ZENO Browser Successfully Installed"
!define MUI_FINISHPAGE_TEXT "ZENO Browser has been installed on your computer.$\r$\n$\r$\nClick Finish to close this wizard and launch ZENO Browser."
!define MUI_FINISHPAGE_RUN "$INSTDIR\ZENO Browser.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Launch ZENO Browser"
!define MUI_FINISHPAGE_LINK "Visit zenbrowsers.org"
!define MUI_FINISHPAGE_LINK_LOCATION "https://zenbrowsers.org"

; ── Pre-install check ────────────────────────────────────────
Function .onInit
  !insertmacro CheckRunning
FunctionEnd

; ── Post-install ─────────────────────────────────────────────
Section "Desktop Shortcut"
  CreateShortCut "$DESKTOP\ZENO Browser.lnk" "$INSTDIR\ZENO Browser.exe" "" "$INSTDIR\ZENO Browser.exe" 0
SectionEnd

Section "Register URL Handler"
  !insertmacro RegisterDefaultBrowser
SectionEnd

; ── Uninstaller ──────────────────────────────────────────────
Section "Uninstall"
  !insertmacro RemoveAutoStart
  DeleteRegKey HKLM "SOFTWARE\ZENO Browser"
  DeleteRegValue HKLM "SOFTWARE\RegisteredApplications" "ZENO Browser"
  Delete "$DESKTOP\ZENO Browser.lnk"
  Delete "$SMPROGRAMS\ZENO Browser\ZENO Browser.lnk"
  RMDir "$SMPROGRAMS\ZENO Browser"
  MessageBox MB_ICONINFORMATION "ZENO Browser has been uninstalled.$\n$\nYour bookmarks and settings have been preserved."
SectionEnd
