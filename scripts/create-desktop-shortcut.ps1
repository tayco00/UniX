$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $PSScriptRoot
$exePath = Join-Path $projectPath 'release\win-unpacked\UniX.exe'
if (-not (Test-Path -LiteralPath $exePath -PathType Leaf)) { throw 'Zuerst npm run pack ausfuehren.' }
$shortcutPath = Join-Path ([Environment]::GetFolderPath('Desktop')) 'UniX.lnk'
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $exePath
$shortcut.WorkingDirectory = Split-Path -Parent $exePath
$shortcut.IconLocation = "$exePath,0"
$shortcut.Description = 'UniX'
$shortcut.Save()
Write-Host "Desktop-Verknuepfung erstellt: $shortcutPath"
