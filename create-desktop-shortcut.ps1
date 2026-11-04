$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "Indian Bison CRM.lnk"

$edgeX86 = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$edgeX64 = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
$chrome  = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$batPath = "C:\Users\direc\.gemini\antigravity\scratch\greater-noida-dental-leads\Launch-Indian-Bison-CRM.bat"

$targetExe = $batPath
$targetArgs = ""
$iconLoc = "shell32.dll,13"

if (Test-Path $chrome) {
    $targetExe = $chrome
    $targetArgs = "--app=https://indian-bison-crm-2026.web.app --window-size=1440,920"
    $iconLoc = "$chrome,0"
} elseif (Test-Path $edgeX86) {
    $targetExe = $edgeX86
    $targetArgs = "--app=https://indian-bison-crm-2026.web.app --window-size=1440,920"
    $iconLoc = "$edgeX86,0"
} elseif (Test-Path $edgeX64) {
    $targetExe = $edgeX64
    $targetArgs = "--app=https://indian-bison-crm-2026.web.app --window-size=1440,920"
    $iconLoc = "$edgeX64,0"
}

$wsh = New-Object -ComObject WScript.Shell
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $targetExe
if ($targetArgs -ne "") {
    $shortcut.Arguments = $targetArgs
}
$shortcut.WorkingDirectory = "C:\Users\direc\.gemini\antigravity\scratch\greater-noida-dental-leads"
$shortcut.Description = "Indian Bison - Local Business Lead Engine and WhatsApp Outreach CRM"
$shortcut.IconLocation = $iconLoc
$shortcut.Save()

Write-Output "Created Desktop Shortcut at: $shortcutPath"
