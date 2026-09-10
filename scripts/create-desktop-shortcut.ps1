$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $PSScriptRoot
$exePath = Join-Path $projectPath 'release\win-unpacked\UniX.exe'
if (-not (Test-Path -LiteralPath $exePath -PathType Leaf)) { throw 'Zuerst npm run pack ausführen.' }
$desktopPath = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktopPath 'UniX.lnk'
$shell = New-Object -ComObject WScript.Shell
if (Test-Path -LiteralPath $shortcutPath) {
  $existing = $shell.CreateShortcut($shortcutPath)
  if ($existing.TargetPath -ne $exePath) { throw 'Eine andere UniX-Verknüpfung besteht bereits. Sie wurde nicht überschrieben.' }
}
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $exePath
$shortcut.WorkingDirectory = Split-Path -Parent $exePath
$shortcut.IconLocation = "$exePath,0"
$shortcut.Description = 'UniX - dein lokaler Studienplaner'
$shortcut.Save()
Write-Host "Desktop-Verknüpfung erstellt: $shortcutPath"
