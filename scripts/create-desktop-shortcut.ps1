$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $PSScriptRoot
$target = Join-Path $projectPath 'Start UniX.cmd'
$shortcutPath = Join-Path ([Environment]::GetFolderPath('Desktop')) 'UniX.lnk'
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $target
$shortcut.WorkingDirectory = $projectPath
$shortcut.IconLocation = (Join-Path $projectPath 'release\win-unpacked\UniX.exe')
$shortcut.Save()
Write-Host "Desktop-Verknüpfung erstellt: $shortcutPath"
