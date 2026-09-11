$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $PSScriptRoot
$exe = Join-Path $projectPath 'release\win-unpacked\UniX.exe'
if (-not (Test-Path -LiteralPath $exe -PathType Leaf)) {
  throw 'UniX.exe fehlt. Bitte zuerst npm ci und npm run pack ausführen oder den Installer verwenden.'
}
Start-Process -FilePath $exe -WorkingDirectory (Split-Path -Parent $exe) -WindowStyle Normal | Out-Null
Write-Host 'UniX wurde geöffnet.'
