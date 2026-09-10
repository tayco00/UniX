$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $PSScriptRoot
$exePath = Join-Path $projectPath 'release\win-unpacked\UniX.exe'
if (-not (Test-Path -LiteralPath $exePath -PathType Leaf)) {
  throw 'UniX.exe fehlt. Bitte zuerst npm ci und npm run pack ausfuehren oder den Windows-Installer verwenden.'
}
# The native application enforces a single instance and focuses an existing window.
Start-Process -FilePath $exePath -WorkingDirectory (Split-Path -Parent $exePath) -WindowStyle Normal | Out-Null
Write-Host 'UniX wurde geoeffnet. Zum Beenden das Fenster schliessen oder Stop UniX.cmd verwenden.'
