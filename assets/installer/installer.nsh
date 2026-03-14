; ZENO Browser - NSIS Installer Script
; Custom dialog and install logic include file
; This file is included by electron-builder's NSIS process

; ============================================================
; Custom macros and functions for ZENO Browser installer
; ============================================================

; Check if ZENO Browser is already running
!macro CheckRunning
  FindWindow $0 "" "ZENO Browser"
  StrCmp $0 0 NotRunning
    MessageBox MB_ICONEXCLAMATION|MB_YESNO "ZENO Browser is currently running. Please close it before continuing.$\n$\nClick Yes to close ZENO Browser automatically, or No to exit the installer." IDYES KillProcess
    Quit
  KillProcess:
    DetailPrint "Closing ZENO Browser..."
    SendMessage $0 ${WM_CLOSE} 0 0
    Sleep 2000
  NotRunning:
!macroend

; Register as default browser (optional, user-prompted)
!macro RegisterDefaultBrowser
  WriteRegStr HKLM "SOFTWARE\RegisteredApplications" "ZENO Browser" "SOFTWARE\ZENO Browser\Capabilities"
  WriteRegStr HKLM "SOFTWARE\ZENO Browser\Capabilities" "ApplicationDescription" "AI-powered browser with multi-model integration"
  WriteRegStr HKLM "SOFTWARE\ZENO Browser\Capabilities" "ApplicationIcon" "$INSTDIR\ZENO Browser.exe,0"
  WriteRegStr HKLM "SOFTWARE\ZENO Browser\Capabilities\URLAssociations" "http" "ZenoBrowserURL"
  WriteRegStr HKLM "SOFTWARE\ZENO Browser\Capabilities\URLAssociations" "https" "ZenoBrowserURL"
  WriteRegStr HKLM "SOFTWARE\Classes\ZenoBrowserURL" "" "ZENO Browser URL"
  WriteRegStr HKLM "SOFTWARE\Classes\ZenoBrowserURL\shell\open\command" "" '"$INSTDIR\ZENO Browser.exe" "%1"'
!macroend

; Auto-start entry (optional)
!macro AddAutoStart
  WriteRegStr HKCU "SOFTWARE\Microsoft\Windows\CurrentVersion\Run" "ZENO Browser" '"$INSTDIR\ZENO Browser.exe" --minimized'
!macroend

; Remove auto-start entry
!macro RemoveAutoStart
  DeleteRegValue HKCU "SOFTWARE\Microsoft\Windows\CurrentVersion\Run" "ZENO Browser"
!macroend
