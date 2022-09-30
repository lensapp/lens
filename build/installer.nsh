!macro customInit
  ; Make sure all old extensions are removed
  RMDir /r "$INSTDIR\resources\extensions"
  ; Workaround for old node_modules having already duplicate extensions
  RMDir /r "$APPDATA\${APP_FILENAME}\node_modules\lens-license"
  RMDir /r "$APPDATA\${APP_FILENAME}\node_modules\lens-survey"
  RMDir /r "$APPDATA\${APP_FILENAME}\node_modules\lens-telemetry"

  ; Workaround for installer handing when the app directory is removed manually
  ${ifNot} ${FileExists} "$INSTDIR"
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\{${UNINSTALL_APP_KEY}}"
  ${EndIf}

  ; Workaround for the old-format uninstall registry key (some people report it causes hangups, too)
  ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "QuietUninstallString"
  StrCmp $0 "" proceed 0
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}"
  proceed:
!macroend